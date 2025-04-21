import Web3 from 'web3';
import TransactionContract from '../contracts/Transaction.json';

class BlockchainService {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.account = null;
  }

  async init() {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.web3 = new Web3(window.ethereum);
        
        // Get the first account
        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];

        // Try to get the network ID and contract
        try {
          const networkId = await this.web3.eth.net.getId();
          const deployedNetwork = TransactionContract.networks[networkId];
          if (deployedNetwork) {
            this.contract = new this.web3.eth.Contract(
              TransactionContract.abi,
              deployedNetwork.address
            );
          }
        } catch (error) {
          console.warn('Contract not deployed yet:', error);
        }

        return true;
      } catch (error) {
        console.error('Error initializing blockchain service:', error);
        return false;
      }
    } else {
      console.error('Please install MetaMask!');
      return false;
    }
  }

  async logTransactionToBlockchain(transactionData, mlPredictions) {
    if (!this.web3 || !this.account) {
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

      if (this.contract) {
        // Only log to blockchain if it's a fraudulent transaction or high confidence
        if (mlPredictions.isFraud || mlPredictions.confidence > 70) {
          await this.contract.methods.logTransaction(
            transactionId,
            this.web3.utils.toWei(transactionData.amount.toString(), 'ether'),
            transactionData.recipient,
            mlPredictions.isFraud,
            Math.floor(mlPredictions.confidence),
            mlDetails
          ).send({ from: this.account });

          console.log('Transaction logged to blockchain:', {
            transactionId,
            ...transactionData,
            mlPredictions
          });
        }
      } else {
        console.log('Contract not available, would have logged:', {
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
    if (!this.web3 || !this.contract) {
      return [];
    }

    try {
      const transactions = await this.contract.methods.getFraudulentTransactions().call();
      return transactions.map(tx => ({
        transactionId: tx.transactionId,
        amount: this.web3.utils.fromWei(tx.amount, 'ether'),
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
        const web3 = new Web3(window.ethereum);
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