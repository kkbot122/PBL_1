import React from 'react';
import { Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { Wallet } from 'lucide-react';

const Signup = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <Link to="/" className="flex items-center justify-center text-2xl font-bold">
          <Wallet className="text-red-500 mr-2" size={32} />
          <span className="text-orange-500">SecureFlow</span>
        </Link>
        <p className="text-gray-400 mt-2">Create your secure wallet account</p>
      </div>

      {/* AuthForm with white text input */}
      <AuthForm type="signup" inputClassName="text-white" />

      <p className="mt-6 text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-red-500 hover:text-red-400">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Signup;
