import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

export async function handler(event, context) {
  try {
    const { wallet } = JSON.parse(event.body);

    if (!wallet) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Carteira não enviada" })
      };
    }

    const publicKey = new PublicKey(wallet);
    const connectionMainnet = new Connection(clusterApiUrl("mainnet-beta"));
    const connectionTestnet = new Connection(clusterApiUrl("testnet"));

    const balanceMain = await connectionMainnet.getBalance(publicKey);
    const balanceTest = await connectionTestnet.getBalance(publicKey);

    return {
      statusCode: 200,
      body: JSON.stringify({
        mainnet: balanceMain / 1e9,
        testnet: balanceTest / 1e9
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
