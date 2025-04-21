import React from 'react';
import { ArrowLeft, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TransactionHistory = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg fixed w-full z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <h1 className="text-xl font-bold">Transaction History</h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gray-900 rounded-xl p-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <History className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No Transactions Yet</h2>
              <p className="text-gray-400 mb-8">
                Your transaction history will appear here once you start making transactions.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
              >
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TransactionHistory; 