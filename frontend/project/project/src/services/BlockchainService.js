import Web3 from 'web3';
import { ethers } from 'ethers';
import config from '../../config.js'; // Updated path to config file

class BlockchainService {
  constructor() {
    // Initialize with null values - will connect directly when needed
    this.provider = null;
    this.wallet = null;
    this.contract = null;
  }

  async init() {
    try {
      // Connect directly to the Hardhat node without using MetaMask
      this.provider = new ethers.JsonRpcProvider('http://localhost:8545');
      
      // Use a default private key (ONLY FOR DEVELOPMENT)
      const HARDHAT_DEV_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
      this.wallet = new ethers.Wallet(HARDHAT_DEV_PRIVATE_KEY, this.provider);
      
      // Initialize contract with direct RPC connection
      this.contract = new ethers.Contract(
        config.contract.address,
        config.contract.abi,
        this.wallet
      );
      
      console.log('Connected directly to local blockchain node');
      return true;
    } catch (error) {
      console.error('Error initializing direct blockchain connection:', error);
      return false;
    }
  }

  async logTransactionToBlockchain(transactionData, mlPredictions) {
    if (!this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const transactionId = `TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Format ML details as JSON string
      const mlDetails = JSON.stringify({
        model1: mlPredictions.modelPredictions.model1,
        model2: mlPredictions.modelPredictions.model2,
        model3: mlPredictions.modelPredictions.model3,
        confidence: mlPredictions.confidence
      });

      // Only log to blockchain if it's a fraudulent transaction or high confidence
      if (mlPredictions.isFraud || mlPredictions.confidence > 70) {
        await this.contract.logTransaction(
          transactionId,
          transactionData.amount,
          transactionData.recipient,
          mlPredictions.isFraud,
          Math.floor(mlPredictions.confidence),
          mlDetails
        );

        console.log('Transaction logged to blockchain:', {
          transactionId,
          ...transactionData,
          mlPredictions
        });
      }

      return transactionId;
    } catch (error) {
      console.error('Error logging transaction to blockchain:', error);
      throw error;
    }
  }

  async getFraudulentTransactions() {
    if (!this.contract) {
      return [];
    }

    try {
      const transactions = await this.contract.getFraudulentTransactions();
      return transactions.map(tx => ({
        transactionId: tx.transactionId,
        amount: tx.amount,
        recipient: tx.recipient,
        timestamp: new Date(tx.timestamp * 1000),
        isFraud: tx.isFraud,
        confidence: tx.fraudConfidence,
        mlDetails: JSON.parse(tx.mlDetails)
      }));
    } catch (error) {
      console.error('Error getting fraudulent transactions:', error);
      return [];
    }
  }

  static async connect() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Configure Web3 to disable ENS features for local network
        const providerOptions = {
          chainId: 31337, 
          name: "local",
          ensAddress: null
        };
        const web3 = new Web3(window.ethereum, null, providerOptions);
        
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = TransactionContract.networks[networkId];
        const contract = new web3.eth.Contract(
          TransactionContract.abi,
          deployedNetwork && deployedNetwork.address
        );
        return { web3, contract };
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        throw error;
      }
    } else {
      throw new Error('MetaMask not installed');
    }
  }

  static async logTransaction(to, amount, isFraudulent) {
    try {
      const { web3, contract } = await this.connect();
      const accounts = await web3.eth.getAccounts();
      const timestamp = new Date().toISOString();
      
      await contract.methods.logTransaction(
        to,
        web3.utils.toWei(amount.toString(), 'ether'),
        isFraudulent,
        timestamp
      ).send({ from: accounts[0] });
    } catch (error) {
      console.error('Error logging transaction:', error);
      throw error;
    }
  }

  static async getUserTransactions() {
    try {
      const { web3, contract } = await this.connect();
      const accounts = await web3.eth.getAccounts();
      const transactions = await contract.methods.getUserTransactions(accounts[0]).call();
      
      return transactions.map(tx => ({
        from: tx.from,
        to: tx.to,
        amount: web3.utils.fromWei(tx.amount, 'ether'),
        isFraudulent: tx.isFraudulent,
        timestamp: tx.timestamp
      }));
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }
}

export default new BlockchainService(); 