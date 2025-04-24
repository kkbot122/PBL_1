import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import UserDashboard from './components/Dashboard/UserDashboard';
import BlockchainHistory from './components/Dashboard/BlockchainHistory';
import TransactionHistory from './components/Dashboard/TransactionHistory';
import UniversalBlockchainLog from './components/Dashboard/UniversalBlockchainLog';
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<><Navbar /><Home /></>} />
      <Route path="/login" element={<><Navbar /><Login /></>} />
      <Route path="/signup" element={<><Navbar /><Signup /></>} />
      <Route path="/contact" element={<><Navbar /><Contact /></>} />
      <Route path="/pricing" element={<><Navbar /><Pricing /></>} />
      <Route path="/universal-log" element={<UniversalBlockchainLog />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/blockchain-history" element={<BlockchainHistory />} />
      <Route path="/transaction-history" element={<TransactionHistory />} />
    </Routes>
  );
}

export default App;