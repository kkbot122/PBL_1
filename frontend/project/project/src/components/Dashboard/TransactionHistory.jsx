import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Filter, AlertTriangle, Loader, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [filters, setFilters] = useState({
    riskLevel: 'all', // 'all', 'Low', 'Low-Medium', 'Medium', 'Medium-High', 'High'
    address: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError("User not found. Please log in.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Build query parameters from filter state
      const params = new URLSearchParams({ userId: user.id });
      if (filters.riskLevel && filters.riskLevel !== 'all') {
        params.append('riskLevel', filters.riskLevel);
      }
      if (filters.address) {
        params.append('address', filters.address);
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }

      const response = await axios.get(`http://localhost:4000/api/transactions/history?${params.toString()}`);
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
  }, [user, filters]); // Re-run fetchHistory when user or filters change

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]); // Use fetchHistory as dependency

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchHistory(); // Fetch data with the current filters
  };

  const resetFilters = () => {
    setFilters({ riskLevel: 'all', address: '', startDate: '', endDate: '' });
    // We need to trigger a refetch after resetting
    // Since fetchHistory depends on filters, changing filters state will trigger it via useEffect
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
     const colors = {
      'Low': "text-green-400",
      'Low-Medium': "text-blue-400",
      'Medium': "text-yellow-400",
      'Medium-High': "text-orange-400",
      'High': "text-red-400"
    }; // Brighter colors for dark background
    return colors[level] || "text-gray-400";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </button>
              <h1 className="text-xl font-bold">My Transaction History</h1>
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-red-700'}`}
              title={showFilters ? "Hide Filters" : "Show Filters"}
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Filter Section */}
      {showFilters && (
        <div className="bg-gray-800 py-4 px-4 sticky top-[65px] z-9 border-b border-gray-700">
          <div className="container mx-auto">
             <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
               {/* Risk Level Filter */}
               <div>
                <label htmlFor="riskLevel" className="block text-xs font-medium text-gray-400 mb-1">Risk Level</label>
                <select
                  id="riskLevel"
                  name="riskLevel"
                  value={filters.riskLevel}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="all">All Levels</option>
                  <option value="Low">Low</option>
                  <option value="Low-Medium">Low-Medium</option>
                  <option value="Medium">Medium</option>
                  <option value="Medium-High">Medium-High</option>
                  <option value="High">High</option>
                </select>
               </div>

               {/* Address Filter */}
               <div>
                <label htmlFor="address" className="block text-xs font-medium text-gray-400 mb-1">Recipient Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={filters.address}
                  onChange={handleFilterChange}
                  placeholder="Enter address..."
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                />
               </div>

               {/* Start Date Filter */}
               <div>
                <label htmlFor="startDate" className="block text-xs font-medium text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                />
               </div>

                {/* End Date Filter */}
               <div>
                <label htmlFor="endDate" className="block text-xs font-medium text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                />
               </div>

               {/* Action Buttons */}
               <div className="flex space-x-2">
                 <button
                    onClick={applyFilters}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={resetFilters}
                    className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors" 
                    title="Reset Filters"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
               </div>
             </div>
          </div>
        </div>
      )}

      <main className="pt-8 pb-8 px-4">
        <div className="container mx-auto max-w-6xl"> 
          <div className="bg-gray-900 rounded-xl p-6">
            {loading && (
              <div className="text-center py-12">
                <Loader className="h-10 w-10 text-red-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading history...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12 text-red-400">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <p className="font-semibold mb-2">Error Fetching History</p>
                <p className="text-sm">{error}</p>
                 <button
                  onClick={fetchHistory} // Allow retry
                  className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4"/>
                  <span>Retry</span>
                </button>
              </div>
            )}

            {!loading && !error && transactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No transactions found for the selected filters.</p>
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
                      <th scope="col" className="px-4 py-3">Confidence</th>
                      <th scope="col" className="px-4 py-3">Category</th>
                      <th scope="col" className="px-4 py-3">Blockchain Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="border-b border-gray-700 hover:bg-gray-800/50">
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(tx.timestamp)}</td>
                        <td className="px-4 py-3 font-mono break-all">{tx.recipientAddress}</td>
                        <td className="px-4 py-3">{tx.amount?.toFixed(2) || 'N/A'}</td>
                        <td className={`px-4 py-3 font-semibold ${getRiskLevelColor(tx.riskLevel)}`}>{tx.riskLevel}</td>
                        <td className="px-4 py-3">{tx.confidence || 'N/A'}</td>
                        <td className="px-4 py-3">{tx.transactionCategory || 'N/A'}</td>
                        <td className="px-4 py-3 font-mono break-all">{tx.blockchainHash || 'N/A'}</td>
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

export default TransactionHistory; 