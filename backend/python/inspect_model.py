import pickle
import os
import sys
import numpy as np

# Path to model files
MODEL_DIR_1 = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models', 'hybridmodel1')
MODEL_DIR_2 = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models', 'hybridmodel2')

# Model paths
model_paths = [
    os.path.join(MODEL_DIR_1, 'isolation_forest.pkl'),
    os.path.join(MODEL_DIR_1, 'logistic_regression.pkl')
]

for model_path in model_paths:
    print(f"\nExamining model file: {model_path}")
    if os.path.exists(model_path):
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
                
            print(f"Type of loaded data: {type(model_data)}")
            
            if isinstance(model_data, np.ndarray):
                print(f"Shape: {model_data.shape}")
                print(f"Data type: {model_data.dtype}")
                print(f"First few elements: {model_data[:5]}")
            elif isinstance(model_data, dict):
                print(f"Keys: {list(model_data.keys())}")
                for key, value in model_data.items():
                    print(f"  {key}: {type(value)}")
            else:
                print(f"Content: {model_data}")
        except Exception as e:
            print(f"Error loading model: {str(e)}")
    else:
        print(f"Model file not found at: {model_path}") 