import React from 'react';
import { AlertTriangle, Shield, Check, X, AlertCircle, Zap, Clock, BarChart3 } from 'lucide-react';

const FraudDetectionDashboard = ({ prediction }) => {
  if (!prediction) return null;

  const {
    riskLevel,
    confidence,
    details,
    fraudDetection,
    riskFactors,
    securitySuggestions,
    analysisMetrics,
    savedToBlockchain,
    blockchainTxHash,
    blockchainError
  } = prediction;

  // Calculate a numerical risk score for the progress bar (0-100)
  const getRiskScore = () => {
    const riskLevelMap = {
      'Low': 20,
      'Low-Medium': 40,
      'Medium': 60,
      'Medium-High': 80,
      'High': 100
    };
    return riskLevelMap[riskLevel] || 50;
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      'Low': 'text-green-500',
      'Low-Medium': 'text-blue-500',
      'Medium': 'text-yellow-500',
      'Medium-High': 'text-orange-500',
      'High': 'text-red-500'
    };
    return colors[level] || 'text-gray-500';
  };

  const getRiskBgColor = (level) => {
    const colors = {
      'Low': 'bg-green-500',
      'Low-Medium': 'bg-blue-500',
      'Medium': 'bg-yellow-500',
      'Medium-High': 'bg-orange-500',
      'High': 'bg-red-500'
    };
    return colors[level] || 'bg-gray-500';
  };

  const getMetricIcon = (metricName) => {
    const icons = {
      'velocityScore': <Clock className="h-4 w-4" />,
      'frequencyScore': <BarChart3 className="h-4 w-4" />,
      'timeBasedRisk': <Clock className="h-4 w-4" />
    };
    return icons[metricName] || <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Fraud Detection Analysis</h3>
        {fraudDetection && fraudDetection.isLikelyFraud ? (
          <div className="flex items-center bg-red-900/50 px-3 py-1 rounded-full">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-200 font-semibold">Fraud Alert</span>
          </div>
        ) : (
          <div className="flex items-center bg-green-900/50 px-3 py-1 rounded-full">
            <Shield className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-200 font-semibold">Secure Transaction</span>
          </div>
        )}
      </div>

      {/* Risk Score Visualization */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Risk Score</span>
          <span className={`font-bold ${getRiskLevelColor(riskLevel)}`}>{riskLevel}</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getRiskBgColor(riskLevel)} rounded-full`} 
            style={{ width: `${getRiskScore()}%` }}
          ></div>
        </div>
        <div className="mt-2 text-xs text-gray-400">{details}</div>
      </div>

      {/* Fraud Detection Result */}
      {fraudDetection && (
        <div className={`mb-6 p-4 ${fraudDetection.isLikelyFraud ? 'bg-red-900/30' : 'bg-green-900/30'} rounded-lg`}>
          <div className="flex items-center mb-2">
            {fraudDetection.isLikelyFraud ? (
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            ) : (
              <Shield className="h-5 w-5 text-green-500 mr-2" />
            )}
            <h4 className="font-semibold text-white">{fraudDetection.fraudDetectionResult}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <span className="text-xs text-gray-400">Fraud Probability</span>
              <div className="mt-1 text-lg font-bold">{Math.round(fraudDetection.fraudProbability * 100)}%</div>
            </div>
            <div>
              <span className="text-xs text-gray-400">Confidence</span>
              <div className="mt-1 text-lg font-bold">{confidence}</div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Metrics */}
      {analysisMetrics && (
        <div className="mb-6">
          <h4 className="text-sm text-gray-400 mb-3">Analysis Metrics</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(analysisMetrics).map(([key, value]) => (
              <div key={key} className="bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center text-xs text-gray-400">
                  {getMetricIcon(key)}
                  <span className="ml-1">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                </div>
                <div className="mt-1 text-white font-semibold">
                  {typeof value === 'number' ? (value > 1 ? value.toFixed(1) : value.toFixed(2)) : value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Factors */}
      {riskFactors && riskFactors.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm text-gray-400 mb-3">Risk Factors</h4>
          <ul className="space-y-2">
            {riskFactors.map((factor, index) => (
              <li key={index} className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Security Suggestions */}
      {securitySuggestions && securitySuggestions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm text-gray-400 mb-3">Security Recommendations</h4>
          <ul className="space-y-2">
            {securitySuggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <Shield className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Blockchain Status */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <h4 className="text-sm text-gray-400 mb-3">Blockchain Record Status</h4>
        {savedToBlockchain ? (
          <div className="flex items-center text-green-400">
            <Check className="h-5 w-5 mr-2" />
            <div>
              <div className="font-semibold">Saved to Blockchain</div>
              {blockchainTxHash && (
                <div className="text-xs text-gray-400 mt-1 font-mono break-all">
                  Tx Hash: {blockchainTxHash}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center text-yellow-400">
            <X className="h-5 w-5 mr-2" />
            <div>
              <div className="font-semibold">Not Saved to Blockchain</div>
              {blockchainError && (
                <div className="text-xs text-gray-400 mt-1">
                  Reason: {blockchainError}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FraudDetectionDashboard; 