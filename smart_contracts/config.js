const config = {
    // Network configuration
    network: {
        rpcUrl: "http://localhost:8545", // Local Ethereum node
        chainId: 1337, // Local network chain ID
    },
    
    // Contract configuration
    contract: {
        address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Replace with deployed contract address
        abi: [
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
        ]
    }
};

module.exports = config; 