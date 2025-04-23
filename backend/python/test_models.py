import pickle
import os
import sys

model_paths = [
    'models/hybridmodel1/isolation_forest.pkl',
    'models/hybridmodel1/logistic_regression.pkl', 
    'models/hybridmodel1/best_knn_model.pkl',
    'models/hybridmodel2/isolation_forest.pkl',
    'models/hybridmodel2/knn_model.pkl'
]

print('Testing model loading...')
for model_path in model_paths:
    # Convert to absolute path relative to backend directory
    absolute_path = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), model_path))
    
    if os.path.exists(absolute_path):
        print(f'Model found: {model_path}')
        try:
            with open(absolute_path, 'rb') as f:
                model = pickle.load(f)
            print(f'Successfully loaded model from {model_path}')
        except Exception as e:
            print(f'Error loading model from {model_path}: {str(e)}')
    else:
        print(f'Warning: Model not found at {model_path} (absolute path: {absolute_path})') 