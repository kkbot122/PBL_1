import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">SecureFlow</Link>
            </div>
            <div className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/blockchain">Blockchain</Link>
                <Link to="/transactions">Transactions</Link>
                <Link to="/profile">Profile</Link>
            </div>
        </nav>
    );
};

export default Navbar; 