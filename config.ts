import { ChainId } from "./types";

export const testVersion = false;

//Random time interval of buy and sell
export const maxInterval = 30000 //millisecond
export const minInterval = 5000//millisecond

//Random amount for wallet.
export const amountMax = 0.0009; //Ether balance
export const amountMin = 0.0002; //Should be more than 0.001

//Fee balance that must be remaining in the wallet
export const fee = 0.0001; //Must be greater than 0.001

//Number of sub wallets.
export const subWalletNum = 1;

export const expectedVolume = 1000;

//ChainId : Sepolia, BSC, Ethereum
export const CHAINID:ChainId = ChainId.Base;