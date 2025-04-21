import {
  TransactionMessage,
  VersionedTransaction,
  PublicKey,
  TransactionInstruction,
  Keypair,
  SystemProgram,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
  Blockhash,
  Signer,
  Transaction,
  Connection
} from "@solana/web3.js";
import { lookupTableProvider } from "../clients/LookupTableProvider";
import { connection, wallet, tipAcct, isMainnet, provider } from "./config";
import { IPoolKeys } from "../clients/interfaces";
import { derivePoolKeys } from "../clients/poolKeysReassigned";
import * as spl from "@solana/spl-token";
import { TOKEN_PROGRAM_ID, MAINNET_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import {
  CpmmRpcData,
  Raydium,
  CREATE_CPMM_POOL_AUTH,
  WSOLMint,
} from "@raydium-io/raydium-sdk-v2";
import * as anchor from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import path from "path";
import fs from "fs";
import { formatAmmKeysById } from "../clients/formatAmm";
import promptSync from "prompt-sync";
import { searcherClient } from "../clients/jito";
import { Bundle as JitoBundle } from "jito-ts/dist/sdk/block-engine/types.js";
import chalk from "chalk";
import { retryOperation, pause } from "../clients/utils";
import {
  closeSpecificAcc,
  checkTokenAccountExists,
  deleteKeypairFile,
  sell_pump_amm,
  sendBundleWithRetry
} from "./retrieve";
import { burnAccount } from "./utils";
import Table from "cli-table3";
import { RayCpmmSwap, IDL } from "../clients/types";
import * as RayCpmmSwapIDL from "../clients/idl.json";
import PumpSwapSDK from "../pump_swap_sdk";
import BN from "bn.js";
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountIdempotentInstruction, createSyncNativeInstruction } from "@solana/spl-token";
import bs58 from "bs58";
import dotenv from 'dotenv';

dotenv.config()

require("dotenv").config();

const DEBUG = process.env.DEBUG?.toLowerCase() === "true";
const prompt = promptSync();
const keypairsDir = "./src/keypairs";

/**
 * Ensure the keypairs directory exists
 */
if (!fs.existsSync(keypairsDir)) {
  fs.mkdirSync(keypairsDir, { recursive: true });
}

async function getTokenProgramId(mint: PublicKey): Promise<PublicKey> {
  try {
    // First check if it's a Token-2022 account
    try {
      const accountInfo = await connection.getAccountInfo(mint);
      if (accountInfo) {
        // Check the owner of the account
        if (accountInfo.owner.equals(spl.TOKEN_2022_PROGRAM_ID)) {
          console.log(`Mint ${mint.toBase58()} is a Token-2022 token`);
          return spl.TOKEN_2022_PROGRAM_ID;
        }
      }
    } catch (err: any) {
      // If there's an error, default to classic SPL Token
      console.log(`Error checking Token-2022 status: ${err.message}`);
    }

    // Default to classic SPL Token
    console.log(`Mint ${mint.toBase58()} is a classic SPL token`);
    return spl.TOKEN_PROGRAM_ID;
  } catch (error: any) {
    console.error(`Error determining token program ID: ${error.message}`);
    // Default to classic SPL Token
    return spl.TOKEN_PROGRAM_ID;
  }
}

/**
 * Loads all the keypairs from the specified directory for a given marketID.
 */
function loadKeypairs(marketID: string) {
  const keypairs: Keypair[] = [];
  const marketKeypairsPath = path.join(keypairsDir, marketID);

  if (!fs.existsSync(marketKeypairsPath)) {
    return keypairs; // Return empty if directory doesn't exist
  }

  const files = fs.readdirSync(marketKeypairsPath);

  files.forEach((file) => {
    if (file.endsWith(".json")) {
      const filePath = path.join(marketKeypairsPath, file);
      const fileData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const keypair = Keypair.fromSecretKey(new Uint8Array(fileData));
      keypairs.push(keypair);
    }
  });
  return keypairs;
}

/**
 * Main Extender function that prompts the user for inputs or uses config,
 * generates keypairs, calls executeSwaps, and then closes some of the accounts.
 */
export async function extender(config: any = null) {
  console.clear();
  console.log(
    chalk.green("\n==================== Buy Step ====================")
  );
  console.log(
    chalk.yellow("Follow the instructions below to perform the buy step.\n")
  );

  let marketID, minAndMaxBuy, minAndMaxSell, cyclesIn, delayIn, jitoTipAmtInput, isPumpToken, basemint;
  let isPumpSwap = false;
  if (config) {
    isPumpSwap = true;
    basemint = config.basemint;
    marketID = config.marketID;
    minAndMaxBuy = config.minAndMaxBuy;
    minAndMaxSell = config.minAndMaxSell;
    cyclesIn = config.cycles;
    delayIn = config.delay;
    jitoTipAmtInput = config.jitoTipAmt.toString();
  } else {
    isPumpToken = prompt(chalk.cyan("Is it PumpSwap?: y/n "));
    if (isPumpToken === 'y' || isPumpToken === 'Y') {
      isPumpSwap = true;
      let basemintString = prompt(chalk.cyan("Input basemint:"));
      basemint = new PublicKey(basemintString);
      jitoTipAmtInput = prompt(chalk.cyan("Jito tip in Sol (Ex. 0.01): "));
    } else {
      marketID = prompt(chalk.cyan("Enter your Pair ID: "));
    }
    minAndMaxBuy = prompt(
      chalk.cyan(
        "Enter the amount of min and max amount you want to BUY (syntax: MIN_AMOUNT MAX_AMOUNT): "
      )
    );
    minAndMaxSell = prompt(
      chalk.cyan(
        "Enter the amount wallets you want to sell per cycle(syntax: MIN_AMOUNT MAX_AMOUNT): "
      )
    );
    delayIn = prompt(
      chalk.cyan(
        "Min and Max Delay between swaps in seconds Example MIN_DELAY MAX_DELAY: "
      )
    );
    cyclesIn = prompt(chalk.cyan("Number of bundles to perform (Ex. 50): "));
  }

  const jitoTipAmt = parseFloat(jitoTipAmtInput) * LAMPORTS_PER_SOL;

  if (jitoTipAmtInput) {
    const tipValue = parseFloat(jitoTipAmtInput);
    if (tipValue >= 0.1) {
      console.log(
        chalk.red(
          "Error: Tip value is too high. Please enter a value less than or equal to 0.1."
        )
      );
      process.exit(0x0);
    }
  } else {
    console.log(
      chalk.red("Error: Invalid input. Please enter a valid number.")
    );
    process.exit(0x0);
  }

  const cycles = parseFloat(cyclesIn);
  
  const marketKeypairsDir = path.join(keypairsDir, isPumpSwap? basemint?.toBase58(): marketID);
  if (!fs.existsSync(marketKeypairsDir)) {
    fs.mkdirSync(marketKeypairsDir, { recursive: true });
  }

  const backupDir = path.join(path.dirname(keypairsDir), "backup", isPumpSwap? basemint?.toBase58(): marketID);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Get the wallet's initial balance
  let walletBalance = 0;
  try {
    walletBalance =
      (await connection.getBalance(wallet.publicKey)) / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error(chalk.red("Error fetching wallet balance:"), error);
  }
  const initialBalance = walletBalance;
  console.log(
    chalk.green(`Initial Wallet Balance: ${initialBalance.toFixed(3)} SOL`)
  );

  for (let i = 0; i < cycles; i++) {
    console.log("");
    console.log(`-------------------------------------- ${i + 1} ---------------------------------------------`);
    console.log("");
    
    const buyAmounts = minAndMaxBuy.split(" ").map(Number);
    const delayAmounts = delayIn.split(" ").map(Number);
    const sellAmounts = minAndMaxSell.split(" ").map(Number); 

    const buyAmount = getRandomNumber(buyAmounts[0], buyAmounts[1]);
    const delay = getRandomNumber(delayAmounts[0], delayAmounts[1]);
    const sellAmount = getRandomNumber(sellAmounts[0], sellAmounts[1]);

    // Generate new keypair(s) for the BUY step
    const keypairs: Keypair[] = [];
    for (let j = 0; j < 1; j++) {
      const keypair = Keypair.generate();
      if (isValidSolanaAddress(keypair.publicKey)) {
        keypairs.push(keypair);

        const filename = `keypair-${keypair.publicKey.toString()}.json`;
        const filePath = path.join(marketKeypairsDir, filename);
        fs.writeFileSync(
          filePath,
          JSON.stringify(Array.from(keypair.secretKey))
        );
      } else {
        console.error(chalk.red("Invalid keypair generated, skipping..."));
      }
    }

    // Get the latest blockhash with retry logic
    let blockhash = "";
    try {
      blockhash = (await retryOperation(() => connection.getLatestBlockhash()))
        .blockhash;
    } catch (error) {
      console.error(chalk.red("Error fetching latest blockhash:"), error);
      continue; // Skip this iteration and move to the next cycle
    }
    console.log("----------- swap --------------------");
    
    try {
      // Execute the actual buy
      if (basemint) {
        await buy_pump_amm(basemint, keypairs, blockhash, buyAmount)
      } else {
        console.error(chalk.red("Pump AMM token invalid."));
      }
      
    } catch (error) {
      console.error(chalk.red("Error executing swaps:"), error);
    }

    /**
     * After the BUY step, we pick older keypairs (>=30s old) to SELL/close the accounts.
     */
    let sellKeypairs = new Set<Keypair>();
    const files = fs.readdirSync(marketKeypairsDir);
    console.log("----------- close keypair --------------------");

    for (const file of files) {
      const filePath = path.join(marketKeypairsDir, file);
      const stats = fs.statSync(filePath);
      const creationTime = new Date(stats.birthtime).getTime();
      const currentTime = Date.now();

      if (currentTime - creationTime >= 30000) {
        const keypairData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));
        const WSOLataKeypair = await spl.getAssociatedTokenAddress(
          spl.NATIVE_MINT,
          keypair.publicKey
        );

        let tokenAccountExists = false;
        try {
          tokenAccountExists = await checkTokenAccountExists(WSOLataKeypair);
        } catch (error) {
          console.error(
            chalk.red("Error checking token account existence:"),
            error
          );
        }

        if (tokenAccountExists) {
          sellKeypairs.add(keypair);
        } else {
          console.log(
            chalk.yellow(
              `Skipping empty keypair: ${keypair.publicKey.toString()}`
            )
          );
          deleteKeypairFile(keypair, marketKeypairsDir);
        }
      }

      if (sellKeypairs.size >= sellAmount) break; // Limit to specified sellAmount per cycle
    }

    const sellKeypairList = Array.from(sellKeypairs) as Keypair[];
    while (sellKeypairList.length > 0) {
      const chunk = sellKeypairList.splice(0, 5);
      try {
        if (basemint) {
          await closePumpSwapAcc(chunk, basemint);
        }
      
        await new Promise((resolve) => setTimeout(resolve, 6000)); // Small delay between chunks
      } catch (error) {
        console.error(chalk.red("Error closing accounts:"), error);
      }
    }

    // Delay between cycles
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
    console.log(
      chalk.green(
        `Sent buy #${i + 1} transaction of ${buyAmount.toFixed(
          5
        )} SOL. Waiting ${delay} seconds before next buy...`
      )
    );

    // Update wallet balance
    try {
      walletBalance =
        (await connection.getBalance(wallet.publicKey)) / LAMPORTS_PER_SOL;
      console.log(
        chalk.green(
          `Wallet Balance after buy #${i + 1}: ${walletBalance.toFixed(3)} SOL`
        )
      );
    } catch (error) {
      console.error(chalk.red("Error fetching wallet balance:"), error);
    }
  }

  console.log(chalk.green("\nExecution completed."));
  console.log(chalk.green("Returning to main menu..."));
  await pause();
}

export async function makeCPMMSwap(
  connection: any,
  poolId: PublicKey,
  poolInfo: CpmmRpcData,
  token0: PublicKey,
  token0ATA: PublicKey,
  token1: PublicKey,
  token1ATA: PublicKey,
  creator: Signer,
  direction: "buy" | "sell"
) {
  const confirmOptions = {
    skipPreflight: true,
  };
  const programId = new PublicKey(
    "4UChYHQmJ9LJAK547uiXhxuJtq5sFrVAsvfgKRsd6veo"
  ); // Example: your program ID

  //const raydiumCPMMProgram = new PublicKey("CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C");
  const rayprogram_id = new PublicKey(
    "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
  );
  const authority = CREATE_CPMM_POOL_AUTH;
  const poolState = poolId;

  // Based on direction, pick input vs output
  const inputTokenAccount = direction === "buy" ? token0ATA : token1ATA;
  const outputTokenAccount = direction === "sell" ? token0ATA : token1ATA;
  const inputTokenMint = direction === "buy" ? token0 : token1;
  const outputTokenMint = direction === "sell" ? token0 : token1;

  // Identify the correct vaults and mint programs
  const inputVault = poolInfo.mintA.equals(inputTokenMint)
    ? poolInfo.vaultA
    : poolInfo.vaultB;
  const outputVault = poolInfo.mintA.equals(outputTokenMint)
    ? poolInfo.vaultA
    : poolInfo.vaultB;

  const inputTokenProgram = poolInfo.mintA.equals(inputTokenMint)
    ? poolInfo.mintProgramA
    : poolInfo.mintProgramB;
  const outputTokenProgram = poolInfo.mintA.equals(outputTokenMint)
    ? poolInfo.mintProgramA
    : poolInfo.mintProgramB;
  const observationState = poolInfo.observationId;

  // Build an Anchor provider

  const program = new anchor.Program(
    IDL as unknown as anchor.Idl,
    provider
  );
  console.log("Debugging account values:");
  console.log("token1ATA", token1ATA);
  console.log("token0ATA", token0ATA);

  console.log(
    "cpSwapProgram:",
    rayprogram_id ? rayprogram_id.toString() : "undefined"
  );
  console.log(
    "payer:",
    creator.publicKey ? creator.publicKey.toString() : "undefined"
  );
  console.log("authority:", authority ? authority.toString() : "undefined");
  console.log(
    "ammConfig:",
    poolInfo && poolInfo.configId ? poolInfo.configId.toString() : "undefined"
  );
  console.log("poolState:", poolState ? poolState.toString() : "undefined");
  console.log(
    "inputTokenAccount:",
    inputTokenAccount ? inputTokenAccount.toString() : "undefined"
  );
  console.log(
    "outputTokenAccount:",
    outputTokenAccount ? outputTokenAccount.toString() : "undefined"
  );
  console.log("inputVault:", inputVault ? inputVault.toString() : "undefined");
  console.log(
    "outputVault:",
    outputVault ? outputVault.toString() : "undefined"
  );
  console.log(
    "inputTokenProgram:",
    inputTokenProgram ? inputTokenProgram.toString() : "undefined"
  );
  console.log(
    "outputTokenProgram:",
    outputTokenProgram ? outputTokenProgram.toString() : "undefined"
  );
  console.log(
    "inputTokenMint:",
    inputTokenMint ? inputTokenMint.toString() : "undefined"
  );
  console.log(
    "outputTokenMint:",
    outputTokenMint ? outputTokenMint.toString() : "undefined"
  );
  console.log(
    "observationState:",
    observationState ? observationState.toString() : "undefined"
  );

  // This example sets the amounts to 0 => adjust to pass real BN amounts
  const swapIx = await program.methods
    .performSwap(new anchor.BN(0), 0)
    .accounts({
      cpSwapProgram: rayprogram_id,
      payer: creator.publicKey,
      authority,
      ammConfig: poolInfo.configId,
      poolState,
      inputTokenAccount,
      outputTokenAccount,
      inputVault,
      outputVault,
      inputTokenProgram,
      outputTokenProgram,
      inputTokenMint,
      outputTokenMint,
      observationState,
    })
    .instruction();

  return { swapIxs: [swapIx] };
}

/**
 * Sends a bundle of VersionedTransactions using the Jito searcherClient.
 */
export async function sendBundle(bundledTxns: VersionedTransaction[]) {
  try {
    const bundleId = await searcherClient.sendBundle(
      new JitoBundle(bundledTxns, bundledTxns.length)
    );
    console.log(`Swap with BundleID ${bundleId} sent.`);
  } catch (error) {
    const err = error as any;
    console.error("Error sending bundle:", err.message);

    if (err?.message?.includes("Bundle Dropped, no connected leader up soon")) {
      console.error(
        "Error sending bundle: Bundle Dropped, no connected leader up soon."
      );
    } else {
      console.error("An unexpected error occurred:", err.message);
    }
  }
}

/**
 * Utility to produce a random number within [min, max], with 1 decimal place.
 */
function getRandomNumber(min: number, max: number) {
  const range = max - min;
  const decimal = Math.floor(Math.random() * (range * 10 + 1)) / 10;
  return min + decimal;
}

/**
 * Checks if a given PublicKey is a valid Solana address.
 */
function isValidSolanaAddress(address: PublicKey) {
  try {
    new PublicKey(address); // Will throw if invalid
    return true;
  } catch (e) {
    return false;
  }
}

export const buy_pump_amm = async (base_mint: PublicKey, keypairs: Keypair[], block: string | Blockhash, buyAmount: number) => {
  
}

export const closePumpSwapAcc = async (keypairs: Keypair[], baseMint: PublicKey) => {

  
}