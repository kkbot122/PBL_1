import React from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './TransactionDetails.css';

const TransactionDetails = () => {
    const { index } = useParams();
    const [transaction, setTransaction] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        const fetchTransactionDetails = async () => {
            try {
                const response = await axios.get(`/api/transactions/${index}`, {
                    headers: {
                        'auth-token': localStorage.getItem('auth-token')
                    }
                });

                if (response.data.success) {
                    setTransaction(response.data.transaction);
                } else {
                    setError('Error fetching transaction details');
                }
            } catch (error) {
                setError('Error fetching transaction details: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactionDetails();
    }, [index]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!transaction) {
        return <div className="not-found">Transaction not found</div>;
    }

    return (
        <div className="transaction-details">
            <h2>Transaction Details</h2>
            
            <div className="details-grid">
                <div className="detail-item">
                    <span className="label">Amount:</span>
                    <span className="value">{transaction.amount}</span>
                </div>
                
                <div className="detail-item">
                    <span className="label">Recipient Address:</span>
                    <span className="value">{transaction.recipientAddress}</span>
                </div>
                
                <div className="detail-item">
                    <span className="label">Risk Level:</span>
                    <span className={`value risk-${transaction.riskLevel.toLowerCase()}`}>
                        {transaction.riskLevel}
                    </span>
                </div>
                
                <div className="detail-item">
                    <span className="label">Timestamp:</span>
                    <span className="value">
                        {new Date(transaction.timestamp).toLocaleString()}
                    </span>
                </div>
                
                <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`value status-${transaction.isVerified ? 'verified' : 'pending'}`}>
                        {transaction.isVerified ? 'Verified' : 'Pending'}
                    </span>
                </div>
            </div>

            <div className="transaction-actions">
                <button className="back-button" onClick={() => window.history.back()}>
                    Back to History
                </button>
            </div>
        </div>
    );
};

export default TransactionDetails; 