import { amountMax, amountMin, fee, maxInterval, minInterval } from "./config";
import { BASE_WALLET_ADDRESS, BSC_ENDPOINT, ETH_ENDPOINT, PANCAKE_ROUTER_V2, routers, RPCs, UNISWAP_ROUTER_V2, WBNB_ADDRESS, WETH_ADDRESS, WETH_ADDRESS_SEPOLIA } from "./constants";
import { get_erc20_abi } from "./fetchAbi";
import { ChainId } from "./types";
import { Provider, Wallet, ethers } from 'ethers';
import fs from 'fs';

export function getRpc(chainId: ChainId) {
  return RPCs[chainId];
}

export function getRouterAddress(chainId: ChainId, version?: number) {
  return routers[chainId];
}

export function getRandomDelay() {
  return Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
}

export function getRandomEthAmount() {
  return Number((Math.random() * (amountMax - amountMin) + amountMin).toFixed(6));
}


export const generateWallets = async (num: number) => {
  const wallets = [];

  for (let i = 0; i < num; i++) {
    const wallet = Wallet.createRandom();
    wallets.push({
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || "No Mnemonic", // Some wallets may not have mnemonics
      amount: getRandomEthAmount().toFixed(6),
      funded: 0
    });
  }

  // Save to JSON file
  const fileName = `./wallets/${Math.floor(Date.now() / 1000)}.json`
  console.log(`Saving Wallets in ${fileName}`);
  fs.writeFileSync(fileName, JSON.stringify(wallets, null, 2));

  console.log(`Generated ${num} wallets and saved to ${fileName}`);
  return fileName;
};

export const readingWallets = async (fileName: string) => {
  try {
    // Read the file contents
    const data = fs.readFileSync(fileName, "utf-8");

    // Parse JSON into an array
    const wallets = JSON.parse(data);
    return wallets;
  } catch (error) {
    console.error("❌ Error reading wallets file:", error);
    return [];
  }
}

export const saveWallet = async (wallet: any, fileName: string) => {
  const wallets = await readingWallets(fileName);
  const newWallets = wallets.map((item: any) => {
    if (wallet.privateKey.toLowerCase() == item.privateKey.toLowerCase())
      return wallet
    else return item
  });

  fs.writeFileSync(fileName, JSON.stringify(newWallets, null, 2));
  return fileName;
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getTokenBalance = async (tokenAddress: string, walletAddress: string, provider: Provider) => {

  const erc20Abi = get_erc20_abi();
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);

  try {
    const balance = await tokenContract.balanceOf(walletAddress);

    const balanceInDecimals = ethers.formatUnits(balance, 18); // Change 18 if token has different decimals

    console.log(`Token balance: ${balanceInDecimals} tokens`);
    return balanceInDecimals;
  } catch (error) {
    console.error("Error getting token balance:", error);
    return 0;
  }
};


export const sendEther = async (fromPrvateKey: string, to: string, amount: string, provider: Provider): Promise<boolean> => {
  const wallet = new Wallet(fromPrvateKey, provider);
  console.log({to, amount})
  const feeData = await provider.getFeeData();
  const tx: ethers.TransactionRequest = {
    to,
    value: ethers.parseEther(amount), // Convert amount to wei
    gasLimit: 21_000, // Standard gas limit for ETH transfers
    // Handle EIP-1559 if the network supports it
    ...(feeData.maxFeePerGas && feeData.maxPriorityFeePerGas
      ? {
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        }
      : {
          gasPrice: feeData.gasPrice, // Fallback for legacy chains
        }),
  };

  
  try {
    const txResponse = await wallet.sendTransaction(tx);
    const receipt = await txResponse.wait();
    console.log("Fund transferred: ", receipt?.hash);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const gather = async (wallet: any, provider: Provider) => {
  console.log("Gathering funds from", wallet.address);

  // Get balance (BigInt)
  const balance = await provider.getBalance(wallet.address);
  
  if (balance === 0n) {
    console.log("No funds available.");
    return;
  }

  // Fetch gas fee data
  const feeData = await provider.getFeeData();
  const gasLimit = 50_000n; // Standard gas limit for ETH transfer

  // Determine gas fee: Use EIP-1559 fees if available, otherwise fallback to gasPrice
  const gasFee = feeData.maxFeePerGas && feeData.maxPriorityFeePerGas
    ? gasLimit * feeData.maxFeePerGas // EIP-1559 calculation
    : gasLimit * (feeData.gasPrice ?? 0n); // Legacy transaction fallback

  // Ensure there's enough ETH to cover gas fees
  if (balance <= gasFee) {
    console.log("Not enough balance to cover gas fees.");
    return;
  }

  console.log("balance", balance.toString());
  console.log("gasFee", gasFee.toString());

  // Calculate final amount to send (balance - gasFee)
  const amountToSend = balance - gasFee;
  const etherAmount = ethers.formatEther(amountToSend); // Convert BigInt to string

  console.log(`Sending ${etherAmount} ETH after deducting gas fees.`);

  // Send ETH to BASE_WALLET_ADDRESS
  await sendEther(wallet.privateKey, BASE_WALLET_ADDRESS, etherAmount, provider);
};