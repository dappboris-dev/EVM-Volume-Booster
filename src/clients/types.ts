export type RayCpmmSwap = {
    "version": "0.1.0",
    "name": "ray_cpmm_swap",
    "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA",
    "metadata": {
        "name": "pumpAmm",
        "version": "0.1.0",
        "spec": "0.1.0",
        "description": "Created with Anchor & https://github.com/vvizardev"
    },
    "instructions": [
      {
        "name": "performSwap",
        "accounts": [
          {
            "name": "cpSwapProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "payer",
            "isMut": false,
            "isSigner": true
          },
          {
            "name": "authority",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "ammConfig",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "poolState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "inputTokenAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "outputTokenAccount",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "inputVault",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "outputVault",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "inputTokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "outputTokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "inputTokenMint",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "outputTokenMint",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "observationState",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "amountOut",
            "type": "u64"
          },
          {
            "name": "swapDirection",
            "type": "u8"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "ammConfig",
        "docs": [
          "Holds the current owner of the factory"
        ],
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "bump",
              "docs": [
                "Bump to identify PDA"
              ],
              "type": "u8"
            },
            {
              "name": "disableCreatePool",
              "docs": [
                "Status to control if new pool can be create"
              ],
              "type": "bool"
            },
            {
              "name": "index",
              "docs": [
                "Config index"
              ],
              "type": "u16"
            },
            {
              "name": "tradeFeeRate",
              "docs": [
                "The trade fee, denominated in hundredths of a bip (10^-6)"
              ],
              "type": "u64"
            },
            {
              "name": "protocolFeeRate",
              "docs": [
                "The protocol fee"
              ],
              "type": "u64"
            },
            {
              "name": "fundFeeRate",
              "docs": [
                "The fund fee, denominated in hundredths of a bip (10^-6)"
              ],
              "type": "u64"
            },
            {
              "name": "createPoolFee",
              "docs": [
                "Fee for create a new pool"
              ],
              "type": "u64"
            },
            {
              "name": "protocolOwner",
              "docs": [
                "Address of the protocol fee owner"
              ],
              "type": "publicKey"
            },
            {
              "name": "fundOwner",
              "docs": [
                "Address of the fund fee owner"
              ],
              "type": "publicKey"
            },
            {
              "name": "padding",
              "docs": [
                "padding"
              ],
              "type": {
                "array": [
                  "u64",
                  16
                ]
              }
            }
          ]
        }
      },
      {
        "name": "observationState",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "initialized",
              "docs": [
                "Whether the ObservationState is initialized"
              ],
              "type": "bool"
            },
            {
              "name": "observationIndex",
              "docs": [
                "the most-recently updated index of the observations array"
              ],
              "type": "u16"
            },
            {
              "name": "poolId",
              "type": "publicKey"
            },
            {
              "name": "observations",
              "docs": [
                "observation array"
              ],
              "type": {
                "array": [
                  {
                    "defined": "Observation"
                  },
                  100
                ]
              }
            },
            {
              "name": "padding",
              "docs": [
                "padding for feature update"
              ],
              "type": {
                "array": [
                  "u64",
                  4
                ]
              }
            }
          ]
        }
      },
      {
        "name": "poolState",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "ammConfig",
              "docs": [
                "Which config the pool belongs"
              ],
              "type": "publicKey"
            },
            {
              "name": "poolCreator",
              "docs": [
                "pool creator"
              ],
              "type": "publicKey"
            },
            {
              "name": "token0Vault",
              "docs": [
                "Token A"
              ],
              "type": "publicKey"
            },
            {
              "name": "token1Vault",
              "docs": [
                "Token B"
              ],
              "type": "publicKey"
            },
            {
              "name": "lpMint",
              "docs": [
                "Pool tokens are issued when A or B tokens are deposited.",
                "Pool tokens can be withdrawn back to the original A or B token."
              ],
              "type": "publicKey"
            },
            {
              "name": "token0Mint",
              "docs": [
                "Mint information for token A"
              ],
              "type": "publicKey"
            },
            {
              "name": "token1Mint",
              "docs": [
                "Mint information for token B"
              ],
              "type": "publicKey"
            },
            {
              "name": "token0Program",
              "docs": [
                "token_0 program"
              ],
              "type": "publicKey"
            },
            {
              "name": "token1Program",
              "docs": [
                "token_1 program"
              ],
              "type": "publicKey"
            },
            {
              "name": "observationKey",
              "docs": [
                "observation account to store oracle data"
              ],
              "type": "publicKey"
            },
            {
              "name": "authBump",
              "type": "u8"
            },
            {
              "name": "status",
              "docs": [
                "Bitwise representation of the state of the pool",
                "bit0, 1: disable deposit(vaule is 1), 0: normal",
                "bit1, 1: disable withdraw(vaule is 2), 0: normal",
                "bit2, 1: disable swap(vaule is 4), 0: normal"
              ],
              "type": "u8"
            },
            {
              "name": "lpMintDecimals",
              "type": "u8"
            },
            {
              "name": "mint0Decimals",
              "docs": [
                "mint0 and mint1 decimals"
              ],
              "type": "u8"
            },
            {
              "name": "mint1Decimals",
              "type": "u8"
            },
            {
              "name": "lpSupply",
              "docs": [
                "True circulating supply without burns and lock ups"
              ],
              "type": "u64"
            },
            {
              "name": "protocolFeesToken0",
              "docs": [
                "The amounts of token_0 and token_1 that are owed to the liquidity provider."
              ],
              "type": "u64"
            },
            {
              "name": "protocolFeesToken1",
              "type": "u64"
            },
            {
              "name": "fundFeesToken0",
              "type": "u64"
            },
            {
              "name": "fundFeesToken1",
              "type": "u64"
            },
            {
              "name": "openTime",
              "docs": [
                "The timestamp allowed for swap in the pool."
              ],
              "type": "u64"
            },
            {
              "name": "recentEpoch",
              "docs": [
                "recent epoch"
              ],
              "type": "u64"
            },
            {
              "name": "padding",
              "docs": [
                "padding for future updates"
              ],
              "type": {
                "array": [
                  "u64",
                  31
                ]
              }
            }
          ]
        }
      }
    ],
    "types": [
      {
        "name": "Observation",
        "docs": [
          "The element of observations in ObservationState"
        ],
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "blockTimestamp",
              "docs": [
                "The block timestamp of the observation"
              ],
              "type": "u64"
            },
            {
              "name": "cumulativeToken0PriceX32",
              "docs": [
                "the cumulative of token0 price during the duration time, Q32.32, the remaining 64 bit for overflow"
              ],
              "type": "u128"
            },
            {
              "name": "cumulativeToken1PriceX32",
              "docs": [
                "the cumulative of token1 price during the duration time, Q32.32, the remaining 64 bit for overflow"
              ],
              "type": "u128"
            }
          ]
        }
      }
    ]
  };
  
  export const IDL: RayCpmmSwap = {
    "version": "0.1.0",
    "name": "ray_cpmm_swap",
    "instructions": [
      {
        "name": "performSwap",
        "accounts": [
          {
            "name": "cpSwapProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "payer",
            "isMut": false,
            "isSigner": true
          },
          {
            "name": "authority",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "ammConfig",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "poolState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "inputTokenAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "outputTokenAccount",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "inputVault",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "outputVault",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "inputTokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "outputTokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "inputTokenMint",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "outputTokenMint",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "observationState",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "amountOut",
            "type": "u64"
          },
          {
            "name": "swapDirection",
            "type": "u8"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "ammConfig",
        "docs": [
          "Holds the current owner of the factory"
        ],
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "bump",
              "docs": [
                "Bump to identify PDA"
              ],
              "type": "u8"
            },
            {
              "name": "disableCreatePool",
              "docs": [
                "Status to control if new pool can be create"
              ],
              "type": "bool"
            },
            {
              "name": "index",
              "docs": [
                "Config index"
              ],
              "type": "u16"
            },
            {
              "name": "tradeFeeRate",
              "docs": [
                "The trade fee, denominated in hundredths of a bip (10^-6)"
              ],
              "type": "u64"
            },
            {
              "name": "protocolFeeRate",
              "docs": [
                "The protocol fee"
              ],
              "type": "u64"
            },
            {
              "name": "fundFeeRate",
              "docs": [
                "The fund fee, denominated in hundredths of a bip (10^-6)"
              ],
              "type": "u64"
            },
            {
              "name": "createPoolFee",
              "docs": [
                "Fee for create a new pool"
              ],
              "type": "u64"
            },
            {
              "name": "protocolOwner",
              "docs": [
                "Address of the protocol fee owner"
              ],
              "type": "publicKey"
            },
            {
              "name": "fundOwner",
              "docs": [
                "Address of the fund fee owner"
              ],
              "type": "publicKey"
            },
            {
              "name": "padding",
              "docs": [
                "padding"
              ],
              "type": {
                "array": [
                  "u64",
                  16
                ]
              }
            }
          ]
        }
      },
      {
        "name": "observationState",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "initialized",
              "docs": [
                "Whether the ObservationState is initialized"
              ],
              "type": "bool"
            },
            {
              "name": "observationIndex",
              "docs": [
                "the most-recently updated index of the observations array"
              ],
              "type": "u16"
            },
            {
              "name": "poolId",
              "type": "publicKey"
            },
            {
              "name": "observations",
              "docs": [
                "observation array"
              ],
              "type": {
                "array": [
                  {
                    "defined": "Observation"
                  },
                  100
                ]
              }
            },
            {
              "name": "padding",
              "docs": [
                "padding for feature update"
              ],
              "type": {
                "array": [
                  "u64",
                  4
                ]
              }
            }
          ]
        }
      },
      {
        "name": "poolState",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "ammConfig",
              "docs": [
                "Which config the pool belongs"
              ],
              "type": "publicKey"
            },
            {
              "name": "poolCreator",
              "docs": [
                "pool creator"
              ],
              "type": "publicKey"
            },
            {
              "name": "token0Vault",
              "docs": [
                "Token A"
              ],
              "type": "publicKey"
            },
            {
              "name": "token1Vault",
              "docs": [
                "Token B"
              ],
              "type": "publicKey"
            },
            {
              "name": "lpMint",
              "docs": [
                "Pool tokens are issued when A or B tokens are deposited.",
                "Pool tokens can be withdrawn back to the original A or B token."
              ],
              "type": "publicKey"
            },
            {
              "name": "token0Mint",
              "docs": [
                "Mint information for token A"
              ],
              "type": "publicKey"
            },
            {
              "name": "token1Mint",
              "docs": [
                "Mint information for token B"
              ],
              "type": "publicKey"
            },
            {
              "name": "token0Program",
              "docs": [
                "token_0 program"
              ],
              "type": "publicKey"
            },
            {
              "name": "token1Program",
              "docs": [
                "token_1 program"
              ],
              "type": "publicKey"
            },
            {
              "name": "observationKey",
              "docs": [
                "observation account to store oracle data"
              ],
              "type": "publicKey"
            },
            {
              "name": "authBump",
              "type": "u8"
            },
            {
              "name": "status",
              "docs": [
                "Bitwise representation of the state of the pool",
                "bit0, 1: disable deposit(vaule is 1), 0: normal",
                "bit1, 1: disable withdraw(vaule is 2), 0: normal",
                "bit2, 1: disable swap(vaule is 4), 0: normal"
              ],
              "type": "u8"
            },
            {
              "name": "lpMintDecimals",
              "type": "u8"
            },
            {
              "name": "mint0Decimals",
              "docs": [
                "mint0 and mint1 decimals"
              ],
              "type": "u8"
            },
            {
              "name": "mint1Decimals",
              "type": "u8"
            },
            {
              "name": "lpSupply",
              "docs": [
                "True circulating supply without burns and lock ups"
              ],
              "type": "u64"
            },
            {
              "name": "protocolFeesToken0",
              "docs": [
                "The amounts of token_0 and token_1 that are owed to the liquidity provider."
              ],
              "type": "u64"
            },
            {
              "name": "protocolFeesToken1",
              "type": "u64"
            },
            {
              "name": "fundFeesToken0",
              "type": "u64"
            },
            {
              "name": "fundFeesToken1",
              "type": "u64"
            },
            {
              "name": "openTime",
              "docs": [
                "The timestamp allowed for swap in the pool."
              ],
              "type": "u64"
            },
            {
              "name": "recentEpoch",
              "docs": [
                "recent epoch"
              ],
              "type": "u64"
            },
            {
              "name": "padding",
              "docs": [
                "padding for future updates"
              ],
              "type": {
                "array": [
                  "u64",
                  31
                ]
              }
            }
          ]
        }
      }
    ],
    "types": [
      {
        "name": "Observation",
        "docs": [
          "The element of observations in ObservationState"
        ],
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "blockTimestamp",
              "docs": [
                "The block timestamp of the observation"
              ],
              "type": "u64"
            },
            {
              "name": "cumulativeToken0PriceX32",
              "docs": [
                "the cumulative of token0 price during the duration time, Q32.32, the remaining 64 bit for overflow"
              ],
              "type": "u128"
            },
            {
              "name": "cumulativeToken1PriceX32",
              "docs": [
                "the cumulative of token1 price during the duration time, Q32.32, the remaining 64 bit for overflow"
              ],
              "type": "u128"
            }
          ]
        }
      }
    ],
    address: "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA",
    metadata: {
      name: "pumpAmm",
      version: "0.1.0",
      spec: "0.1.0",
      description: "Created with Anchor & https://github.com/vvizardev"
    }
  };
  