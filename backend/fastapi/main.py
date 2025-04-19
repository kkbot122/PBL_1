from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import numpy as np
import joblib
import os
from datetime import datetime
import pandas as pd

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:5173",  # Alternative localhost
    "http://localhost:3000",   # React default port
    "http://127.0.0.1:3000",  # Alternative localhost
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Initialize models
class TransactionAnalyzer:
    def __init__(self):
        self.scaler = StandardScaler()
        self.isolation_forest = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )
        self.random_forest = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            class_weight='balanced'
        )
        self.feature_columns = [
            'amount',
            'hour_of_day',
            'day_of_week',
            'transaction_frequency',
            'amount_mean',
            'amount_std',
            'amount_max',
            'time_since_last_tx',
            'tx_per_hour',
            'tx_per_day',
            'amount_to_mean_ratio'
        ]
        
        # Initialize transaction history
        self.transaction_history = pd.DataFrame(columns=['amount', 'timestamp'])
        
    def preprocess_features(self, amount, recipient):
        current_time = datetime.now()
        
        # Add new transaction to history
        self.transaction_history = self.transaction_history.append({
            'amount': amount,
            'timestamp': current_time
        }, ignore_index=True)
        
        # Calculate time-based features
        hour_of_day = current_time.hour
        day_of_week = current_time.weekday()
        
        # Calculate transaction patterns
        last_24h = self.transaction_history[
            self.transaction_history['timestamp'] >= current_time - pd.Timedelta(days=1)
        ]
        
        tx_count_24h = len(last_24h)
        amount_mean = last_24h['amount'].mean() if tx_count_24h > 0 else amount
        amount_std = last_24h['amount'].std() if tx_count_24h > 0 else 0
        amount_max = last_24h['amount'].max() if tx_count_24h > 0 else amount
        
        # Time since last transaction (in hours)
        if len(self.transaction_history) > 1:
            last_tx_time = self.transaction_history.iloc[-2]['timestamp']
            time_since_last = (current_time - last_tx_time).total_seconds() / 3600
        else:
            time_since_last = 24
        
        # Transaction frequency
        tx_per_hour = tx_count_24h / 24
        tx_per_day = tx_count_24h
        
        # Amount ratio
        amount_to_mean_ratio = amount / amount_mean if amount_mean != 0 else 1
        
        # Create feature vector
        features = np.array([
            amount,
            hour_of_day,
            day_of_week,
            tx_count_24h,
            amount_mean,
            amount_std,
            amount_max,
            time_since_last,
            tx_per_hour,
            tx_per_day,
            amount_to_mean_ratio
        ]).reshape(1, -1)
        
        return features
    
    def predict_risk(self, features):
        # Normalize features
        if len(self.transaction_history) > 10:  # Only fit scaler after enough data
            self.scaler.fit(self.transaction_history[['amount']])
        scaled_amount = self.scaler.transform(features[:, 0].reshape(-1, 1))
        features[:, 0] = scaled_amount.ravel()
        
        # Get anomaly score from Isolation Forest
        anomaly_score = self.isolation_forest.fit_predict(features)[0]
        
        # Calculate risk level
        amount = features[0, 0]
        tx_frequency = features[0, 3]
        amount_ratio = features[0, -1]
        
        risk_score = 0
        risk_factors = []
        
        # Anomaly detection
        if anomaly_score == -1:
            risk_score += 0.4
            risk_factors.append("Unusual transaction pattern detected")
        
        # Amount-based rules
        if amount_ratio > 3:
            risk_score += 0.3
            risk_factors.append("Amount significantly higher than usual")
        
        # Frequency-based rules
        if tx_frequency > 5:
            risk_score += 0.2
            risk_factors.append("High transaction frequency")
        
        # Time-based rules
        hour = features[0, 1]
        if hour < 6 or hour > 23:
            risk_score += 0.1
            risk_factors.append("Transaction during unusual hours")
        
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
            
        return {
            "risk_level": risk_level,
            "confidence": confidence,
            "risk_score": risk_score,
            "risk_factors": risk_factors,
            "anomaly_score": int(anomaly_score == -1)
        }

# Initialize the analyzer
analyzer = TransactionAnalyzer()

@app.get("/")
def home():
    return {"message": "Transaction Risk Analysis API is running!"}

@app.post("/predict")
async def predict(data: dict):
    try:
        amount = float(data.get("amount", 0))
        recipient = data.get("recipientAddress", "")
        
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be greater than 0")
            
        # Preprocess features
        features = analyzer.preprocess_features(amount, recipient)
        
        # Get prediction
        prediction = analyzer.predict_risk(features)
        
        # Add transaction metrics
        tx_history = analyzer.transaction_history
        recent_tx = len(tx_history[tx_history['timestamp'] >= datetime.now() - pd.Timedelta(days=1)])
        
        return {
            "riskLevel": prediction["risk_level"],
            "confidence": prediction["confidence"],
            "details": f"Risk score: {prediction['risk_score']:.2f}",
            "analysisMetrics": {
                "velocityScore": recent_tx,
                "frequencyScore": recent_tx / 24,
                "amountDeviation": features[0, -1],  # amount_to_mean_ratio
                "historicalRiskScore": prediction["risk_score"],
                "patternMatch": "Anomalous" if prediction["anomaly_score"] == 1 else "Normal",
                "timeBasedRisk": 0.8 if features[0, 1] < 6 or features[0, 1] > 23 else 0.2
            },
            "riskFactors": prediction["risk_factors"],
            "securitySuggestions": [
                "Enable two-factor authentication" if prediction["risk_level"] == "High" else "Standard security measures are sufficient",
                "Verify recipient identity" if prediction["risk_score"] > 0.5 else "Normal transaction flow recommended",
                "Consider splitting transaction" if features[0, -1] > 3 else "Transaction amount within normal range"
            ],
            "transactionCategory": (
                "High-Risk" if prediction["risk_level"] == "High"
                else "Medium-Risk" if prediction["risk_level"] == "Medium"
                else "Low-Risk"
            )
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
