const { ethers } = require('ethers');
const config = require('../../smart_contracts/config');

class BlockchainService {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(config.network.rpcUrl);
        this.contract = new ethers.Contract(
            config.contract.address,
            config.contract.abi,
            this.provider
        );
    }

    async validateTransaction(amount, recipientAddress, riskLevel, privateKey) {
        try {
            // Create wallet from private key
            const wallet = new ethers.Wallet(privateKey, this.provider);
            
            // Connect contract with wallet
            const contractWithSigner = this.contract.connect(wallet);
            
            // Call validateTransaction function
            const tx = await contractWithSigner.validateTransaction(
                ethers.utils.parseEther(amount.toString()),
                recipientAddress,
                riskLevel
            );
            
            // Wait for transaction to be mined
            await tx.wait();
            
            return {
                success: true,
                transactionHash: tx.hash
            };
        } catch (error) {
            console.error('Error validating transaction:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getTransactionHistory(userAddress) {
        try {
            const count = await this.contract.getTransactionCount(userAddress);
            const transactions = [];

            for (let i = 0; i < count; i++) {
                const tx = await this.contract.getTransaction(userAddress, i);
                transactions.push({
                    amount: ethers.utils.formatEther(tx.amount),
                    recipientAddress: tx.recipientAddress,
                    timestamp: new Date(tx.timestamp * 1000),
                    isVerified: tx.isVerified,
                    riskLevel: tx.riskLevel
                });
            }

            return {
                success: true,
                transactions
            };
        } catch (error) {
            console.error('Error getting transaction history:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new BlockchainService(); 