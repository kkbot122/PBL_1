import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BlockchainTransaction from './components/BlockchainTransaction';
import TransactionDetails from './components/TransactionDetails';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<div>Welcome to SecureFlow</div>} />
            <Route path="/blockchain" element={<BlockchainTransaction />} />
            <Route path="/transactions/:index" element={<TransactionDetails />} />
            <Route path="/profile" element={<div>Profile Page</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 