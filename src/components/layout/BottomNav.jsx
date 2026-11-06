import React from 'react';
import { Home, ThumbsUp, Activity, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BottomNav({ activeTab, setActiveTab }) {
  const { user, setIsAuthModalOpen, role } = useAuth();

  return (
    <nav className="mobile-bottom-nav">
      <button
        className={`bottom-nav-item ${activeTab === 'spaces' ? 'active' : ''}`}
        onClick={() => setActiveTab('spaces')}
      >
        <Home size={20} />
        <span>Spaces</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'voting' ? 'active' : ''}`}
        onClick={() => setActiveTab('voting')}
      >
        <ThumbsUp size={20} />
        <span>Voting</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'activity' ? 'active' : ''}`}
        onClick={() => setActiveTab('activity')}
      >
        <Activity size={20} />
        <span>Activity</span>
      </button>

      <button
        className="bottom-nav-item"
        onClick={() => setIsAuthModalOpen(true)}
      >
        <span className="bottom-nav-avatar">
          <User size={18} />
        </span>
        <span className="bottom-nav-role">{role || 'Profile'}</span>
      </button>
    </nav>
  );
}

