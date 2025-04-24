import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
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

  const handleLogout = () => {
    signOut();
    navigate('/'); // Redirect to home page after logout
  };

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
      {/* Top Navigation */}
      <nav className="bg-gray-900 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-red-500" />
          <span className="text-white text-xl font-semibold">SecureFlow</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/settings" className="text-white hover:text-gray-300">
            <Settings className="h-5 w-5" />
          </Link>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-400">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6 flex gap-6">
        {/* Left Column - Fraud Detection Form */}
        <div className="flex-1">
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Transaction Fraud Detection</h2>
            
            <div className="mb-4">
              <label className="block text-sm mb-2">Amount</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full bg-gray-800 text-white p-3 rounded-md"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm mb-2">Recipient Address</label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Enter recipient address"
                className="w-full bg-gray-800 text-white p-3 rounded-md"
              />
            </div>
            
            <button 
              onClick={handlePrediction}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-md transition-colors"
            >
              Detect Fraud Risk
            </button>
          </div>
        </div>

        {/* Right Column - User Info & Quick Actions */}
        <div className="w-96 space-y-6">
          {/* User Profile Card */}
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <h2 className="text-xl font-bold">User</h2>
            <p className="text-gray-400 text-sm">{user?.email || "No email found"}</p>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/transaction-history" className="flex items-center p-3 hover:bg-gray-800 rounded-md">
                <History className="h-5 w-5 mr-3 text-blue-400" />
                <span>DB Transaction History</span>
              </Link>
              
              <Link to="/blockchain-history" className="flex items-center p-3 hover:bg-gray-800 rounded-md">
                <Anchor className="h-5 w-5 mr-3 text-blue-400" />
                <span>Blockchain Transaction Log</span>
              </Link>
              
              <Link to="/universal-log" className="flex items-center p-3 hover:bg-gray-800 rounded-md">
                <Database className="h-5 w-5 mr-3 text-blue-400" />
                <span>Universal Transaction Log</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
