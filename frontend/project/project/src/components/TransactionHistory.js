import React, { useState, useEffect } from 'react';
import BlockchainService from '../services/BlockchainService';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const txList = await BlockchainService.getUserTransactions();
                setTransactions(txList);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch transactions. Please ensure MetaMask is connected.');
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (loading) return <div>Loading transaction history...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="transaction-history">
            <h2>Transaction History</h2>
            <table>
                <thead>
                    <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Amount (ETH)</th>
                        <th>Status</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx, index) => (
                        <tr key={index}>
                            <td>{tx.from}</td>
                            <td>{tx.to}</td>
                            <td>{tx.amount}</td>
                            <td className={tx.isFraudulent ? 'fraudulent' : 'legitimate'}>
                                {tx.isFraudulent ? 'Fraudulent' : 'Legitimate'}
                            </td>
                            <td>{new Date(tx.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <style jsx>{`
                .transaction-history {
                    padding: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background-color: #f5f5f5;
                }
                .fraudulent {
                    color: red;
                    font-weight: bold;
                }
                .legitimate {
                    color: green;
                }
                .error {
                    color: red;
                    padding: 20px;
                }
            `}</style>
        </div>
    );
};

export default TransactionHistory; 