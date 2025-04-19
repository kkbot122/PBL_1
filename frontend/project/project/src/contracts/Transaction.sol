// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Transaction {
    struct TransactionData {
        string transactionId;    // Unique identifier for the transaction
        uint256 amount;
        string recipient;        // Changed to string to store any recipient identifier
        uint256 timestamp;
        bool isFraud;
        uint256 fraudConfidence;
        string mlDetails;        // Additional details from ML models
    }

    TransactionData[] public transactions;
    mapping(string => uint256) private transactionIndexes; // Map transactionId to array index

    event TransactionLogged(
        string transactionId,
        uint256 amount,
        string recipient,
        uint256 timestamp,
        bool isFraud,
        uint256 fraudConfidence,
        string mlDetails
    );

    function logTransaction(
        string memory _transactionId,
        uint256 _amount,
        string memory _recipient,
        bool _isFraud,
        uint256 _confidence,
        string memory _mlDetails
    ) public {
        require(transactionIndexes[_transactionId] == 0, "Transaction already logged");
        
        TransactionData memory newTransaction = TransactionData({
            transactionId: _transactionId,
            amount: _amount,
            recipient: _recipient,
            timestamp: block.timestamp,
            isFraud: _isFraud,
            fraudConfidence: _confidence,
            mlDetails: _mlDetails
        });

        transactions.push(newTransaction);
        transactionIndexes[_transactionId] = transactions.length;

        emit TransactionLogged(
            _transactionId,
            _amount,
            _recipient,
            block.timestamp,
            _isFraud,
            _confidence,
            _mlDetails
        );
    }

    function getTransactions() public view returns (TransactionData[] memory) {
        return transactions;
    }

    function getFraudulentTransactions() public view returns (TransactionData[] memory) {
        // First, count fraudulent transactions
        uint256 fraudCount = 0;
        for (uint256 i = 0; i < transactions.length; i++) {
            if (transactions[i].isFraud) {
                fraudCount++;
            }
        }

        // Create array of fraudulent transactions
        TransactionData[] memory fraudulentTxs = new TransactionData[](fraudCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < transactions.length; i++) {
            if (transactions[i].isFraud) {
                fraudulentTxs[currentIndex] = transactions[i];
                currentIndex++;
            }
        }
        
        return fraudulentTxs;
    }

    function getTransaction(string memory _transactionId) public view returns (TransactionData memory) {
        uint256 index = transactionIndexes[_transactionId];
        require(index > 0, "Transaction not found");
        return transactions[index - 1];
    }
} 