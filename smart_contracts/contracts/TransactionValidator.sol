// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TransactionValidator {
    struct Transaction {
        uint256 amount;
        string recipientAddress;
        uint256 timestamp;
        bool isVerified;
        string riskLevel;
    }

    mapping(address => Transaction[]) public userTransactions;
    address public owner;

    event TransactionVerified(
        address indexed user,
        uint256 amount,
        string recipientAddress,
        string riskLevel
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function validateTransaction(
        uint256 _amount,
        string memory _recipientAddress,
        string memory _riskLevel
    ) public returns (bool) {
        require(_amount > 0, "Amount must be greater than 0");
        require(bytes(_recipientAddress).length > 0, "Recipient address cannot be empty");

        Transaction memory newTransaction = Transaction({
            amount: _amount,
            recipientAddress: _recipientAddress,
            timestamp: block.timestamp,
            isVerified: true,
            riskLevel: _riskLevel
        });

        userTransactions[msg.sender].push(newTransaction);
        
        emit TransactionVerified(
            msg.sender,
            _amount,
            _recipientAddress,
            _riskLevel
        );

        return true;
    }

    function getTransactionCount(address _user) public view returns (uint256) {
        return userTransactions[_user].length;
    }

    function getTransaction(address _user, uint256 _index) public view returns (
        uint256 amount,
        string memory recipientAddress,
        uint256 timestamp,
        bool isVerified,
        string memory riskLevel
    ) {
        require(_index < userTransactions[_user].length, "Transaction does not exist");
        Transaction memory transaction = userTransactions[_user][_index];
        return (
            transaction.amount,
            transaction.recipientAddress,
            transaction.timestamp,
            transaction.isVerified,
            transaction.riskLevel
        );
    }
} 