import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-black p-4 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-red-500" />
          <span className="text-white text-xl font-semibold">SecureFlow</span>
        </Link>
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-white hover:text-red-500 transition-colors">
            Home
          </Link>
          <Link to="/pricing" className="text-white hover:text-red-500 transition-colors">
            Pricing
          </Link>
          <Link to="/contact" className="text-white hover:text-red-500 transition-colors">
            Contact
          </Link>
          <Link to="/login" className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;