import React from 'react';
import { Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#111827]">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              Your new favorite
              <span className="block text-red-500">Secure transactions</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Store, send, receive, and trade cryptocurrencies with advanced fraud
              detection powered by machine learning and secured by blockchain
              technology.
            </p>
            <Link
              to="/signup"
              className="bg-red-500 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-red-600 transition-colors inline-block"
            >
              Sign Up
            </Link>
          </div>
          <div className="bg-[#1a2332] p-12 rounded-2xl">
            <div className="flex flex-col items-center text-center">
              <Wallet className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Secure Wallet</h2>
              <p className="text-gray-400">Powered by blockchain technology</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;