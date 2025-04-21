import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Pricing from './pages/Pricing.jsx';
import Contact from './pages/Contact.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import UserDashboard from './components/Dashboard/UserDashboard';
import TransactionHistory from './components/Dashboard/TransactionHistory';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transaction-history"
            element={
              <ProtectedRoute>
                <TransactionHistory />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  </StrictMode>
);