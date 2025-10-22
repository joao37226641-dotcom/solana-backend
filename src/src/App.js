import React, { useEffect, useState } from "react";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

export default function App() {
  const [provider, setProvider] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [status, setStatus] = useState("não conectado");
  const [mainnetBalance, setMainnetBalance] = useState(null);
  const [testnetBalance, setTestnetBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.solana && window.solana.isPhantom) {
      setProvider(window.solana);
      // Keep UI in sync if usuário conectar via extensão direto
      if (window.solana.isConnected) {
        setPublicKey(window.solana.publicKey.toString());
        setStatus("conectado");
      }
      const onConnect = () => {
        setStatus("conectado");
        setPublicKey(window.solana.publicKey.toString());
      };
      const onDisconnect = () => {
        setStatus("não conectado");
        setPublicKey(null);
      };
      window.solana.on("connect", onConnect);
      window.solana.on("disconnect", onDisconnect);
      return () => {
        try {
          window.solana.off("connect", onConnect);
          window.solana.off("disconnect", onDisconnect);
        } catch (e) {}
      };
    } else {
      setProvider(null);
      setError("Phantom Wallet não encontrada. Instale a extensão.");
    }
  }, []);

  async function connectWallet() {
    setError(null);
    if (!provider) {
      setError("Phantom Wallet não encontrada.");
      return;
    }
    try {
      const resp = await provider.connect();
      setPublicKey(resp.publicKey.toString());
      setStatus("conectado");
    } catch (err) {
      setError(err.message || String(err));
    }
  }

  async function disconnectWallet() {
    if (!provider) return;
    try {
      await provider.disconnect();
      setPublicKey(null);
      setStatus("não conectado");
    } catch (err) {
      setError(err.message || String(err));
    }
  }

  async function getBalanceOnNetwork(pkString, cluster) {
    try {
      const endpoint = clusterApiUrl(cluster);
      const conn = new Connection(endpoint, "confirmed");
      const lamports = await conn.getBalance(new PublicKey(pkString));
      return lamports / LAMPORTS_PER_SOL;
    } catch (err) {
      console.error("Erro getBalance:", err);
      return null;
    }
  }

  async function checkBalances() {
    if (!publicKey) {
      setError("Conecte a carteira primeiro.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [mainnet, testnet] = await Promise.all([
        getBalanceOnNetwork(publicKey, "mainnet-beta"),
        getBalanceOnNetwork(publicKey, "testnet"),
      ]);
      setMainnetBalance(mainnet);
      setTestnetBalance(testnet);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      maxWidth: "720px",
      margin: "40px auto",
      padding: "22px",
      borderRadius: "12px",
      background: "#fff",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      fontFamily: "Arial, sans-serif"
    }}>
      <h2>Demo Solana — Phantom</h2>
      <p>Status: <b>{status}</b></p>
      <p>Carteira: <span style={{wordBreak:"break-all"}}>{publicKey || "-"}</span></p>

      <div style={{margin:"12px 0"}}>
        {!publicKey ? (
          <button onClick={connectWallet} style={btn}>Conectar Phantom</button>
        ) : (
          <button onClick={disconnectWallet} style={btn}>Desconectar</button>
        )}

        <button
          onClick={checkBalances}
          disabled={!publicKey || loading}
          style={{...btn, marginLeft:12, opacity: loading?0.6:1}}
        >
          {loading ? "Verificando..." : "Verificar Saldos"}
        </button>
      </div>

      <div>
        <p><b>Mainnet:</b> {mainnetBalance ?? "-"}</p>
        <p><b>Testnet:</b> {testnetBalance ?? "-"}</p>
      </div>

      {error && <p style={{color:"red"}}>{error}</p>}

      <p style={{fontSize:12, color:"#666"}}>
        Abra esse site no navegador onde a extensão Phantom está instalada.
      </p>
    </div>
  );
}

const btn = {
  background: "#6366f1",
  color: "#fff",
  padding: "8px 14px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};
