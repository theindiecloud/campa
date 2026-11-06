import React from 'react';
import { useRealtime } from '../../context/RealtimeContext';

export default function Navbar({ setActiveTab }) {
  const { isConnected } = useRealtime();

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand: Clean simple Campa with logo */}
        <div className="brand" onClick={() => setActiveTab && setActiveTab('spaces')}>
          <div className="brand-icon-wrapper">
            <img src="/favicon.svg" alt="Campa Logo" className="brand-icon-img" />
          </div>
          <span className="brand-name">Campa</span>
        </div>

        {/* Clean right indicator */}
        <div className="nav-live-pill">
          <span className={`pulse-dot ${isConnected ? 'live' : 'connecting'}`}></span>
          <span>{isConnected ? 'Server is Live' : 'Connecting to Server...'}</span>
        </div>
      </div>
    </header>
  );
}
