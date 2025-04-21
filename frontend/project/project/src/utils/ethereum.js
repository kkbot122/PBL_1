import { ethers } from "ethers";

export async function connectWallet() {
    try {
        // Direct connection to local Hardhat node
        // This bypasses MetaMask and ENS resolution completely
        const provider = new ethers.JsonRpcProvider("http://localhost:8545");
        
        // For transactions, we'll need a signer
        // This is a hardhat development default private key - ONLY USE FOR DEVELOPMENT!
        const HARDHAT_DEV_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
        const signer = new ethers.Wallet(HARDHAT_DEV_PRIVATE_KEY, provider);
        
        console.log("Connected directly to local node (bypassing MetaMask)");
        return signer;
    } catch (error) {
        console.error("Error connecting to local node:", error);
        return null;
    }
}
