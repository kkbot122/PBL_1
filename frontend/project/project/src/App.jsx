import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import UserDashboard from './components/Dashboard/UserDashboard';
import BlockchainHistory from './components/Dashboard/BlockchainHistory';
import TransactionHistory from './components/Dashboard/TransactionHistory';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<>
            <Navbar />
            <Home />
          </>}
          />
          <Route path="/login" element={<>
            <Navbar />
            <Login />
          </>}
          />
          <Route path="/signup" element={<>
            <Navbar />
            <Signup />
          </>}
          />
          <Route path="/contact" element={<>
            <Navbar />
            <Contact />
          </>}
          />
          <Route path="/pricing" element={<>
            <Navbar />
            <Pricing />
          </>}
          />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/blockchain-history" element={<BlockchainHistory />} />
          <Route path="/transaction-history" element={<TransactionHistory />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;