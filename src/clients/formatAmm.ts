import { ApiPoolInfoV4, LIQUIDITY_STATE_LAYOUT_V4, Liquidity, MARKET_STATE_LAYOUT_V3, Market, SPL_MINT_LAYOUT } from "@raydium-io/raydium-sdk";
import { PublicKey, Keypair, TransactionInstruction, VersionedTransaction } from "@solana/web3.js";
import { retryOperation } from "./utils";

import { RayLiqPoolv4, connection, wallet } from "../src/config";

// -------------- formatAmmKeysById.ts (same as your original code) --------------
export async function formatAmmKeysById(id: string): Promise<ApiPoolInfoV4> {
	const account = await retryOperation(() => connection.getAccountInfo(new PublicKey(id)));
	if (account === null) throw Error("Error getting account info for ID");

	const info = LIQUIDITY_STATE_LAYOUT_V4.decode(account.data);

	const marketId = info.marketId;
	const marketAccount = await retryOperation(() => connection.getAccountInfo(marketId));
	if (marketAccount === null) throw Error("Error getting market account info");
	const marketInfo = MARKET_STATE_LAYOUT_V3.decode(marketAccount.data);

	const lpMint = info.lpMint;
	const lpMintAccount = await retryOperation(() => connection.getAccountInfo(lpMint));
	if (lpMintAccount === null) throw Error("Error getting LP mint account info");
	const lpMintInfo = SPL_MINT_LAYOUT.decode(lpMintAccount.data);

	return {
		id,
		baseMint: info.baseMint.toString(),
		quoteMint: info.quoteMint.toString(),
		lpMint: info.lpMint.toString(),
		baseDecimals: info.baseDecimal.toNumber(),
		quoteDecimals: info.quoteDecimal.toNumber(),
		lpDecimals: lpMintInfo.decimals,
		version: 4,
		programId: account.owner.toString(),
		authority: Liquidity.getAssociatedAuthority({ programId: account.owner }).publicKey.toString(),
		openOrders: info.openOrders.toString(),
		targetOrders: info.targetOrders.toString(),
		baseVault: info.baseVault.toString(),
		quoteVault: info.quoteVault.toString(),
		withdrawQueue: info.withdrawQueue.toString(),
		lpVault: info.lpVault.toString(),
		marketVersion: 3,
		marketProgramId: info.marketProgramId.toString(),
		marketId: info.marketId.toString(),
		marketAuthority: Market.getAssociatedAuthority({
			programId: info.marketProgramId,
			marketId: info.marketId,
		}).publicKey.toString(),
		marketBaseVault: marketInfo.baseVault.toString(),
		marketQuoteVault: marketInfo.quoteVault.toString(),
		marketBids: marketInfo.bids.toString(),
		marketAsks: marketInfo.asks.toString(),
		marketEventQueue: marketInfo.eventQueue.toString(),
		lookupTableAccount: PublicKey.default.toString(),
	};
}
