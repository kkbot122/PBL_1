const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class MLService {
  constructor() {
    this.modelPaths = {
      hybridmodel1: {
        logisticRegression: path.join(__dirname, '../models/hybridmodel1/logistic_regression.pkl'),
        isolationForest: path.join(__dirname, '../models/hybridmodel1/isolation_forest.pkl'),
        knn: path.join(__dirname, '../models/hybridmodel1/best_knn_model.pkl')
      },
      hybridmodel2: {
        isolationForest: path.join(__dirname, '../models/hybridmodel2/isolation_forest.pkl'),
        knn: path.join(__dirname, '../models/hybridmodel2/knn_model.pkl')
      }
    };
    
    // Verify that model files exist
    this.verifyModelFiles();
  }

  verifyModelFiles() {
    // Check if all model files exist
    Object.keys(this.modelPaths).forEach(modelGroup => {
      Object.keys(this.modelPaths[modelGroup]).forEach(modelName => {
        const modelPath = this.modelPaths[modelGroup][modelName];
        if (!fs.existsSync(modelPath)) {
          console.warn(`Warning: Model file not found at ${modelPath}`);
        } else {
          console.log(`Model file found: ${modelPath}`);
        }
      });
    });
  }

  async predictRisk(data) {
    try {
      const { amount, recipientAddress, additionalFeatures = {} } = data;
      
      // Call Python script that loads and uses the models
      const prediction = await this.callPythonModel(amount, recipientAddress, additionalFeatures);
      
      return prediction;
    } catch (error) {
      console.error('Error in ML prediction:', error);
      throw new Error(`ML prediction failed: ${error.message}`);
    }
  }

  callPythonModel(amount, recipientAddress, additionalFeatures) {
    return new Promise((resolve, reject) => {
      // Create a Python process
      const pythonProcess = spawn('python', [
        path.join(__dirname, '../python/model_predictor.py'),
        '--amount', amount.toString(),
        '--recipient', recipientAddress,
        '--features', JSON.stringify(additionalFeatures)
      ]);

      let result = '';
      let error = '';

      // Collect data from script
      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      // Handle process completion
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python process exited with code ${code}: ${error}`);
          reject(new Error(`Model prediction failed with code ${code}: ${error}`));
        } else {
          try {
            const prediction = JSON.parse(result);
            resolve(prediction);
          } catch (e) {
            reject(new Error(`Failed to parse model output: ${e.message}`));
          }
        }
      });
    });
  }

  // Fallback method in case Python integration fails
  fallbackPrediction(amount, recipientAddress) {
    console.warn('Using fallback prediction method');
    
    // Simple risk assessment based on amount
    let riskLevel = "Low";
    let confidence = "80%";
    let riskScore = 0.2;
    const riskFactors = [];
    
    if (amount > 1000) {
      riskLevel = "Medium";
      confidence = "85%";
      riskScore = 0.5;
      riskFactors.push("Large transaction amount");
    }
    
    if (amount > 5000) {
      riskLevel = "High";
      confidence = "90%";
      riskScore = 0.8;
      riskFactors.push("Very large transaction amount");
    }
    
    return {
      riskLevel: riskLevel,
      confidence: confidence,
      details: `Risk score: ${riskScore.toFixed(2)}`,
      analysisMetrics: {
        velocityScore: 1,
        frequencyScore: 0.1,
        amountDeviation: 1.0,
        historicalRiskScore: riskScore,
        patternMatch: "Normal",
        timeBasedRisk: 0.2
      },
      riskFactors: riskFactors,
      securitySuggestions: [
        "Enable two-factor authentication",
        "Verify recipient identity",
        "Consider splitting large transactions"
      ],
      transactionCategory: riskLevel + "-Risk"
    };
  }
}

module.exports = new MLService(); 