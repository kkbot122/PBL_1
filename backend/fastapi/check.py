import joblib

# Load the Isolation Forest model (or any model expecting 13 features)
model_path = r"D:\SecureFlow\backend\models\hybridmodel1\isolation_forest.pkl"
model = joblib.load(model_path)

# Get the expected feature names (if available)
if hasattr(model, "feature_names_in_"):
    print(model.feature_names_in_)
else:
    print("Feature names not available, check your training dataset")
