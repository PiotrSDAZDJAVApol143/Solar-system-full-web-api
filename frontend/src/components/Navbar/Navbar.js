// src/components/Navbar/Navbar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <NavLink to="/">
                    <img src="/assets/textures/logo/logo.png" alt="Logo" className="logo" />
                </NavLink>
                <span className="navbar-title">
          ASTRO<br />
          FRIQ
        </span>
            </div>
            <div className="navbar-links">
                <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Strona Główna
                </NavLink>
                <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
                    O mnie
                </NavLink>
                <NavLink to="/solar-system" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Układ Słoneczny
                </NavLink>
                <NavLink to="/library" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Biblioteka astralna
                </NavLink>
                <NavLink to="/fun-facts" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Śmieszne ciekawostki
                </NavLink>
                <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Kontakt
                </NavLink>
            </div>
        </nav>
    );
}

export default Navbar;