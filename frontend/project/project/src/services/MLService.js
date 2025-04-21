import axios from 'axios';

const BACKEND_API_URL = 'http://localhost:4000';

class MLService {
    static async predictFraud(features) {
        try {
            // Convert features array to the format expected by backend
            const amount = features[0]; // transaction_amount is first feature
            const recipientAddress = "0x" + Math.random().toString(16).substr(2, 40); // Generate a random address for demo
            
            const response = await axios.post(`${BACKEND_API_URL}/api/predict`, {
                amount,
                recipientAddress
            });
            return response.data;
        } catch (error) {
            console.error('Error predicting fraud:', error);
            throw error;
        }
    }

    static getFeatureList() {
        return [
            'transaction_amount',
            'user_behavior_score',
            'transaction_type',
            'transaction_ratio',
            'old_balance',
            'new_balance',
            'is_flagged_fraud',
            'balance_change',
            'transaction_to_balance_ratio',
            'flagged_large_transaction',
            'iso_forest_score',
            'time_since_last_transaction',
            'transaction_frequency'
        ];
    }
}

export default MLService; 