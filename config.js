// HodlFun config. Public values only: never put PINATA_JWT, Helius or private RPC keys here.
export const CONFIG={NAME:'HodlFun',SHORT:'HODL',TAGLINE:'Hold longer. Earn more.',
RPC:['https://solana-rpc.publicnode.com','https://api.mainnet-beta.solana.com'],RPC_GPA:['https://api.mainnet-beta.solana.com'],
FEES:{raydium:0.25,platform:1.75,creator:0}, // % of each bonding-curve trade
PAIR:{s:'SOL',mint:'So11111111111111111111111111111111111111112',config:'6s1xP3hpbAfFoNtUNF8mfHsjr2Bd97JxFJRWLbL6aHuX',raise:85},
LAUNCH:{supply:'1000000000000000',totalSellA:'793100000000000',slippageBps:100},
TREASURY:'7Jbn6dvQiiapYZWDHFVHtqzG8cGzZdouspBfn3LHUnir', // platform admin + fee wallet + LP-NFT wallet
PLATFORM_EXPECTED:'7dXpyeQamp472oy9rFjpR2D4BtSkgKwvDWi6cJM18wJW', // PDA from treasury
PLATFORM_ID:'7dXpyeQamp472oy9rFjpR2D4BtSkgKwvDWi6cJM18wJW', // set to PLATFORM_EXPECTED once tools/create-platform.mjs --send has created it. Empty = launches disabled.
IPFS_ENDPOINT:'https://hodlfun-upload.onrender.com/', // upload service URL (upload/server.mjs, e.g. https://hodlfun-upload.onrender.com/). Empty = launches disabled.
SIM_PAYER:'5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9'};
