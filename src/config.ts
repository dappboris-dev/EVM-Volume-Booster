import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair, Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import base58 from "bs58";
import dotenv from 'dotenv';
dotenv.config()

export const wallet = Keypair.fromSecretKey(base58.decode(process.env.PRIVATE_KEY_MAINNET || ''));
const providerWallet = new NodeWallet(wallet);
const rpc = process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com"
export const tipAcct = new PublicKey("3evPSuSwxJtyQSyM1CEF7tSyvis7x41B6uUNyEL7Rrwh");
export const RayLiqPoolv4 = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');
export const connection = new Connection(
    rpc,
    "confirmed"
);
export const provider = new anchor.AnchorProvider(connection, providerWallet, {
    commitment: "confirmed",
});
export const isMainnet = false;