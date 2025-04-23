const { ethers } = require('ethers');
const config = require('../../smart_contracts/config');

class BlockchainService {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(config.network.rpcUrl);
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
            
            // Log transaction to blockchain regardless of risk level or fraud status
            console.log(`Sending transaction to blockchain: ${amount} ETH to ${recipientAddress} with risk level ${riskLevel}`);
            
            // Call validateTransaction function
            const tx = await contractWithSigner.validateTransaction(
                ethers.parseEther(amount.toString()),
                recipientAddress,
                riskLevel
            );
            
            // Wait for transaction to be mined
            const receipt = await tx.wait();
            console.log(`Transaction validated successfully: ${tx.hash}`);
            
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
            console.log(`Getting transaction history for address: ${userAddress}`);
            
            // Validate address format
            if (!userAddress || !userAddress.startsWith('0x')) {
                console.error('Invalid address format:', userAddress);
                return {
                    success: false,
                    error: "Invalid wallet address format"
                };
            }
            
            try {
                // Get the transaction count
                const count = await this.contract.getTransactionCount(userAddress);
                console.log(`Found ${count} transactions for ${userAddress}`);
                
                // If no transactions, return empty array but success=true
                if (count === 0) {
                    return {
                        success: true,
                        transactions: []
                    };
                }
                
                const transactions = [];
                
                // Get each transaction
                for (let i = 0; i < count; i++) {
                    try {
                        const tx = await this.contract.getTransaction(userAddress, i);
                        console.log(`Retrieved transaction ${i}:`, tx);
                        
                        // Ensure all fields are properly formatted
                        transactions.push({
                            amount: ethers.formatEther(tx.amount),
                            recipientAddress: tx.recipientAddress,
                            timestamp: new Date(Number(tx.timestamp) * 1000), // Ensure timestamp is a number
                            isVerified: Boolean(tx.isVerified), // Ensure boolean
                            riskLevel: tx.riskLevel || 'Unknown' // Provide default if missing
                        });
                    } catch (txError) {
                        console.error(`Error fetching transaction at index ${i}:`, txError);
                        // Continue to next transaction instead of failing completely
                    }
                }
                
                console.log(`Successfully retrieved ${transactions.length} transactions`);
                
                return {
                    success: true,
                    transactions
                };
            } catch (contractError) {
                console.error('Contract call error:', contractError);
                return {
                    success: false,
                    error: `Contract error: ${contractError.message}`
                };
            }
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