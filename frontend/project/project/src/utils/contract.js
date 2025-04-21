import { ethers } from "ethers";
import { connectWallet } from "./ethereum";

// Update with your deployed contract address
const contractAddress = "0x9fE4673667d2D9a65f0992f2272dE9f3c7fa6e0";

// ABI from your contract
const abi = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "recipientAddress",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "riskLevel",
                "type": "string"
            }
        ],
        "name": "TransactionVerified",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_index",
                "type": "uint256"
            }
        ],
        "name": "getTransaction",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "recipientAddress",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isVerified",
                "type": "bool"
            },
            {
                "internalType": "string",
                "name": "riskLevel",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "getTransactionCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "_recipientAddress",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_riskLevel",
                "type": "string"
            }
        ],
        "name": "validateTransaction",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export async function sendTransaction(amount, recipientAddress, riskLevel) {
    try {
        const signer = await connectWallet();
        if (!signer) return { success: false, error: "Failed to connect to wallet" };

        const contract = new ethers.Contract(contractAddress, abi, signer);

        const tx = await contract.validateTransaction(
            ethers.parseEther(amount.toString()),
            recipientAddress,
            riskLevel
        );

        console.log("Transaction Sent:", tx.hash);
        await tx.wait();
        console.log("Transaction Confirmed:", tx.hash);
        
        return { success: true, hash: tx.hash };
    } catch (error) {
        console.error("Transaction error:", error);
        return { success: false, error: error.message };
    }
}

export function listenForTransactions(updateCallback) {
    try {
        // Use direct provider without MetaMask
        const provider = new ethers.JsonRpcProvider("http://localhost:8545");
        const contract = new ethers.Contract(contractAddress, abi, provider);

        contract.on("TransactionVerified", (user, amount, recipientAddress, riskLevel) => {
            updateCallback({
                user,
                amount: ethers.formatEther(amount),
                recipientAddress,
                riskLevel
            });
        });
        
        return { success: true };
    } catch (error) {
        console.error("Error setting up event listener:", error);
        return { success: false, error: error.message };
    }
}
