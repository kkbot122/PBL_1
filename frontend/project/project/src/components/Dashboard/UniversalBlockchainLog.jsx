import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Loader, AlertTriangle, Database, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UniversalBlockchainLog = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllTransactions = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get transactions directly from localStorage
      let storedData = [];
      try {
        const stored = localStorage.getItem('blockchainTransactions');
        if (stored) {
          storedData = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Error parsing transactions from localStorage:", e);
      }
      
      setTransactions(storedData || []);
      console.log("Loaded transactions:", storedData);
    } catch (err) {
      console.error("Error fetching transaction history:", err);
      setError("Failed to load transaction history.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAllTransactions();
  }, []);

  // Filter transactions when search is performed
  const handleSearch = (e) => {
    e.preventDefault();
    
    try {
      // Get all transactions
      let allTransactions = [];
      try {
        const stored = localStorage.getItem('blockchainTransactions');
        if (stored) {
          allTransactions = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Error parsing transactions:", e);
      }
      
      // Filter by search term
      if (searchTerm.trim()) {
        const filteredTransactions = allTransactions.filter(tx => 
          (tx.recipientAddress && tx.recipientAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (tx.txHash && tx.txHash.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (tx.blockchainHash && tx.blockchainHash.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setTransactions(filteredTransactions);
      } else {
        setTransactions(allTransactions);
      }
    } catch (err) {
      console.error("Error during search:", err);
      setError("Search operation failed.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getRiskLevelColor = (level) => {
    if (!level) return "text-gray-400";
    const colors = {
      Low: "text-green-400",
      Medium: "text-yellow-400",
      High: "text-red-400"
    };
    return colors[level] || "text-gray-400";
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <nav className="border-b border-gray-800 bg-[#0f172a] sticky top-0 z-10 p-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </button>
              <h1 className="text-xl font-bold flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-400"/>
                Universal Transaction Log
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Address or TxHash..."
                  className="bg-[#1e293b] text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Search className="h-4 w-4 text-white" />
                </button>
              </form>
              <button 
                onClick={fetchAllTransactions} 
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Refresh transactions"
              >
                <RefreshCw className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="p-6">
        <div className="container mx-auto">
          <div className="bg-[#1e293b] rounded-xl p-6">
            {loading && (
              <div className="text-center py-12">
                <Loader className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading transaction log...</p>
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-12 text-red-400">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <p className="font-semibold mb-2">Error Fetching Log</p>
                <p className="text-sm">{error}</p>
                <button 
                  onClick={fetchAllTransactions}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && transactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Database className="h-10 w-10 mx-auto mb-4" />
                <p>No transactions found{searchTerm ? ` matching "${searchTerm}"` : ''}.</p>
              </div>
            )}

            {!loading && !error && transactions.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                  <thead className="text-xs text-gray-400 uppercase bg-[#151f38]">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Recipient Address</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Risk Level</th>
                      <th className="px-4 py-3">Transaction Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => (
                      <tr key={index} className="border-b border-gray-700 hover:bg-[#0f172a]">
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(tx.timestamp)}</td>
                        <td className="px-4 py-3 font-mono break-all">{tx.recipientAddress}</td>
                        <td className="px-4 py-3">
                          {typeof tx.amount === 'number' ? tx.amount.toLocaleString() : tx.amount || 'N/A'}
                        </td>
                        <td className={`px-4 py-3 font-semibold ${getRiskLevelColor(tx.riskLevel)}`}>
                          {tx.riskLevel || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 font-mono break-all">
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
    </div>
  );
};

export default UniversalBlockchainLog; 