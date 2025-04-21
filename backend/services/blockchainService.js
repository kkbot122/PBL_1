import Web3 from 'web3';
import config from '../../smart_contracts/config.js';

class BlockchainService {
    constructor() {
        this.web3 = new Web3(config.network.rpcUrl);
        this.contract = new this.web3.eth.Contract(
            config.contract.abi,
            config.contract.address
        );
    }

    async validateTransaction(userAddress, amount, recipientAddress, riskLevel) {
        try {
            const result = await this.contract.methods
                .validateTransaction(amount, recipientAddress, riskLevel)
                .send({ from: userAddress });

            return {
                success: true,
                transactionHash: result.transactionHash,
                blockNumber: result.blockNumber
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
            const count = await this.contract.methods
                .getTransactionCount(userAddress)
                .call();

            const transactions = [];
            for (let i = 0; i < count; i++) {
                const tx = await this.contract.methods
                    .getTransaction(userAddress, i)
                    .call();
                
                transactions.push({
                    amount: tx.amount,
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

    async getTransactionDetails(userAddress, index) {
        try {
            const tx = await this.contract.methods
                .getTransaction(userAddress, index)
                .call();

            return {
                success: true,
                transaction: {
                    amount: tx.amount,
                    recipientAddress: tx.recipientAddress,
                    timestamp: new Date(tx.timestamp * 1000),
                    isVerified: tx.isVerified,
                    riskLevel: tx.riskLevel
                }
            };
        } catch (error) {
            console.error('Error getting transaction details:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default new BlockchainService(); 