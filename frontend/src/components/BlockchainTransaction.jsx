import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BlockchainTransaction.css';

const BlockchainTransaction = () => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [connectedAddress, setConnectedAddress] = useState('');
    const [riskPrediction, setRiskPrediction] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

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

    // Get risk prediction from ML service
    const getRiskPrediction = async (amount, recipientAddress) => {
        try {
            const response = await axios.post('http://localhost:8000/predict', {
                amount: parseFloat(amount),
                recipientAddress
            });
            return response.data;
        } catch (error) {
            console.error('Error getting risk prediction:', error);
            return null;
        }
    };

    // Handle transaction submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Get risk prediction
            const prediction = await getRiskPrediction(amount, recipientAddress);
            if (!prediction) {
                throw new Error('Failed to get risk prediction');
            }
            setRiskPrediction(prediction);

            // Submit transaction to backend
            const response = await axios.post('http://localhost:5000/api/transactions', {
                amount: parseFloat(amount),
                recipientAddress,
                riskLevel: prediction.riskLevel,
                confidence: prediction.confidence,
                details: prediction.details,
                recommendations: prediction.securitySuggestions
            }, {
                headers: {
                    'auth-token': localStorage.getItem('auth-token')
                }
            });

            if (response.data.success) {
                setSuccess('Transaction submitted successfully!');
                setAmount('');
                setRecipientAddress('');
                fetchTransactionHistory();
            } else {
                setError(response.data.error || 'Failed to submit transaction');
            }
        } catch (error) {
            setError(error.message || 'Error submitting transaction');
        } finally {
            setLoading(false);
        }
    };

    // Fetch transaction history
    const fetchTransactionHistory = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/transactions/history', {
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
        const interval = setInterval(fetchTransactionHistory, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Handle transaction click
    const handleTransactionClick = (index) => {
        navigate(`/transactions/${index}`);
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getRiskColor = (riskLevel) => {
        switch (riskLevel.toLowerCase()) {
            case 'low': return '#28a745';
            case 'medium': return '#ffc107';
            case 'high': return '#fd7e14';
            case 'critical': return '#dc3545';
            default: return '#6c757d';
        }
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

            <form onSubmit={handleSubmit} className="transaction-form">
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

                {riskPrediction && (
                    <div className="risk-prediction">
                        <h3>Risk Analysis</h3>
                        <div className="risk-details">
                            <p>Risk Level: <span className={`risk-${riskPrediction.riskLevel.toLowerCase()}`}>
                                {riskPrediction.riskLevel}
                            </span></p>
                            <p>Confidence: {riskPrediction.confidence}%</p>
                            <p>Details: {riskPrediction.details}</p>
                            <div className="recommendations">
                                <h4>Security Suggestions:</h4>
                                <ul>
                                    {riskPrediction.recommendations.map((suggestion, index) => (
                                        <li key={index}>{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <button type="submit" disabled={loading || !connectedAddress}>
                    {loading ? 'Processing...' : 'Submit Transaction'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="transaction-history">
                <div className="history-header">
                    <h3>Transaction History</h3>
                    <div className="history-filters">
                        <select onChange={(e) => setFilter(e.target.value)}>
                            <option value="all">All Transactions</option>
                            <option value="low">Low Risk</option>
                            <option value="medium">Medium Risk</option>
                            <option value="high">High Risk</option>
                            <option value="critical">Critical Risk</option>
                        </select>
                        <input 
                            type="text" 
                            placeholder="Search transactions..." 
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {transactions.length === 0 ? (
                    <div className="no-transactions">
                        <p>No transactions found</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>Amount</th>
                                    <th>Recipient</th>
                                    <th>Risk Level</th>
                                    <th>Confidence</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions
                                    .filter(tx => {
                                        if (filter === 'all') return true;
                                        return tx.riskLevel.toLowerCase() === filter;
                                    })
                                    .filter(tx => {
                                        if (!searchTerm) return true;
                                        return (
                                            tx.recipientAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            tx.amount.toString().includes(searchTerm) ||
                                            tx.riskLevel.toLowerCase().includes(searchTerm.toLowerCase())
                                        );
                                    })
                                    .map((tx, index) => (
                                        <tr key={index} className="transaction-row">
                                            <td className="timestamp">{formatDate(tx.timestamp)}</td>
                                            <td className="amount">{formatAmount(tx.amount)}</td>
                                            <td className="recipient">
                                                <span className="address">{tx.recipientAddress}</span>
                                            </td>
                                            <td className="risk">
                                                <div className="risk-indicator" style={{ backgroundColor: getRiskColor(tx.riskLevel) }}></div>
                                                <span className={`risk-${tx.riskLevel.toLowerCase()}`}>
                                                    {tx.riskLevel}
                                                </span>
                                            </td>
                                            <td className="confidence">
                                                <div className="confidence-bar">
                                                    <div 
                                                        className="confidence-fill" 
                                                        style={{ 
                                                            width: `${tx.confidence}%`,
                                                            backgroundColor: getRiskColor(tx.riskLevel)
                                                        }}
                                                    ></div>
                                                    <span>{tx.confidence}%</span>
                                                </div>
                                            </td>
                                            <td className="actions">
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlockchainTransaction; 