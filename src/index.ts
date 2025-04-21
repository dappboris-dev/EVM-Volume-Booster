import * as web3 from "@solana/web3.js";
import dotenv from 'dotenv';
import { extender } from './src/bot';

dotenv.config();

(async () => {
  await extender(
    {
      isPumpToken: "y",
      basemint: new web3.PublicKey("Frno4J9Yqdf8uwQKziNyybSQz4bD73mTsmiHQWxhJwGM"),
      minAndMaxBuy: "0.00001 0.00001",
      minAndMaxSell: "0.00001 0.00001",
      delay: "2 3",
      jitoTipAmt: "0.01",
      cycles: 3,
      marketID: "Frno4J9Yqdf8uwQKziNyybSQz4bD73mTsmiHQWxhJwGM"
    }
  );
})();
