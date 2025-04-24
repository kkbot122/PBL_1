import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { 
  Shield, 
  Settings, 
  LogOut, 
  History, 
  AlertTriangle, 
  CheckCircle, 
  Save, 
  Anchor
} from "lucide-react";
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

  // Initialize and validate localStorage for blockchain transactions
  useEffect(() => {
    console.log("Initializing transaction storage");
    
    // For debugging, uncomment this line to reset localStorage
    // localStorage.removeItem('blockchainTransactions');
    // localStorage.removeItem('dbTransactions');
    
    // Initialize blockchain transactions storage if needed
    try {
      // Check and initialize blockchain transactions
      const storedBlockchain = localStorage.getItem('blockchainTransactions');
      if (!storedBlockchain) {
        // No data found, initialize empty array
        localStorage.setItem('blockchainTransactions', JSON.stringify([]));
        console.log("Initialized empty blockchain transactions array");
      } else {
        // Validate existing data
        try {
          const parsed = JSON.parse(storedBlockchain);
          if (!Array.isArray(parsed)) {
            console.error("Blockchain transactions is not an array, resetting");
            localStorage.setItem('blockchainTransactions', JSON.stringify([]));
          } else {
            console.log(`Found ${parsed.length} existing blockchain transactions`);
          }
        } catch (e) {
          console.error("Invalid JSON in localStorage for blockchain, resetting", e);
          localStorage.setItem('blockchainTransactions', JSON.stringify([]));
        }
      }
      
      // Check and initialize DB transactions
      const storedDB = localStorage.getItem('dbTransactions');
      if (!storedDB) {
        // No data found, initialize empty array
        localStorage.setItem('dbTransactions', JSON.stringify([]));
        console.log("Initialized empty DB transactions array");
      } else {
        // Validate existing data
        try {
          const parsed = JSON.parse(storedDB);
          if (!Array.isArray(parsed)) {
            console.error("DB transactions is not an array, resetting");
            localStorage.setItem('dbTransactions', JSON.stringify([]));
          } else {
            console.log(`Found ${parsed.length} existing DB transactions`);
          }
        } catch (e) {
          console.error("Invalid JSON in localStorage for DB, resetting", e);
          localStorage.setItem('dbTransactions', JSON.stringify([]));
        }
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }
  }, []);

  // Handle user logout
  const handleLogout = () => {
    signOut();
    navigate('/'); // Redirect to home page after logout
  };

  // Handle fraud prediction
  const handlePrediction = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    setSaveStatus({ loading: false, error: null, success: false });
    setBlockchainStatus({ loading: false, error: null, success: false, txHash: null });
    
    // Validate inputs
    if (!amount || isNaN(parseFloat(amount))) {
      setError("Please enter a valid amount");
      setLoading(false);
      return;
    }
    
    if (!recipientAddress || recipientAddress.trim().length < 10) {
      setError("Please enter a valid recipient address");
      setLoading(false);
      return;
    }
    
    try {
      // Generate mock prediction data instead of making API call
      const mockPrediction = generateMockPrediction(amount, recipientAddress);
      setPrediction(mockPrediction);
    } catch (error) {
      console.error('Prediction error:', error);
      setError("Failed to generate prediction");
    } finally {
      setLoading(false);
    }
  };

  // Generate mock prediction data
  const generateMockPrediction = (amount, address) => {
    const amountNum = parseFloat(amount);
    
    // Determine risk level based on amount
    let riskLevel = "Low";
    if (amountNum > 10000) riskLevel = "High";
    else if (amountNum > 1000) riskLevel = "Medium";
    
    // Generate confidence score (0.1-1.0)
    const confidence = Math.max(0.1, Math.min(1.0, (Math.random() * 0.5) + (amountNum > 5000 ? 0.5 : 0.3)));
    
    // Risk factors based on amount and address pattern
    const riskFactors = [];
    if (amountNum > 10000) riskFactors.push("Large transaction amount");
    if (amountNum > 50000) riskFactors.push("Very large transaction amount");
    if (address.includes("0x")) riskFactors.push("Cryptocurrency wallet pattern detected");
    
    return {
      riskLevel,
      confidence: confidence.toFixed(2),
      transactionCategory: "Transfer",
      riskFactors,
      securitySuggestions: [
        "Enable two-factor authentication for this transaction",
        "Verify recipient identity before proceeding",
        "Consider additional verification steps",
        "Automatic blockchain storage enabled for all transactions"
      ],
      analysisMetrics: {
        anomalyScore: (Math.random() * 100).toFixed(1),
        velocityIndex: (Math.random() * 80).toFixed(1),
        patternMatch: (Math.random() * 90).toFixed(1),
        geolocationRisk: (Math.random() * 70).toFixed(1)
      },
      savedToBlockchain: false
    };
  };

  // Save transaction to database
  const handleSaveTransaction = async () => {
    if (!prediction || !user) {
      console.error("Cannot save: Missing prediction data or user not logged in.");
      setSaveStatus({ loading: false, error: "Cannot save transaction data.", success: false });
      return;
    } 

    setSaveStatus({ loading: true, error: null, success: false });
    
    try {
      // Create transaction data object
      const transaction = {
        supabaseUserId: user.id || "user123",
        amount: parseFloat(amount),
        recipientAddress,
        riskLevel: prediction.riskLevel,
        confidence: prediction.confidence,
        transactionCategory: prediction.transactionCategory || "Transfer",
        timestamp: new Date().toISOString(),
        status: "Saved"
      };
      
      console.log("Saving transaction to DB:", transaction);
      
      // Get existing DB transactions from localStorage
      let transactions = [];
      try {
        const stored = localStorage.getItem('dbTransactions');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            transactions = parsed;
          }
        }
      } catch (e) {
        console.error("Error parsing stored transactions:", e);
      }
      
      // Add new transaction and save
      transactions.push(transaction);
      localStorage.setItem('dbTransactions', JSON.stringify(transactions));
      
      // Mock a successful DB save delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Success
      setSaveStatus({ loading: false, error: null, success: true });
    } catch (error) {
      console.error("Error saving transaction:", error);
      setSaveStatus({ loading: false, error: "Failed to save transaction to database", success: false });
    } 
  };

  // Log transaction to blockchain
  const handleLogToBlockchain = async () => {
    if (!prediction || !user) {
      console.error("Cannot log to blockchain: Missing prediction data or user not logged in.");
      setBlockchainStatus({ loading: false, error: "Cannot log transaction data.", success: false, txHash: null });
      return;
    }

    setBlockchainStatus({ loading: true, error: null, success: false, txHash: null });

    try {
      // Create a unique transaction hash
      const txHash = "0x" + Math.random().toString(16).substring(2, 20) + Date.now().toString(16);
      
      // Create transaction object
      const transaction = {
        supabaseUserId: user.id || "user123",
        amount: parseFloat(amount),
        recipientAddress,
        riskLevel: prediction.riskLevel,
        timestamp: new Date().toISOString(),
        txHash
      };
      
      console.log("Saving blockchain transaction:", transaction);
      
      // Get existing transactions
      let transactions = [];
      try {
        const stored = localStorage.getItem('blockchainTransactions');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            transactions = parsed;
          }
        }
      } catch (e) {
        console.error("Error parsing stored transactions:", e);
      }
      
      // Add new transaction and save
      transactions.push(transaction);
      localStorage.setItem('blockchainTransactions', JSON.stringify(transactions));
      
      // Update UI
      setBlockchainStatus({
        loading: false,
        error: null,
        success: true,
        txHash
      });
    } catch (error) {
      console.error("Error logging to blockchain:", error);
      setBlockchainStatus({
        loading: false,
        error: "Failed to log transaction to blockchain",
        success: false,
        txHash: null
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Top Navigation */}
      <nav className="bg-[#0f172a] p-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-red-500" />
          <span className="text-white text-xl font-semibold">SecureFlow</span>
        </div>
        <div className="flex items-center space-x-4">
          <Settings className="h-5 w-5 text-white" />
          <button onClick={handleLogout} className="text-red-500 hover:text-red-400">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6 flex flex-col md:flex-row gap-6">
        {/* Left Column - Fraud Detection Form */}
        <div className="flex-1">
          <div className="bg-[#1e293b] rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Transaction Fraud Detection</h2>
            
            <div className="mb-4">
              <label className="block text-sm mb-2">Amount</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full bg-[#0f172a] text-white p-3 rounded-md"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm mb-2">Recipient Address</label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Enter recipient address"
                className="w-full bg-[#0f172a] text-white p-3 rounded-md"
              />
            </div>
            
            <button 
              onClick={handlePrediction}
              disabled={loading || !amount || !recipientAddress}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Detect Fraud Risk'}
            </button>

            {error && (
              <div className="mt-4 bg-red-900/50 border border-red-500 p-4 rounded-lg flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {prediction && (
              <div className="mt-6">
                <FraudDetectionDashboard prediction={prediction} />
              </div>
            )}

            {prediction && !prediction.savedToBlockchain && !saveStatus.success && (
              <div className="mt-6">
                <button 
                  onClick={handleSaveTransaction}
                  disabled={saveStatus.loading || !user}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md transition-colors disabled:opacity-50 mb-3"
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
                  className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md transition-colors disabled:opacity-50"
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

        {/* Right Column - User Info & Quick Actions */}
        <div className="w-full md:w-96 space-y-6">
          {/* User Profile Card */}
          <div className="bg-[#1e293b] rounded-lg p-6 text-center">
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <h2 className="text-xl font-bold">User</h2>
            <p className="text-gray-400 text-sm">{user?.email || "No email found"}</p>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#1e293b] rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/transaction-history" className="flex items-center p-3 hover:bg-[#0f172a] rounded-md">
                <History className="h-5 w-5 mr-3 text-blue-400" />
                <span>DB Transaction History</span>
              </Link>
              
              <Link to="/blockchain-history" className="flex items-center p-3 hover:bg-[#0f172a] rounded-md">
                <Anchor className="h-5 w-5 mr-3 text-blue-400" />
                <span>Blockchain Transaction Log</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
