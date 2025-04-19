import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Menu } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="bg-black py-4 border-b border-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Wallet className="text-red-500 mr-2" size={24} />
              <span className="text-xl font-bold">SecureFlow</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
            
            <Link to="/Pricing" className="text-gray-300 hover:text-white">Pricing</Link>
            <Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            
            <Link 
              to="/login" 
              className="hidden md:block bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full"
            >
              Login
            </Link>
            <button className="md:hidden text-gray-300">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;