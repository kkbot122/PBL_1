import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Lightbulb, Lock, Shield, TrendingUp } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="mb-4">
          <h2 className="text-xl">SecureFlow</h2>
        </div>
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4">
            Your new favorite
            <span className="block text-red-500">Secure transactions</span>
          </h1>
          <p className="text-gray-300 mb-8 max-w-2xl">
            Store, send, receive, and trade cryptocurrencies with advanced fraud
            detection powered by machine learning and secured by blockchain
            technology.
          </p>
          <div className="flex gap-4">
            <Link
              to="/signup"
              className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="border border-white px-6 py-2 rounded-full font-semibold hover:bg-white hover:text-black transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Vision and Mission Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Vision Card */}
            <div className="bg-black p-8 rounded-xl">
              <div className="flex items-center mb-6">
                <div className="bg-red-500 p-3 rounded-full mr-4">
                  <Target size={24} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold">Our Vision</h2>
              </div>
              
              <p className="text-gray-300 mb-6">
                We envision a future where financial transactions are completely secure, 
                transparent, and accessible to everyone. By combining the power of blockchain 
                technology with advanced machine learning algorithms, we aim to create a 
                revolutionary platform that eliminates fraud and provides users with complete 
                control over their digital assets.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-gray-900 p-2 rounded-full mr-4 mt-1">
                    <Shield size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Enhanced Security</h3>
                    <p className="text-gray-400">
                      Our multi-layered security approach combines blockchain immutability 
                      with AI-powered threat detection.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-gray-900 p-2 rounded-full mr-4 mt-1">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Real-Time Monitoring</h3>
                    <p className="text-gray-400">
                      Real-time monitoring of transactions to detect and prevent fraud.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mission Card */}
            <div className="bg-black p-8 rounded-xl">
              <div className="flex items-center mb-6">
                <div className="bg-white p-3 rounded-full mr-4">
                  <Lightbulb size={24} className="text-black" />
                </div>
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              
              <p className="text-gray-300 mb-6">
                Our mission is to democratize access to secure financial services by leveraging 
                cutting-edge technology. We are committed to developing innovative solutions that 
                protect users from fraud while providing a seamless and intuitive experience for 
                managing digital assets.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-gray-900 p-2 rounded-full mr-4 mt-1">
                    <Lock size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Fraud Prevention</h3>
                    <p className="text-gray-400">
                      Our advanced machine learning models can detect suspicious patterns and 
                      prevent fraudulent transactions before they occur.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-gray-900 p-2 rounded-full mr-4 mt-1">
                    <Shield size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Smart Contracts</h3>
                    <p className="text-gray-400">
                      Automated, self-executing contracts with the terms directly written into code, 
                      ensuring transparency and eliminating intermediaries.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;