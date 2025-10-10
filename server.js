import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/balance", async (req, res) => {
  const { publicKey, network } = req.body;

  let rpcUrl;
  if (network === "mainnet") {
    rpcUrl = "https://api.mainnet-beta.solana.com";
  } else if (network === "testnet") {
    rpcUrl = "https://api.testnet.solana.com";
  } else {
    return res.status(400).json({ error: "Rede inválida" });
  }

  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "getBalance",
    params: [publicKey],
  };

  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy rodando em porta ${PORT}`));
