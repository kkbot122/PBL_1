import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Wallet, Settings, LogOut, History, Shield, AlertTriangle, CheckCircle, Activity, Clock, TrendingUp, AlertOctagon, Save, Anchor, Database } from "lucide-react";
import axios from "axios";
import FraudDetectionDashboard from "./FraudDetectionDashboard";

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState({ loading: false, error: null, success: false });
  const [blockchainStatus, setBlockchainStatus] = useState({ loading: false, error: null, success: false, txHash: null });

  const handlePrediction = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    setSaveStatus({ loading: false, error: null, success: false });
    setBlockchainStatus({ loading: false, error: null, success: false, txHash: null });
    
    try {
      const response = await axios.post('http://localhost:4000/api/predict', {
        amount: parseFloat(amount),
        recipientAddress: recipientAddress,
        supabaseUserId: user?.id
      });

      setPrediction(response.data);
      
      if (response.data.savedToBlockchain) {
        setBlockchainStatus({
          loading: false,
          error: null,
          success: true,
          txHash: response.data.blockchainTxHash
        });
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setError(error.response?.data?.message || "Failed to get prediction");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTransaction = async () => {
    if (!prediction || !user) {
      console.error("Cannot save: Missing prediction data or user not logged in.");
      setSaveStatus({ loading: false, error: "Cannot save transaction data.", success: false });
      return;
    } 

    setSaveStatus({ loading: true, error: null, success: false });
    
    try {
      const payload = {
        supabaseUserId: user.id,
        amount: parseFloat(amount),
        recipientAddress: recipientAddress,
        riskLevel: prediction.riskLevel,
        confidence: prediction.confidence,
        transactionCategory: prediction.transactionCategory,
        riskFactors: prediction.riskFactors,
        securitySuggestions: prediction.securitySuggestions,
        analysisMetrics: prediction.analysisMetrics
      };

      const response = await axios.post('http://localhost:4000/api/transactions/save', payload);

      if (response.data.success) {
        setSaveStatus({ loading: false, error: null, success: true });
      } else {
        setSaveStatus({ loading: false, error: response.data.error || "Failed to save transaction", success: false });
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
      setSaveStatus({ loading: false, error: error.response?.data?.error || "An error occurred while saving.", success: false });
    } 
  };

  const handleLogToBlockchain = async () => {
    if (!prediction || !user) { 
      console.error("Cannot log to chain: Missing prediction data or user not logged in.");
      setBlockchainStatus({ loading: false, error: "Cannot log transaction data.", success: false, txHash: null });
      return;
    } 

    setBlockchainStatus({ loading: true, error: null, success: false, txHash: null });

    try {
      const payload = {
        supabaseUserId: user.id,
        amount: parseFloat(amount), 
        recipientAddress: recipientAddress
      };

      const response = await axios.post('http://localhost:4000/api/transactions', payload);

      if (response.data.success) {
        setBlockchainStatus({ 
          loading: false, 
          error: null, 
          success: true, 
          txHash: response.data.blockchainHash 
        });
      } else {
        setBlockchainStatus({ 
          loading: false, 
          error: response.data.error || "Failed to log transaction on blockchain", 
          success: false, 
          txHash: null 
        });
      }
    } catch (error) {
      console.error("Error logging transaction to blockchain:", error);
      setBlockchainStatus({ 
        loading: false, 
        error: error.response?.data?.error || "An error occurred while logging to blockchain.", 
        success: false, 
        txHash: null 
      });
    } 
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      Low: "text-green-500",
      Medium: "text-yellow-500",
      High: "text-red-500"
    };
    return colors[level] || "text-gray-500";
  };

  const getMetricColor = (value, threshold) => {
    if (value > threshold.high) return "text-red-500";
    if (value > threshold.medium) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg fixed w-full z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Wallet className="h-6 w-6 text-red-500" />
            <span className="text-xl font-bold text-white">SecureFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-800 rounded-lg">
              <Settings className="h-5 w-5 text-white" />
            </button>
            <button onClick={signOut} className="p-2 hover:bg-gray-800 rounded-lg">
              <LogOut className="h-5 w-5 text-red-500" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto">
          <div className="grid gap-6 md:grid-cols-12">
            {/* Left Section - ML Predictor */}
            <div className="md:col-span-8 space-y-6">
              <div className="bg-gray-900 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Transaction Fraud Detection</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <label className="block text-sm text-gray-400 mb-2">Amount</label>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                        placeholder="Enter amount"
                      />
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <label className="block text-sm text-gray-400 mb-2">Recipient Address</label>
                      <input 
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                        placeholder="Enter recipient address"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handlePrediction}
                    disabled={loading || !amount || !recipientAddress}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Analyzing...' : 'Detect Fraud Risk'}
                  </button>

                  {error && (
                    <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-200">{error}</p>
                    </div>
                  )}

                  {prediction && (
                    <FraudDetectionDashboard prediction={prediction} />
                  )}

                  {prediction && !prediction.savedToBlockchain && !saveStatus.success && (
                    <div className="mt-6">
                      <button 
                        onClick={handleSaveTransaction}
                        disabled={saveStatus.loading || !user}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 mb-3"
                      >
                        <Save className="h-5 w-5" />
                        <span>{saveStatus.loading ? 'Saving...' : 'Save Transaction to DB History'}</span>
                      </button>
                      {saveStatus.error && (
                        <p className="text-red-400 text-sm mt-2 text-center">Error: {saveStatus.error}</p>
                      )}
                    </div>
                  )}
                  {saveStatus.success && (
                     <div className="mt-6 mb-3 bg-green-900/50 border border-green-500 p-4 rounded-lg flex items-center justify-center space-x-2">
                       <CheckCircle className="h-5 w-5 text-green-500" />
                       <p className="text-green-200">Transaction saved to DB successfully!</p>
                     </div>
                  )}

                  {prediction && !prediction.savedToBlockchain && !blockchainStatus.success && (
                    <div className="mt-2">
                      <button 
                        onClick={handleLogToBlockchain}
                        disabled={blockchainStatus.loading || !user || !prediction}
                        className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Anchor className="h-5 w-5" />
                        <span>{blockchainStatus.loading ? 'Logging to Blockchain...' : 'Log Transaction On-Chain'}</span>
                      </button>
                      {blockchainStatus.error && (
                        <p className="text-red-400 text-sm mt-2 text-center">Error: {blockchainStatus.error}</p>
                      )}
                    </div>
                  )}
                  {blockchainStatus.success && (
                     <div className="mt-2 bg-green-900/50 border border-green-500 p-4 rounded-lg flex items-center justify-center space-x-2">
                       <CheckCircle className="h-5 w-5 text-green-500" />
                       <div>
                         <p className="text-green-200">Transaction logged on blockchain!</p>
                         {blockchainStatus.txHash && (
                           <p className="text-xs text-gray-400 mt-1">Tx Hash: <span className="font-mono break-all">{blockchainStatus.txHash}</span></p>
                         )}
                       </div>
                     </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="md:col-span-4 space-y-6">
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-red-500">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h2 className="font-bold text-xl text-white mb-1">{user?.user_metadata?.name || "User"}</h2>
                  <p className="text-gray-400 text-sm">{user?.email || "No email found"}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => navigate('/transaction-history')}
                    className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-white"
                  >
                    <History className="h-5 w-5" />
                    <span>DB Transaction History</span>
                  </button>
                  <button 
                    onClick={() => navigate('/blockchain-history')}
                    className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-white"
                  >
                    <Anchor className="h-5 w-5" />
                    <span>Blockchain Transaction Log</span>
                  </button>
                  <button 
                    onClick={() => navigate('/universal-log')}
                    className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-white"
                  >
                    <Database className="h-5 w-5 text-purple-400" />
                    <span>Universal Transaction Log</span>
                  </button>
                  <button 
                    onClick={() => navigate('/security-settings')}
                    className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-white"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Security Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
