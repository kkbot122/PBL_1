#!/bin/bash
# Setup script for ML dependencies

echo "Installing Python ML dependencies..."
pip install -r python/requirements.txt

echo "Testing model loader..."
python -c "
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
    if os.path.exists(model_path):
        print(f'Model found: {model_path}')
        try:
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            print(f'Successfully loaded model from {model_path}')
        except Exception as e:
            print(f'Error loading model from {model_path}: {str(e)}')
    else:
        print(f'Warning: Model not found at {model_path}')
"

echo "Setup complete!" 