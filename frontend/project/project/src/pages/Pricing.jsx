import React from 'react';
import { Check } from 'lucide-react';

const PricingTier = ({ name, price, features, recommended }) => (
  <div className={`bg-[#1a2332] rounded-2xl p-8 ${recommended ? 'ring-2 ring-red-500' : ''}`}>
    <h3 className="text-xl font-semibold text-white mb-2">{name}</h3>
    <div className="mb-6">
      <span className="text-4xl font-bold text-white">${price}</span>
      <span className="text-gray-400">/month</span>
    </div>
    <ul className="space-y-4">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center text-gray-300">
          <Check className="h-5 w-5 text-red-500 mr-2" />
          {feature}
        </li>
      ))}
    </ul>
    <button className={`w-full mt-8 py-3 px-6 rounded-md font-semibold transition-colors ${
      recommended 
        ? 'bg-red-500 text-white hover:bg-red-600' 
        : 'bg-[#2a3444] text-white hover:bg-[#353f52]'
    }`}>
      Get Started
    </button>
  </div>
);

const Pricing = () => {
  const plans = [
    {
      name: 'Basic',
      price: 29,
      features: [
        'Up to 10 transactions/day',
        'Basic fraud detection',
        'Email support',
        'Mobile app access'
      ]
    },
    {
      name: 'Pro',
      price: 79,
      features: [
        'Unlimited transactions',
        'Advanced fraud detection',
        'Priority support',
        'API access',
        'Custom reports'
      ],
      recommended: true
    },
    {
      name: 'Enterprise',
      price: 199,
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'Custom integration',
        'SLA guarantee',
        'Advanced analytics'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#111827] py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-400 text-lg">Choose the plan that's right for you</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PricingTier key={plan.name} {...plan} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;