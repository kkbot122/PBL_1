#!/usr/bin/env python3
import argparse
import json
import pickle
import os
import sys
import numpy as np
from datetime import datetime
import traceback
import re

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
    
    # Check if recipient contains PTM or 0x
    has_ptm = 'ptm' in recipient_address.lower()
    has_0x = '0x' in recipient_address.lower()
    
    # Extract first character of address as numeric feature (pseudo-feature)
    addr_feature = int(recipient_address[2], 16) if len(recipient_address) > 2 and recipient_address[0:2] == '0x' else 0
    
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
        'addr_feature': addr_feature / 15.0,  # Normalize to 0-1
        'has_ptm': has_ptm,
        'has_0x': has_0x
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
        features['addr_feature'],
        int(features['has_ptm']),
        int(features['has_0x'])
    ]).reshape(1, -1)
    
    return feature_array, features

def check_address_pattern(address):
    """
    Analyze the address pattern and return risk information
    """
    address_lower = address.lower()
    patterns = []
    risk_level = "Low"
    risk_factor = 0.0
    
    # Check for PTM pattern
    if 'ptm' in address_lower:
        patterns.append("PTM payment system")
        risk_factor += 0.1
    
    # Check for 0x pattern (Ethereum address)
    if address_lower.startswith('0x'):
        patterns.append("Ethereum/blockchain address")
        
        # Check for specific patterns within 0x addresses
        if re.match(r'0x[0-9a-f]{40}$', address_lower):  # Standard ETH address
            patterns.append("Standard Ethereum address format")
            risk_factor += 0.05
        elif re.match(r'0x[0-9a-f]{64}$', address_lower):  # Possible smart contract
            patterns.append("Possible smart contract address")
            risk_factor += 0.2
    
    # Check for other known patterns
    if 'exchange' in address_lower or 'binance' in address_lower or 'coinbase' in address_lower:
        patterns.append("Possible exchange address")
        risk_factor += 0.15
    
    # Common scam patterns
    scam_patterns = ['0xdead', '0x0000', '0xffff', 'reward', 'prize', 'win']
    for pattern in scam_patterns:
        if pattern in address_lower:
            patterns.append(f"Contains potentially suspicious pattern '{pattern}'")
            risk_factor += 0.3
    
    # Determine overall risk level based on accumulated factors
    if risk_factor >= 0.5:
        risk_level = "High"
    elif risk_factor >= 0.2:
        risk_level = "Medium"
    else:
        risk_level = "Low"
    
    return {
        "patterns": patterns,
        "risk_level": risk_level,
        "risk_factor": risk_factor
    }

def predict_risk(amount, recipient_address, additional_features=None):
    """Predict risk using feature names and rule-based approach"""
    try:
        # Load feature names from the model files
        isolation_forest_features = load_model(os.path.join(MODEL_DIR_1, 'isolation_forest.pkl'))
        logistic_regression_features = load_model(os.path.join(MODEL_DIR_1, 'logistic_regression.pkl'))
        
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
        has_ptm = features_dict['has_ptm']
        has_0x = features_dict['has_0x']
        
        # Calculate risk score using a rule-based approach
        risk_score = 0.0
        
        # ========== ENHANCED FRAUD DETECTION LOGIC ==========
        
        # === ADDRESS PATTERN ANALYSIS ===
        address_analysis = check_address_pattern(recipient_address)
        
        # Add address pattern risk factor
        risk_score += address_analysis["risk_factor"]
        
        # Add detected patterns to risk factors
        for pattern in address_analysis["patterns"]:
            risk_factors.append(f"Address pattern: {pattern}")
        
        # === SPECIAL HANDLING FOR PTM OR 0X ADDRESSES ===
        if has_ptm:
            # PTM addresses get specific handling
            risk_factors.append("PTM payment system detected - automatic blockchain logging")
            
            # Adjust risk based on PTM pattern and amount
            if amount_feature > 5000:
                risk_score += 0.1
                risk_factors.append("Large PTM transaction")
            elif amount_feature < 100:
                risk_score -= 0.05
                risk_factors.append("Small PTM transaction - typically lower risk")
        
        if has_0x:
            # 0x addresses get specific handling
            risk_factors.append("Blockchain address detected (0x) - automatic blockchain logging")
            
            # Check for transaction amount thresholds with 0x addresses
            if amount_feature > 1000:
                risk_score += 0.15
                risk_factors.append("Large blockchain transaction")
            
            # Check for potential smart contract interaction
            addr_lower = recipient_address.lower()
            if len(addr_lower) > 42:  # Standard ETH address is 42 chars
                risk_score += 0.1
                risk_factors.append("Possible smart contract interaction")
        
        # === AMOUNT-BASED FRAUD PATTERNS ===
        
        # Transaction amount thresholds
        if amount_feature > 1000:
            risk_score += 0.1
            risk_factors.append("Large transaction amount")
        
        if amount_feature > 5000:
            risk_score += 0.2
            risk_factors.append("Very large transaction amount")
            
        if amount_feature > 10000:
            risk_score += 0.2
            risk_factors.append("Extremely large transaction amount - potential fraud")
        
        # === TRANSACTION PATTERN ANALYSIS ===
        
        # Unusual transaction ratio
        if amount_ratio > 3:
            risk_score += 0.15
            risk_factors.append("Amount significantly higher than usual")
            
        if amount_ratio > 10:
            risk_score += 0.25
            risk_factors.append("Amount extremely higher than usual - potential fraud")
        
        # Time-based fraud patterns
        if hour < 6 or hour > 23:
            risk_score += 0.1
            risk_factors.append("Transaction during unusual hours")
            
        # === FREQUENCY-BASED FRAUD PATTERNS ===
        
        # High frequency transactions may indicate automated fraud
        if tx_frequency > 5:
            risk_score += 0.15
            risk_factors.append("High transaction frequency in last 24 hours")
            
        if tx_frequency > 10:
            risk_score += 0.2
            risk_factors.append("Unusually high transaction frequency - potential automated fraud")
        
        # === COMBINED FRAUD INDICATORS ===
        
        # Multiple suspicious factors compound the risk
        if amount_feature > 1000 and tx_frequency > 3:
            risk_score += 0.1
            risk_factors.append("Multiple large transactions in a short time period")
        
        if amount_feature > 3000 and (hour < 6 or hour > 23):
            risk_score += 0.15
            risk_factors.append("Large transaction during unusual hours")
            
        # Add special fraud detection for very suspicious combinations
        if amount_feature > 5000 and tx_frequency > 5 and (hour < 6 or hour > 23):
            risk_score += 0.3
            risk_factors.append("FRAUD ALERT: Combination of large amount, high frequency, and unusual hours")
        
        # ========== END ENHANCED FRAUD DETECTION LOGIC ==========
        
        # Cap risk score at 1.0
        risk_score = min(risk_score, 1.0)
        
        # Record the prediction method used
        predictions['enhanced_fraud_detection'] = float(risk_score)
        
        # Determine fraud probability
        fraud_probability = risk_score
        is_likely_fraud = fraud_probability > 0.6
        
        # Determine risk level with more granularity
        if risk_score >= 0.7:
            risk_level = "High"
            confidence = "95%"
        elif risk_score >= 0.5:
            risk_level = "Medium-High"
            confidence = "90%"
        elif risk_score >= 0.3:
            risk_level = "Medium"
            confidence = "85%"
        elif risk_score >= 0.1:
            risk_level = "Low-Medium"
            confidence = "80%"
        else:
            risk_level = "Low"
            confidence = "90%"
        
        # Generate specific fraud detection messages
        fraud_detection_result = "No fraud detected"
        if is_likely_fraud:
            fraud_detection_result = "POTENTIAL FRAUD DETECTED"
        
        # Generate security suggestions based on risk level
        security_suggestions = []
        
        if risk_level == "High":
            security_suggestions.append("URGENT: Enable two-factor authentication for all transactions")
            security_suggestions.append("Verify recipient identity through multiple channels")
            security_suggestions.append("Manual review required before proceeding")
            if is_likely_fraud:
                security_suggestions.append("ALERT: This transaction matches known fraud patterns - proceed with extreme caution")
        elif risk_level == "Medium-High" or risk_level == "Medium":
            security_suggestions.append("Enable two-factor authentication for this transaction")
            security_suggestions.append("Verify recipient identity before proceeding")
            security_suggestions.append("Consider additional verification steps")
        else:
            security_suggestions.append("Standard security measures are sufficient")
            security_suggestions.append("Normal transaction flow recommended")
        
        # Add address-specific suggestions for PTM or 0x addresses
        if has_ptm:
            security_suggestions.append("Verify PTM payment system credentials with sender")
            security_suggestions.append("Confirm transaction through official PTM channels")
        
        if has_0x:
            security_suggestions.append("Verify blockchain address on the intended platform")
            security_suggestions.append("Double-check address format for the specific cryptocurrency")
        
        # Add amount-specific suggestions
        if features_dict['amount_to_mean_ratio'] > 3:
            security_suggestions.append("Consider splitting transaction into smaller amounts")
        
        # Transaction category
        transaction_category = f"{risk_level}-Risk"
        if has_ptm:
            transaction_category += "-PTM"
        elif has_0x:
            transaction_category += "-Blockchain"
        
        # Always indicate blockchain storage for all transactions
        blockchain_indicator = "Automatic blockchain storage enabled for all transactions"
        security_suggestions.append(blockchain_indicator)
        
        # Format response
        result = {
            "riskLevel": risk_level,
            "confidence": confidence,
            "details": f"Risk score: {risk_score:.2f}",
            "fraudDetection": {
                "fraudProbability": fraud_probability,
                "isLikelyFraud": is_likely_fraud,
                "fraudDetectionResult": fraud_detection_result
            },
            "modelPredictions": predictions,
            "analysisMetrics": {
                "velocityScore": features_dict['tx_per_day'],
                "frequencyScore": features_dict['tx_per_hour'],
                "amountDeviation": features_dict['amount_to_mean_ratio'],
                "historicalRiskScore": risk_score,
                "patternMatch": "Anomalous" if risk_score > 0.6 else "Normal",
                "timeBasedRisk": 0.8 if hour < 6 or hour > 23 else 0.2,
                "addressRiskScore": address_analysis["risk_factor"],
                "hasPTM": has_ptm,
                "has0x": has_0x
            },
            "riskFactors": risk_factors,
            "securitySuggestions": security_suggestions,
            "transactionCategory": transaction_category,
            "shouldSaveToBlockchain": True  # Always save to blockchain
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
            "timeBasedRisk": 0.5,
            "addressRiskScore": 0.2
        },
        "riskFactors": ["Error in prediction model", "Using fallback risk assessment"],
        "securitySuggestions": [
            "Enable two-factor authentication",
            "Verify recipient identity",
            "Consider manual verification",
            "Automatic blockchain storage enabled for all transactions"
        ],
        "transactionCategory": "Medium-Risk",
        "shouldSaveToBlockchain": True  # Always save to blockchain
    }
    print(json.dumps(fallback_prediction))
    sys.exit(1)

# Add this transaction to history for future predictions (in a real system this would be in a database)
transaction_history.append({
    'amount': args.amount,
    'recipient': args.recipient,
    'timestamp': datetime.now()
}) 