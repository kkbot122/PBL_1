import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Loader, Anchor, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BlockchainHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [walletAddress, setWalletAddress] = useState('0xf39F...Z266');
  const [error, setError] = useState(null);

  // Generate a random wallet address for display
  const generateWalletAddress = () => {
    return "0x" + Math.random().toString(16).substring(2, 10) + "..." + Math.random().toString(16).substring(2, 6);
  };

  // Load transactions from localStorage
  const loadTransactions = () => {
    setLoading(true);
    setError(null);
    setWalletAddress(generateWalletAddress());
    
    try {
      // Get transactions from localStorage
      let transactions = [];
      try {
        const stored = localStorage.getItem('blockchainTransactions');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            transactions = parsed;
          } else {
            console.error("Stored data is not an array");
            localStorage.setItem('blockchainTransactions', JSON.stringify([]));
          }
        } else {
          // Initialize localStorage if it doesn't exist
          localStorage.setItem('blockchainTransactions', JSON.stringify([]));
        }
      } catch (e) {
        console.error("Error parsing transactions from localStorage:", e);
        localStorage.setItem('blockchainTransactions', JSON.stringify([]));
      }
      
      setTransactions(transactions);
    } catch (err) {
      console.error("Error loading blockchain transactions:", err);
      setError("Failed to load blockchain transactions");
    } finally {
      setLoading(false);
    }
  };

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Format amount with commas
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    try {
      if (typeof amount === 'number') {
        return amount.toLocaleString();
      }
      return amount.toString();
    } catch (e) {
      return amount;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <nav className="bg-[#0f172a] p-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="flex items-center">
            <Anchor className="h-5 w-5 mr-2 text-blue-400"/>
            <h1 className="text-xl font-bold">Blockchain Transaction Log</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-400 font-mono">
            Log Address: {walletAddress}
          </span>
          <button 
            onClick={loadTransactions} 
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Refresh transactions"
          >
            <RefreshCw className="h-4 w-4 text-white" />
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="p-6">
        <div className="bg-[#1e293b] rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <Loader className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading blockchain log...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <p className="text-gray-400">{error}</p>
              <button 
                onClick={loadTransactions}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Try Again
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
              <p className="text-gray-400">No blockchain transactions found.</p>
              <p className="text-gray-500 mt-2">Log a transaction from the dashboard to see it here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-xs uppercase bg-[#151f38] text-gray-400">
                  <tr>
                    <th className="px-6 py-3 text-left">Timestamp</th>
                    <th className="px-6 py-3 text-left">Recipient Address</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-right">Risk Level</th>
                    <th className="px-6 py-3 text-right">Transaction Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {transactions.map((tx, index) => (
                    <tr key={index} className="hover:bg-[#0f172a]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(tx.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                        {tx.recipientAddress || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-300">
                        {formatAmount(tx.amount)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-sm">
                        <span className={`${tx.riskLevel === 'High' ? 'text-red-400' : tx.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400'} font-medium`}>
                          {tx.riskLevel || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-300 font-mono">
                        {tx.txHash || tx.blockchainHash || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockchainHistory;
