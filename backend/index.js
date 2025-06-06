const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
const { ethers } = require("ethers");
const blockchainService = require("./services/blockchainService");
const Transaction = require("./models/Transaction");
require('dotenv').config();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// Database Connection With MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})
const upload = multer({ storage: storage })
app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `/images/${req.file.filename}`
  })
})


// Route for Images folder
app.use('/images', express.static('upload/images'));


// MiddleWare to fetch user from token
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};


// Schema for creating user model
const Users = mongoose.model("Users", {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  cartData: { type: Object },
  date: { type: Date, default: Date.now() },
});


// Schema for creating Product
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number },
  old_price: { type: Number },
  date: { type: Date, default: Date.now },
  avilable: { type: Boolean, default: true },
});


// Schema for Transaction Risk Analysis
const TransactionRisk = mongoose.model("TransactionRisk", {
  amount: { type: Number, required: true },
  recipientAddress: { type: String, required: true },
  riskLevel: { type: String, required: true },
  confidence: { type: String, required: true },
  details: { type: String },
  recommendations: [String],
  timestamp: { type: Date, default: Date.now },
  mlPrediction: { type: Number },
  individualPredictions: { type: Array },
  analysisMetrics: {
    velocityScore: { type: Number },
    frequencyScore: { type: Number },
    amountDeviation: { type: Number },
    historicalRiskScore: { type: Number },
    patternMatch: { type: String },
    timeBasedRisk: { type: Number }
  },
  riskFactors: [String],
  securitySuggestions: [String],
  transactionCategory: { type: String }
});


// ROOT API Route For Testing
app.get("/", (req, res) => {
  res.send("Root");
});


// Create an endpoint at ip/login for login the user and giving auth-token
app.post('/login', async (req, res) => {
  console.log("Login Attempt for:", req.body.email);
  let success = false;
  try {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
      // Revert to plain text password comparison
      const passCompare = req.body.password === user.password;

      if (passCompare) {
        const data = {
          user: {
            id: user.id
          }
        }
        success = true;
        console.log("Login Successful for:", user.email, "ID:", user.id);
        const token = jwt.sign(data, 'secret_ecom');
        res.json({ success, token });
      } else {
        console.log("Password comparison failed for:", req.body.email);
        return res.status(400).json({ success: false, errors: "please try with correct email/password" });
      }
    } else {
      console.log("User not found:", req.body.email);
      return res.status(400).json({ success: false, errors: "please try with correct email/password" });
    }
  } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ success: false, errors: "Server error during login." });
  }
})


//Create an endpoint at ip/auth for regestring the user & sending auth-token
app.post('/signup', async (req, res) => {
  console.log("Sign Up");
  let success = false;
  try {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
      return res.status(400).json({ success: false, errors: "existing user found with this email" });
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }

    // Remove password hashing
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new Users({
      name: req.body.username,
      email: req.body.email,
      password: req.body.password, // Save plain text password
      cartData: cart,
    });
    await user.save();
    const data = {
      user: {
        id: user.id
      }
    }

    const token = jwt.sign(data, 'secret_ecom');
    success = true;
    res.json({ success, token })
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, errors: "Failed to create user." });
  }
})


// endpoint for getting all products data
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products");
  res.send(products);
});


// endpoint for getting latest products data
app.get("/newcollections", async (req, res) => {
  let products = await Product.find({});
  let arr = products.slice(0).slice(-8);
  console.log("New Collections");
  res.send(arr);
});


// endpoint for getting womens products data
app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({ category: "women" });
  let arr = products.splice(0, 4);
  console.log("Popular In Women");
  res.send(arr);
});

// endpoint for getting womens products data
app.post("/relatedproducts", async (req, res) => {
  console.log("Related Products");
  const {category} = req.body;
  const products = await Product.find({ category });
  const arr = products.slice(0, 4);
  res.send(arr);
});


// Create an endpoint for saving the product in cart
app.post('/addtocart', fetchuser, async (req, res) => {
  console.log("Add Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
  res.send("Added")
})


// Create an endpoint for removing the product in cart
app.post('/removefromcart', fetchuser, async (req, res) => {
  console.log("Remove Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] != 0) {
    userData.cartData[req.body.itemId] -= 1;
  }
  await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
  res.send("Removed");
})


// Create an endpoint for getting cartdata of user
app.post('/getcart', fetchuser, async (req, res) => {
  console.log("Get Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);

})


// Create an endpoint for adding products using admin panel
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  }
  else { id = 1; }
  const product = new Product({
    id: id,
    name: req.body.name,
    description: req.body.description,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  await product.save();
  console.log("Saved");
  res.json({ success: true, name: req.body.name })
});


// Create an endpoint for removing products using admin panel
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({ success: true, name: req.body.name })
});

// ML Prediction Endpoint
app.post("/api/predict", async (req, res) => {
  try {
    const { amount, recipientAddress, supabaseUserId } = req.body;

    if (!amount || !recipientAddress) {
      return res.status(400).json({ 
        message: "Amount and recipient address are required" 
      });
    }

    // Use our ML service for prediction
    const mlService = require('./services/mlService');
    let predictionData;
    
    try {
      // Call our ML service for prediction
      predictionData = await mlService.predictRisk({
        amount: parseFloat(amount),
        recipientAddress,
        // You can add additional features here if needed
        additionalFeatures: {}
      });

      // Store the prediction in database
      const prediction = new TransactionRisk({
        amount,
        recipientAddress,
        riskLevel: predictionData.riskLevel,
        confidence: predictionData.confidence,
        details: predictionData.details,
        recommendations: predictionData.securitySuggestions,
        mlPrediction: predictionData.analysisMetrics.historicalRiskScore,
        analysisMetrics: predictionData.analysisMetrics,
        riskFactors: predictionData.riskFactors,
        securitySuggestions: predictionData.securitySuggestions,
        transactionCategory: predictionData.transactionCategory
      });

      await prediction.save();
      
      // ENHANCEMENT: Automatically save to blockchain if user is authenticated
      if (supabaseUserId) {
        try {
          console.log("Automatically saving transaction to blockchain...");
          
          // Validate transaction on blockchain
          const blockchainResult = await blockchainService.validateTransaction(
            amount,
            recipientAddress,
            predictionData.riskLevel,
            process.env.PRIVATE_KEY 
          );
          
          if (blockchainResult.success) {
            console.log("Transaction saved to blockchain successfully");
            
            // Add blockchain transaction hash to response
            predictionData.blockchainTxHash = blockchainResult.transactionHash;
            predictionData.savedToBlockchain = true;
            
            // Save the transaction details with blockchain hash
            const transactionRecord = new Transaction({
              supabaseUserId,
              amount,
              recipientAddress,
              riskLevel: predictionData.riskLevel,
              confidence: predictionData.confidence,
              transactionCategory: predictionData.transactionCategory,
              riskFactors: predictionData.riskFactors,
              securitySuggestions: predictionData.securitySuggestions,
              analysisMetrics: predictionData.analysisMetrics,
              blockchainHash: blockchainResult.transactionHash,
              timestamp: new Date()
            });
            
            await transactionRecord.save();
          } else {
            console.error("Failed to save to blockchain:", blockchainResult.error);
            predictionData.blockchainError = blockchainResult.error;
            predictionData.savedToBlockchain = false;
          }
        } catch (blockchainError) {
          console.error("Error saving to blockchain:", blockchainError);
          predictionData.blockchainError = blockchainError.message;
          predictionData.savedToBlockchain = false;
        }
      } else {
        predictionData.savedToBlockchain = false;
        predictionData.blockchainMessage = "Login required to save to blockchain";
      }

      // Send the prediction response to frontend
      res.json(predictionData);

    } catch (mlError) {
      console.error("ML Service Error:", mlError.message);
      
      // Try fallback prediction if ML service fails
      try {
        const fallbackPrediction = mlService.fallbackPrediction(parseFloat(amount), recipientAddress);
        
        // Store the fallback prediction
        const prediction = new TransactionRisk({
          amount,
          recipientAddress,
          riskLevel: fallbackPrediction.riskLevel,
          confidence: fallbackPrediction.confidence,
          details: fallbackPrediction.details + " (fallback)",
          recommendations: fallbackPrediction.securitySuggestions,
          mlPrediction: fallbackPrediction.analysisMetrics.historicalRiskScore,
          analysisMetrics: fallbackPrediction.analysisMetrics,
          riskFactors: [...(fallbackPrediction.riskFactors || []), "Used fallback prediction"],
          securitySuggestions: fallbackPrediction.securitySuggestions,
          transactionCategory: fallbackPrediction.transactionCategory
        });
        
        await prediction.save();
        
        // Send fallback response
        res.json(fallbackPrediction);
        
      } catch (fallbackError) {
        console.error("Fallback prediction error:", fallbackError);
        res.status(500).json({ 
          message: "Error in ML service and fallback prediction. Please try again." 
        });
      }
    }

  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ 
      message: "Error processing prediction request",
      error: error.message 
    });
  }
});

// Helper function to determine transaction pattern
function determineTransactionPattern(amount, velocity, timeOfDay) {
  if (velocity === 0) return "First transaction of the day";
  if (velocity > 5) return "High-frequency trading pattern";
  if (amount > 1000000) return "Large-value transaction pattern";
  if (timeOfDay >= 9 && timeOfDay <= 17) return "Normal business hours pattern";
  return "Standard transaction pattern";
}

// Helper function to calculate historical risk
function calculateHistoricalRisk(recentTransactions) {
  if (recentTransactions.length === 0) return 0.5;
  
  const highRiskCount = recentTransactions.filter(tx => tx.riskLevel === "High").length;
  const mediumRiskCount = recentTransactions.filter(tx => tx.riskLevel === "Medium").length;
  
  return (highRiskCount * 1 + mediumRiskCount * 0.5) / recentTransactions.length;
}

// Update the transaction route to use smart contract
app.post("/api/transactions", async (req, res) => {
    try {
        // Expect supabaseUserId from the frontend for this specific action
        const { amount, recipientAddress, supabaseUserId } = req.body;

        if (!supabaseUserId) {
           return res.status(400).json({ success: false, error: 'supabaseUserId is required in the request body' });
        }

        // Get risk assessment from our ML service
        const mlService = require('./services/mlService');
        let mlResponse;
        
        try {
            // Call our ML service for prediction
            mlResponse = await mlService.predictRisk({
                amount: parseFloat(amount),
                recipientAddress,
                additionalFeatures: {}
            });
        } catch (mlError) {
            console.error("ML Service Error:", mlError.message);
            // Use fallback prediction if ML service fails
            mlResponse = mlService.fallbackPrediction(parseFloat(amount), recipientAddress);
            console.log("Using fallback prediction:", mlResponse);
        }

        // Extract all necessary details from ML response
        const { 
            riskLevel, 
            confidence, 
            transactionCategory, 
            riskFactors, 
            securitySuggestions,
            analysisMetrics 
        } = mlResponse;

        // Validate transaction on blockchain
        const blockchainResult = await blockchainService.validateTransaction(
            amount,
            recipientAddress,
            riskLevel, // Pass riskLevel to the contract
            process.env.PRIVATE_KEY 
        );

        if (!blockchainResult.success) {
            return res.status(400).json({
                success: false,
                error: blockchainResult.error || "Transaction validation failed on blockchain"
            });
        }

        // Save to MongoDB (using correct fields for Transaction model)
        const transactionRecord = new Transaction({
            supabaseUserId, // Use ID from request
            amount,
            recipientAddress,
            riskLevel,
            confidence, // Add confidence
            transactionCategory, // Add category
            riskFactors, // Add factors
            securitySuggestions, // Add suggestions
            analysisMetrics, // Add metrics
            // Add the blockchain hash if you want it in this record too
            // blockchainHash: blockchainResult.transactionHash, 
            timestamp: new Date()
        });

        await transactionRecord.save();

        res.json({
            success: true,
            message: "Transaction logged to blockchain and saved to DB", // Updated message
            transaction: transactionRecord, // Return the saved DB record
            blockchainHash: blockchainResult.transactionHash
        });
    } catch (error) {
        // Handle potential errors from ML call, blockchain call, or DB save
        console.error("Error processing transaction:", error);
        // Send back specific Mongoose validation errors if they exist
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, error: "Database validation failed", details: error.errors });
        }
        // Send back blockchain error if it exists
        if (error.message.includes("blockchain")) {
             return res.status(400).json({ success: false, error: error.message });
        }
        // Generic error
        res.status(500).json({
            success: false,
            error: error.message || "Error processing transaction"
        });
    }
});

// Add route to get transaction history from blockchain
app.get("/api/transactions/history/:userAddress", async (req, res) => {
    try {
        const { userAddress } = req.params;
        const result = await blockchainService.getTransactionHistory(userAddress);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: "Error fetching transaction history"
            });
        }

        res.json({
            success: true,
            transactions: result.transactions
        });
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        res.status(500).json({
            success: false,
            error: "Error fetching transaction history"
        });
    }
});

// Endpoint to Save Transaction History (Supabase Auth)
app.post('/api/transactions/save', async (req, res) => {
  try {
    const { 
      supabaseUserId, // Expecting this from frontend
      amount, 
      recipientAddress, 
      riskLevel, 
      confidence, 
      transactionCategory, 
      riskFactors, 
      securitySuggestions,
      analysisMetrics // Added analysis metrics
    } = req.body;

    // Basic validation
    if (!supabaseUserId || !amount || !recipientAddress || !riskLevel || !confidence) {
      return res.status(400).json({ success: false, error: 'Missing required transaction fields (including supabaseUserId)' });
    }

    const transaction = new Transaction({
      supabaseUserId,
      amount,
      recipientAddress,
      riskLevel,
      confidence,
      transactionCategory,
      riskFactors,
      securitySuggestions,
      analysisMetrics
      // Timestamp is added by default
    });

    await transaction.save();
    
    console.log("Transaction saved for Supabase User:", supabaseUserId);
    res.json({ success: true, message: 'Transaction saved successfully', transaction });

  } catch (error) {
    console.error("Error saving transaction:", error);
    res.status(500).json({ success: false, error: 'Failed to save transaction' });
  }
});

// REORDERED: Universal Log endpoint now comes BEFORE the user-specific one
// NEW: Endpoint to Get ALL Transaction History (Universal Log) - SIMPLIFIED
app.get('/api/transactions/history/all', async (req, res) => {
  console.log("==== RECEIVED REQUEST for /api/transactions/history/all (SIMPLIFIED HANDLER) ====");
  try {
    // --- Temporarily removed all search logic --- 
    // const { q } = req.query; 
    // let filter = {};
    // if (q) { ... build filter ... }

    // Fetch ALL transactions without any filter
    const transactions = await Transaction.find({}) // Find all
                                          .sort({ timestamp: -1 })
                                          .limit(200); 

    console.log(`Fetched all transactions (unfiltered). Count: ${transactions.length}`);
    res.json({ success: true, transactions });

  } catch (error) {
    console.error("==== CAUGHT ERROR in /api/transactions/history/all (SIMPLIFIED HANDLER) ====");
    console.error("Detailed error fetching all transaction history:", error);
    let errorMessage = 'Failed to fetch universal transaction history.';
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
        errorMessage = 'Database query failed while fetching universal history.';
    }
    res.status(500).json({ success: false, error: errorMessage }); 
  }
});

// Endpoint to Get Transaction History for a User (Supabase Auth)
// Expects supabaseUserId as a query parameter, e.g., /api/transactions/history?userId=xxx
app.get('/api/transactions/history', async (req, res) => {
  try {
    const { userId, riskLevel, address, startDate, endDate } = req.query; // Get Supabase user ID and potential filters
    if (!userId) {
      // This check is still valid for this specific endpoint
      return res.status(400).json({ success: false, error: 'Missing required userId query parameter' }); 
    }

    // Build filter object
    const filter = { supabaseUserId: userId };
    if (riskLevel && riskLevel !== 'all') filter.riskLevel = riskLevel; 
    if (address) filter.recipientAddress = { $regex: address, $options: 'i' };
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) {
         const endOfDay = new Date(endDate);
         endOfDay.setDate(endOfDay.getDate() + 1);
         filter.timestamp.$lt = endOfDay; 
      }      
    }

    const transactions = await Transaction.find(filter).sort({ timestamp: -1 }); 
    
    console.log(`Fetched history for Supabase User: ${userId}, Count: ${transactions.length}, Filters: ${JSON.stringify(filter)}`);
    res.json({ success: true, transactions });

  } catch (error) {
    console.error("Error fetching transaction history:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch transaction history' });
  }
});

// Updated /api/blockchain/history endpoint 
app.get('/api/blockchain/history', async (req, res) => {
  console.log("Fetching blockchain history");
  try {
    const { address, riskLevel, startDate, endDate } = req.query;
    let targetAddress = address; // Use address from query if provided

    // If no address is provided in query, get the default backend wallet address
    if (!targetAddress) {
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        return res.status(500).json({ success: false, error: 'Backend private key not configured.' });
      }
      const wallet = new ethers.Wallet(privateKey);
      targetAddress = wallet.address;
      console.log(`No address provided, using backend wallet address: ${targetAddress}`);
    } else {
      console.log(`Fetching history for provided address: ${targetAddress}`);
    }
    
    // Fetch ALL transactions for the target address from the blockchain service
    // Note: Applying a reasonable limit here if the service supports it would be good practice.
    // Assuming getTransactionHistory fetches all for now.
    const result = await blockchainService.getTransactionHistory(targetAddress);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || "Error fetching blockchain transaction history"
      });
    }

    // --- Apply Filters Post-Fetch ---
    let filteredTransactions = result.transactions;
    console.log(`Initial transactions fetched from blockchain service: ${filteredTransactions.length}`);

    if (riskLevel && riskLevel !== 'all') {
      filteredTransactions = filteredTransactions.filter(tx => tx.riskLevel === riskLevel);
    }
    
    // Convert date strings to Date objects for comparison
    let start = startDate ? new Date(startDate) : null;
    let end = endDate ? new Date(endDate) : null;
    
    if (start || end) {
      // Adjust end date to be inclusive (end of the day)
      if (end) {
         end.setHours(23, 59, 59, 999);
      }
      
      filteredTransactions = filteredTransactions.filter(tx => {
        const txDate = new Date(tx.timestamp * 1000); // Assuming timestamp is in seconds
        const afterStart = start ? txDate >= start : true;
        const beforeEnd = end ? txDate <= end : true;
        return afterStart && beforeEnd;
      });
    }
    // --- End Filter Logic ---

    console.log(`Transactions after filtering: ${filteredTransactions.length}`);

    res.json({
      success: true,
      transactions: filteredTransactions,
      address: targetAddress // Return the address used for fetching
    });
  } catch (error) {
    console.error("Error fetching blockchain history:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error fetching blockchain history' 
    }); 
  }
});

// Endpoint to get the public address of the backend wallet
app.get('/api/blockchain/wallet-address', (req, res) => {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      return res.status(500).json({ success: false, error: 'Private key not configured on backend.' });
    }
    const wallet = new ethers.Wallet(privateKey);
    res.json({ success: true, address: wallet.address });
  } catch (e) { 
    console.error("Error deriving wallet address:", e);
    res.status(500).json({ success: false, error: 'Could not derive wallet address from backend key.' }); 
  }
});

// Starting Express Server
app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});