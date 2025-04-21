import React from 'react';
import { Shield, TrendingUp, Lock, Target, Lightbulb } from 'lucide-react';

const VisionMission = () => {
  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-black p-8 rounded-xl border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full"></div>
            
            <div className="flex items-center mb-6">
              <div className="bg-red-500 p-3 rounded-full mr-4">
                <Target size={24} />
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
                  <h3 className="font-bold mb-1">Intelligent Trading</h3>
                  <p className="text-gray-400">
                    Machine learning algorithms analyze market trends to provide smart 
                    trading recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-black p-8 rounded-xl border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full"></div>
            
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
    </section>
  );
};

export default VisionMission;