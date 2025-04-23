#!/usr/bin/env python3
import argparse
import json
import pickle
import os
import sys
import numpy as np
from datetime import datetime
import traceback

# Parse command line arguments
parser = argparse.ArgumentParser(description='Predict transaction risk using trained models')
parser.add_argument('--amount', type=float, required=True, help='Transaction amount')
parser.add_argument('--recipient', type=str, required=True, help='Recipient address')
parser.add_argument('--features', type=str, default='{}', help='Additional features as JSON')

args = parser.parse_args()

# Constants
MODEL_DIR_1 = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models', 'hybridmodel1')
MODEL_DIR_2 = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models', 'hybridmodel2')

# Transaction history (simulated for now, in production this would come from a database)
transaction_history = []

def load_model(model_path):
    """Load a pickled model from file"""
    try:
        with open(model_path, 'rb') as f:
            return pickle.load(f)
    except Exception as e:
        print(f"Error loading model from {model_path}: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return None

def prepare_features(amount, recipient_address, additional_features=None):
    """Prepare features for model input"""
    if additional_features is None:
        additional_features = {}
        
    # Get current time features
    now = datetime.now()
    hour_of_day = now.hour
    day_of_week = now.weekday()
    
    # Calculate transaction patterns
    recent_transactions = [tx for tx in transaction_history if (now - tx['timestamp']).total_seconds() < 86400]  # Last 24 hours
    
    tx_count_24h = len(recent_transactions)
    amount_mean = np.mean([tx['amount'] for tx in recent_transactions]) if tx_count_24h > 0 else amount
    amount_std = np.std([tx['amount'] for tx in recent_transactions]) if tx_count_24h > 0 else 0
    amount_max = max([tx['amount'] for tx in recent_transactions]) if tx_count_24h > 0 else amount
    
    # Time since last transaction (in hours)
    if len(transaction_history) > 0:
        last_tx_time = max([tx['timestamp'] for tx in transaction_history])
        time_since_last = (now - last_tx_time).total_seconds() / 3600
    else:
        time_since_last = 24  # Default if no previous transactions
    
    # Transaction frequency
    tx_per_hour = tx_count_24h / 24
    tx_per_day = tx_count_24h
    
    # Amount ratio
    amount_to_mean_ratio = amount / amount_mean if amount_mean != 0 else 1
    
    # Extract first character of address as numeric feature (pseudo-feature)
    addr_feature = int(recipient_address[2], 16) if len(recipient_address) > 2 else 0
    
    # Combine features
    features = {
        'amount': amount,
        'hour_of_day': hour_of_day,
        'day_of_week': day_of_week,
        'transaction_frequency': tx_count_24h,
        'amount_mean': amount_mean,
        'amount_std': amount_std,
        'amount_max': amount_max,
        'time_since_last_tx': time_since_last,
        'tx_per_hour': tx_per_hour,
        'tx_per_day': tx_per_day,
        'amount_to_mean_ratio': amount_to_mean_ratio,
        'addr_feature': addr_feature / 15.0  # Normalize to 0-1
    }
    
    # Add any additional features passed in
    features.update(additional_features)
    
    # Convert to feature array (for models)
    feature_array = np.array([
        features['amount'],
        features['hour_of_day'],
        features['day_of_week'],
        features['transaction_frequency'],
        features['amount_mean'],
        features['amount_std'],
        features['amount_max'],
        features['time_since_last_tx'],
        features['tx_per_hour'],
        features['tx_per_day'],
        features['amount_to_mean_ratio'],
        features['addr_feature']
    ]).reshape(1, -1)
    
    return feature_array, features

def predict_risk(amount, recipient_address, additional_features=None):
    """Predict risk using feature names and rule-based approach"""
    try:
        # Load feature names from the model files
        isolation_forest_features = load_model(os.path.join(MODEL_DIR_1, 'isolation_forest.pkl'))
        logistic_regression_features = load_model(os.path.join(MODEL_DIR_1, 'logistic_regression.pkl'))
        
        print(f"Feature names from isolation_forest: {isolation_forest_features}")
        print(f"Feature names from logistic_regression: {logistic_regression_features}")
        
        # Prepare features
        feature_array, features_dict = prepare_features(amount, recipient_address, additional_features)
        
        # Initialize prediction results
        predictions = {}
        risk_factors = []
        
        # Extract features
        amount_feature = features_dict['amount']
        hour = features_dict['hour_of_day']
        amount_ratio = features_dict['amount_to_mean_ratio']
        tx_frequency = features_dict['transaction_frequency']
        
        # Calculate risk score using a rule-based approach
        risk_score = 0.0
        
        # Amount-based rules (transaction_amount)
        if amount_feature > 1000:
            risk_score += 0.1
            risk_factors.append("Large transaction amount")
        
        if amount_feature > 5000:
            risk_score += 0.2
            risk_factors.append("Very large transaction amount")
        
        # Transaction ratio rules
        if amount_ratio > 3:
            risk_score += 0.15
            risk_factors.append("Amount significantly higher than usual")
        
        # Time-based rules
        if hour < 6 or hour > 23:
            risk_score += 0.1
            risk_factors.append("Transaction during unusual hours")
            
        # Transaction frequency rules
        if tx_frequency > 5:
            risk_score += 0.15
            risk_factors.append("High transaction frequency in last 24 hours")
        
        # Add recipient address pattern analysis
        # If recipient address has certain patterns, adjust risk
        if recipient_address.startswith('0x0') or recipient_address.startswith('0x1'):
            # Lower addresses might be exchange addresses (just a heuristic)
            risk_score += 0.05
            risk_factors.append("Recipient address pattern indicates potential exchange withdrawal")
        
        # Final adjustments based on multiple factors
        if amount_feature > 1000 and tx_frequency > 3:
            risk_score += 0.1
            risk_factors.append("Multiple large transactions in a short time period")
        
        if amount_feature > 3000 and (hour < 6 or hour > 23):
            risk_score += 0.15
            risk_factors.append("Large transaction during unusual hours")
        
        # Cap risk score at 1.0
        risk_score = min(risk_score, 1.0)
        
        # Record the prediction method used
        predictions['rule_based'] = float(risk_score)
        
        # Determine risk level
        if risk_score >= 0.7:
            risk_level = "High"
            confidence = "95%"
        elif risk_score >= 0.4:
            risk_level = "Medium"
            confidence = "85%"
        else:
            risk_level = "Low"
            confidence = "90%"
        
        # Generate security suggestions based on risk level
        security_suggestions = []
        
        if risk_level == "High":
            security_suggestions.append("Enable two-factor authentication for all transactions")
            security_suggestions.append("Verify recipient identity through secondary channel")
            security_suggestions.append("Consider manual review by security team")
        elif risk_level == "Medium":
            security_suggestions.append("Verify recipient identity before proceeding")
            security_suggestions.append("Consider additional verification for this transaction")
        else:
            security_suggestions.append("Standard security measures are sufficient")
            security_suggestions.append("Normal transaction flow recommended")
        
        # Add amount-specific suggestions
        if features_dict['amount_to_mean_ratio'] > 3:
            security_suggestions.append("Consider splitting transaction into smaller amounts")
        else:
            security_suggestions.append("Transaction amount within normal range")
        
        # Transaction category
        transaction_category = f"{risk_level}-Risk"
        
        # Format response
        result = {
            "riskLevel": risk_level,
            "confidence": confidence,
            "details": f"Risk score: {risk_score:.2f}",
            "modelPredictions": predictions,
            "analysisMetrics": {
                "velocityScore": features_dict['tx_per_day'],
                "frequencyScore": features_dict['tx_per_hour'],
                "amountDeviation": features_dict['amount_to_mean_ratio'],
                "historicalRiskScore": risk_score,
                "patternMatch": "Anomalous" if risk_score > 0.6 else "Normal",
                "timeBasedRisk": 0.8 if hour < 6 or hour > 23 else 0.2
            },
            "riskFactors": risk_factors,
            "securitySuggestions": security_suggestions,
            "transactionCategory": transaction_category
        }
        
        return result
        
    except Exception as e:
        print(f"Error in risk prediction: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)

# Main execution
try:
    # Parse additional features
    additional_features = json.loads(args.features)
    
    # Get prediction
    prediction = predict_risk(args.amount, args.recipient, additional_features)
    
    # Output prediction as JSON
    print(json.dumps(prediction))
    
except Exception as e:
    print(f"Fatal error in prediction: {str(e)}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    
    # Return fallback prediction
    fallback_prediction = {
        "riskLevel": "Medium",
        "confidence": "50%",
        "details": f"Fallback prediction due to error: {str(e)}",
        "error": str(e),
        "analysisMetrics": {
            "velocityScore": 0,
            "frequencyScore": 0,
            "amountDeviation": 1.0,
            "historicalRiskScore": 0.5,
            "patternMatch": "Unknown",
            "timeBasedRisk": 0.5
        },
        "riskFactors": ["Error in prediction model", "Using fallback risk assessment"],
        "securitySuggestions": [
            "Enable two-factor authentication",
            "Verify recipient identity",
            "Consider manual verification"
        ],
        "transactionCategory": "Medium-Risk"
    }
    print(json.dumps(fallback_prediction))
    sys.exit(1)

# Add this transaction to history for future predictions (in a real system this would be in a database)
transaction_history.append({
    'amount': args.amount,
    'recipient': args.recipient,
    'timestamp': datetime.now()
}) 