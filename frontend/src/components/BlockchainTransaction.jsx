import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';
import './BlockchainTransaction.css';

const BlockchainTransaction = () => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [riskLevel, setRiskLevel] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [connectedAddress, setConnectedAddress] = useState('');

    // Connect to MetaMask
    const connectWallet = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setConnectedAddress(accounts[0]);
                return accounts[0];
            } else {
                setError('Please install MetaMask!');
                return null;
            }
        } catch (error) {
            setError('Error connecting to MetaMask: ' + error.message);
            return null;
        }
    };

    // Validate transaction
    const handleValidateTransaction = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const userAddress = await connectWallet();
            if (!userAddress) {
                setLoading(false);
                return;
            }

            const response = await axios.post('/api/transactions/validate', {
                amount,
                recipientAddress,
                riskLevel
            }, {
                headers: {
                    'auth-token': localStorage.getItem('auth-token')
                }
            });

            if (response.data.success) {
                setSuccess('Transaction validated successfully!');
                setAmount('');
                setRecipientAddress('');
                setRiskLevel('');
                fetchTransactionHistory();
            } else {
                setError(response.data.error);
            }
        } catch (error) {
            setError('Error validating transaction: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch transaction history
    const fetchTransactionHistory = async () => {
        try {
            const response = await axios.get('/api/transactions/history', {
                headers: {
                    'auth-token': localStorage.getItem('auth-token')
                }
            });

            if (response.data.success) {
                setTransactions(response.data.transactions);
            } else {
                setError('Error fetching transaction history');
            }
        } catch (error) {
            setError('Error fetching transaction history: ' + error.message);
        }
    };

    // Set up real-time updates
    useEffect(() => {
        fetchTransactionHistory();
        
        // Set up polling for real-time updates
        const interval = setInterval(fetchTransactionHistory, 30000); // Update every 30 seconds
        
        return () => clearInterval(interval);
    }, []);

    // Handle transaction click
    const handleTransactionClick = (index) => {
        navigate(`/transactions/${index}`);
    };

    return (
        <div className="blockchain-container">
            <div className="wallet-status">
                {connectedAddress ? (
                    <div className="connected-wallet">
                        <span>Connected: </span>
                        <span className="wallet-address">
                            {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                        </span>
                    </div>
                ) : (
                    <button onClick={connectWallet} className="connect-wallet">
                        Connect Wallet
                    </button>
                )}
            </div>

            <h2>Blockchain Transaction</h2>
            
            <form onSubmit={handleValidateTransaction} className="transaction-form">
                <div className="form-group">
                    <label>Amount:</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        placeholder="Enter amount"
                    />
                </div>

                <div className="form-group">
                    <label>Recipient Address:</label>
                    <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        required
                        placeholder="Enter recipient address"
                    />
                </div>

                <div className="form-group">
                    <label>Risk Level:</label>
                    <select
                        value={riskLevel}
                        onChange={(e) => setRiskLevel(e.target.value)}
                        required
                    >
                        <option value="">Select risk level</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>

                <button type="submit" disabled={loading || !connectedAddress}>
                    {loading ? 'Processing...' : 'Validate Transaction'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="transaction-history">
                <h3>Transaction History</h3>
                {transactions.length === 0 ? (
                    <p>No transactions found</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Amount</th>
                                <th>Recipient</th>
                                <th>Risk Level</th>
                                <th>Timestamp</th>
                                <th>Status</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, index) => (
                                <tr key={index}>
                                    <td>{tx.amount}</td>
                                    <td>{tx.recipientAddress}</td>
                                    <td className={`risk-${tx.riskLevel.toLowerCase()}`}>
                                        {tx.riskLevel}
                                    </td>
                                    <td>{new Date(tx.timestamp).toLocaleString()}</td>
                                    <td className={`status-${tx.isVerified ? 'verified' : 'pending'}`}>
                                        {tx.isVerified ? 'Verified' : 'Pending'}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleTransactionClick(index)}
                                            className="details-button"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default BlockchainTransaction; 