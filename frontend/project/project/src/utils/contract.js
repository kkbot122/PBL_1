import { ethers } from "ethers";
import { connectWallet } from "./ethereum";

const contractAddress = "YOUR_CONTRACT_ADDRESS";
const abi = [
    "function processTransaction() public payable",
    "event TransactionProcessed(address indexed sender, uint256 amount, bool isFraud)"
];

export async function sendTransaction(amount) {
    const signer = await connectWallet();
    if (!signer) return;

    const contract = new ethers.Contract(contractAddress, abi, signer);

    const tx = await contract.processTransaction({
        value: ethers.parseEther(amount.toString()),
    });

    console.log("Transaction Sent:", tx.hash);
    await tx.wait();
    console.log("Transaction Confirmed:", tx.hash);
}

export function listenForTransactions(updateCallback) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    contract.on("TransactionProcessed", (sender, amount, isFraud) => {
        updateCallback({
            sender,
            amount: ethers.formatEther(amount),
            isFraud
        });
    });
}
