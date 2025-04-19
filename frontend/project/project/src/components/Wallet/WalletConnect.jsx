\import React, { useState } from "react";

const WalletConnect = ({ setWallet }) => {
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
        setWallet(accounts[0]); // Pass wallet address to parent component
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("MetaMask not detected. Please install it.");
      window.open("https://metamask.io/download/", "_blank");
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg text-center">
      {walletAddress ? (
        <p className="text-white">Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
      ) : (
        <button 
          onClick={connectWallet} 
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
