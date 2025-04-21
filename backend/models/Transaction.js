const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    // We'll use the Supabase user ID provided by the frontend
    supabaseUserId: {
        type: String, 
        required: true,
        index: true // Add index for faster querying
    },
    amount: {
        type: Number,
        required: true
    },
    recipientAddress: {
        type: String,
        required: true
    },
    riskLevel: {
        type: String,
        required: true
    },
    confidence: {
        type: String, 
        required: true
    },
    transactionCategory: {
        type: String
    },
    riskFactors: {
        type: [String] 
    },
    securitySuggestions: {
        type: [String] 
    },
    analysisMetrics: { // Include analysis metrics from prediction
        type: Object
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', transactionSchema); 