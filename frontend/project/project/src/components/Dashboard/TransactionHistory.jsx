import React, { useState, useEffect } from 'react';
import { ArrowLeft, History, AlertTriangle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setLoading(false);
        setError("User not found. Please log in.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:4000/api/transactions/history?userId=${user.id}`);
        if (response.data.success) {
          setTransactions(response.data.transactions);
        } else {
          setError(response.data.error || "Failed to fetch history");
        }
      } catch (err) {
        console.error("Error fetching transaction history:", err);
        setError(err.response?.data?.error || "An error occurred while fetching history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      Low: "text-green-500",
      Medium: "text-yellow-500",
      High: "text-red-500",
      Critical: "text-red-700"
    };
    return colors[level] || "text-gray-500";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg fixed w-full z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <h1 className="text-xl font-bold">Transaction History</h1>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gray-900 rounded-xl p-8">
            {loading && (
              <div className="text-center py-12">
                <Loader className="h-12 w-12 text-red-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading history...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12 text-red-400">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="font-semibold mb-2">Error Fetching History</p>
                <p className="text-sm">{error}</p>
                 <button
                  onClick={() => navigate('/dashboard')}
                  className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
                >
                  <span>Return to Dashboard</span>
                </button>
              </div>
            )}

            {!loading && !error && transactions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <History className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">No Transactions Yet</h2>
                <p className="text-gray-400 mb-8">
                  Your saved transaction history will appear here.
                </p>
                 <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
                >
                  <span>Return to Dashboard</span>
                </button>
              </div>
            )}

            {!loading && !error && transactions.length > 0 && (
              <div className="space-y-4">
                {transactions.map((tx, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex flex-wrap justify-between items-center mb-2">
                      <span className={`font-bold text-lg ${getRiskLevelColor(tx.riskLevel)}`}>{tx.riskLevel} Risk</span>
                      <span className="text-sm text-gray-400">{formatDate(tx.timestamp)}</span>
                    </div>
                    <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1 text-gray-300">
                      <span>Amount:</span> <span className="text-white font-mono">{tx.amount}</span>
                      <span>Recipient:</span> <span className="text-white font-mono break-all">{tx.recipientAddress}</span>
                      <span>Confidence:</span> <span className="text-white font-mono">{tx.confidence}</span>
                      <span>Category:</span> <span className="text-white font-mono">{tx.transactionCategory || 'N/A'}</span>
                    </div>
                     {tx.riskFactors && tx.riskFactors.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className="text-xs text-gray-400 mb-1">Risk Factors:</p>
                          <ul className="list-disc list-inside text-xs text-yellow-400 space-y-1">
                            {tx.riskFactors.map((factor, fIndex) => <li key={fIndex}>{factor}</li>)}
                          </ul>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TransactionHistory; 