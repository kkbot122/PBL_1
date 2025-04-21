import joblib
import os
import pandas as pd

# Define file paths
DATASET_PATH = r"D:\SecureFlow\backend\data\fraud_detection_data.csv"
HYBRID_2_FEATURES_PATH = r"D:\SecureFlow\backend\models\hybridmodel2\selected_features.pkl"

# Option 2: Manually define Hybrid Model 1 features
features_hybrid1 =['transaction_amount', 'user_behavior_score', 'transaction_type',
       'transaction_ratio', 'old_balance', 'new_balance', 'is_flagged_fraud',
       'balance_change', 'transaction_to_balance_ratio',
       'flagged_large_transaction', 'iso_forest_score']

# Load dataset features
if os.path.exists(DATASET_PATH):
    df = pd.read_csv(DATASET_PATH)
    dataset_features = df.columns.tolist()
else:
    print(f"Error: File not found -> {DATASET_PATH}")
    dataset_features = []

# Load Hybrid Model 2 features
if os.path.exists(HYBRID_2_FEATURES_PATH):
    features_hybrid2 = joblib.load(HYBRID_2_FEATURES_PATH)
    if not isinstance(features_hybrid2, list):
        print("Warning: Unexpected format for Hybrid Model 2 features. Setting to empty list.")
        features_hybrid2 = []
else:
    print(f"Error: File not found -> {HYBRID_2_FEATURES_PATH}")
    features_hybrid2 = []

# Determine common features
common_features = list(set(features_hybrid1) & set(features_hybrid2))

# Print results
print(f"Dataset Features: {dataset_features}")
print(f"Hybrid Model 1 Features: {features_hybrid1}")
print(f"Hybrid Model 2 Features: {features_hybrid2}")
print(f"Common Features Used for Prediction: {common_features}")
