import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Loader, AlertTriangle, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UniversalBlockchainLog = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllHistory = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = query
        ? `http://localhost:4000/api/transactions/history/all?q=${encodeURIComponent(query)}`
        : 'http://localhost:4000/api/transactions/history/all';
      
      const response = await axios.get(endpoint);
      if (response.data.success) {
        setTransactions(response.data.transactions);
      } else {
        setError(response.data.error || "Failed to fetch universal history");
      }
    } catch (err) {
      console.error("Error fetching universal transaction history:", err);
      setError(err.response?.data?.error || "An error occurred while fetching history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllHistory(); // Initial fetch
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAllHistory(searchTerm);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      Low: "text-green-400",
      'Low-Medium': "text-blue-400",
      Medium: "text-yellow-400",
      'Medium-High': "text-orange-400",
      High: "text-red-400"
    };
    return colors[level] || "text-gray-400";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Static Navbar for this page */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)} // Go back to previous page
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </button>
              <h1 className="text-xl font-bold flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-400"/>
                Universal Transaction Log
              </h1>
            </div>
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Address or TxHash..."
                className="bg-gray-800 text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button 
                type="submit"
                className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <Search className="h-4 w-4 text-white" />
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="pt-8 pb-8 px-4">
        <div className="container mx-auto">
          <div className="bg-gray-900 rounded-xl p-6">
            {loading && (
              <div className="text-center py-12">
                <Loader className="h-10 w-10 text-purple-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading universal log...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12 text-red-400">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <p className="font-semibold mb-2">Error Fetching Log</p>
                <p className="text-sm">{error}</p>
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
                  <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3">Timestamp</th>
                      <th scope="col" className="px-4 py-3">Recipient Address</th>
                      <th scope="col" className="px-4 py-3">Amount</th>
                      <th scope="col" className="px-4 py-3">Risk Level</th>
                      <th scope="col" className="px-4 py-3">Category</th>
                      <th scope="col" className="px-4 py-3">Blockchain Hash</th>
                      <th scope="col" className="px-4 py-3">User ID (Partial)</th> 
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="border-b border-gray-700 hover:bg-gray-800/50">
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(tx.timestamp)}</td>
                        <td className="px-4 py-3 font-mono break-all">{tx.recipientAddress}</td>
                        <td className="px-4 py-3">{tx.amount?.toFixed(2) || 'N/A'}</td>
                        <td className={`px-4 py-3 font-semibold ${getRiskLevelColor(tx.riskLevel)}`}>{tx.riskLevel}</td>
                        <td className="px-4 py-3">{tx.transactionCategory || 'N/A'}</td>
                        <td className="px-4 py-3 font-mono break-all">{tx.blockchainHash || 'Not Logged'}</td>
                         <td className="px-4 py-3 font-mono">{tx.supabaseUserId?.substring(0, 8)}...</td> 
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UniversalBlockchainLog; 