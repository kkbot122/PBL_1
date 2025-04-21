import React, { useState } from 'react';
import MLService from '../../services/MLService';
import './TransactionForm.css';

const TransactionForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    transaction_amount: '',
    user_behavior_score: '',
    transaction_type: '',
    transaction_ratio: '',
    old_balance: '',
    new_balance: '',
    is_flagged_fraud: '',
    balance_change: '',
    transaction_to_balance_ratio: '',
    flagged_large_transaction: '',
    iso_forest_score: '',
    time_since_last_transaction: '',
    transaction_frequency: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePredict = async () => {
    try {
      setLoading(true);
      const features = MLService.getFeatureList().map(feature => 
        parseFloat(formData[feature]) || 0
      );
      const result = await MLService.predictFraud(features);
      setPrediction(result);
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Error getting prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prediction) {
      alert('Please get a prediction first');
      return;
    }
    onSubmit({ ...formData, prediction });
  };

  return (
    <div className="transaction-form">
      <h2>New Transaction</h2>
      <form onSubmit={handleSubmit}>
        {MLService.getFeatureList().map((feature, index) => (
          <div key={index} className="form-group">
            <label htmlFor={feature}>
              {feature.replace(/_/g, ' ').toUpperCase()}
            </label>
            <input
              type="number"
              id={feature}
              name={feature}
              value={formData[feature]}
              onChange={handleChange}
              step="any"
              required
            />
          </div>
        ))}
        
        <div className="button-group">
          <button 
            type="button" 
            onClick={handlePredict}
            disabled={loading}
            className="predict-button"
          >
            {loading ? 'Predicting...' : 'Predict Fraud'}
          </button>
          
          <button 
            type="submit" 
            disabled={!prediction}
            className="submit-button"
          >
            Submit Transaction
          </button>
        </div>

        {prediction && (
          <div className="prediction-result">
            <h3>Prediction Result</h3>
            <p>Risk Level: {prediction.riskLevel}</p>
            <p>Confidence: {prediction.confidence}</p>
            <p>Details: {prediction.details}</p>
            <h4>Security Suggestions:</h4>
            <ul>
              {prediction.securitySuggestions?.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
            <h4>Risk Factors:</h4>
            <ul>
              {prediction.riskFactors?.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};

export default TransactionForm; 