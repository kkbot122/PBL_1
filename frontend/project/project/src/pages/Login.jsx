import React from 'react';
import { Link } from 'react-router-dom';
import AuthForm1 from '../components/AuthForm1';
import { Wallet } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <Link to="/" className="flex items-center justify-center text-2xl font-bold">
          <Wallet className="text-red-500 mr-2" size={32} />
          <span className="text-orange-500">SecureFlow</span>
        </Link>
        <p className="text-gray-400 mt-2">Sign in to access your secure wallet</p>
      </div>

      <AuthForm1 type="login" />

      <p className="mt-6 text-gray-400">
        Don't have an account?{' '}
        <Link to="/signup" className="text-red-500 hover:text-red-400">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;