import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Tv,
  Wifi,
  Sparkles,
  CheckCircle2,
  Zap,
  ShieldCheck,
  RotateCcw,
  LogIn,
  UserPlus
} from 'lucide-react';

import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RealtimeProvider, useRealtime } from './context/RealtimeContext';

import Navbar from './components/layout/Navbar';
import AuthModal from './components/auth/AuthModal';
import RoomCard from './components/rooms/RoomCard';
import RoomsDirectory from './components/rooms/RoomsDirectory';
import BookingModal from './components/rooms/BookingModal';
import VotingSection from './components/voting/VotingSection';
import LiveActivityFeed from './components/activity/LiveActivityFeed';

import './App.css';

function MainApp() {
  const [activeTab, setActiveTab] = useState('spaces'); // 'spaces' | 'voting' | 'activity'
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState(null);

  const { rooms, isLoading } = useRealtime();
  const { user, setIsAuthModalOpen } = useAuth();

  // Filter rooms based on active category
  const filteredRooms = activeFilter === 'all'
    ? rooms
    : rooms.filter(room => room.type === activeFilter);

  // Instant Quick Book: finds the first available space
  const handleInstantQuickBook = () => {
    const firstAvailable = rooms.find(r => r.status === 'available');
    if (firstAvailable) {
      setSelectedRoom(firstAvailable);
    } else if (rooms.length > 0) {
      setSelectedRoom(rooms[0]);
    }
  };

  const openRoomBooking = (room) => {
    setSelectedRoom(room);
  };

  const availableCount = rooms.filter(r => r.status === 'available').length;
  const inSessionCount = rooms.filter(r => r.status === 'in-session').length;

  return (
    <div className="app-shell">
      {/* 1. TOP NAVBAR */}
      <Navbar setActiveTab={setActiveTab} />

      {/* 2. MAIN CONTENT AREA */}
      <main className="main-content">
        {/* SPACES & HALLS TAB */}
        {activeTab === 'spaces' && (
          <div className="tab-fade-in" style={{ width: '100%' }}>
            {/* HERO SECTION */}
            <section className="hero-section">
              <h1 className="hero-title">
                Smart Campus <span className="hero-title-accent">Classroom Management System</span>
              </h1>

              <div className="hero-content-row">
                <div className="hero-action-col">
                  {/* AUTH HERO CARD ("Let's get started...") */}
                  <div className="auth-hero-card">
                    <h2 className="auth-card-title">Let&apos;s get started...</h2>
                    <p className="auth-card-subtitle">
                      Sign in or create your campus account to access smart classrooms, live bookings, and schedules.
                    </p>

                    <div className="auth-card-actions">
                      <button
                        className="btn-auth-primary"
                        onClick={() => setIsAuthModalOpen(true)}
                      >
                        <LogIn size={18} />
                        <span>Login</span>
                      </button>

                      <button
                        className="btn-auth-secondary"
                        onClick={() => setIsAuthModalOpen(true)}
                      >
                        <UserPlus size={18} />
                        <span>Sign Up</span>
                      </button>
                    </div>

                    <div className="card-features-strip">
                      <div className="feature-item">
                        <Zap size={15} className="feature-icon" />
                        <span>Realtime Sync</span>
                      </div>
                      <div className="feature-item">
                        <Clock size={15} className="feature-icon gold" />
                        <span>Live Time Slots</span>
                      </div>
                      <div className="feature-item">
                        <Sparkles size={15} className="feature-icon" />
                        <span>Feedback Loop</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hero-info-col">
                  <p className="hero-description dark-disclaimer">
                    <strong>Notice:</strong> The project is in a very early stage. UI/UX and features are actively evolving and subject to change in accordance with user feedback loops.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ROOMS DIRECTORY (Preserved) */}
        {activeTab === 'directory' && (
          <div className="tab-fade-in" style={{ width: '100%' }}>
            <RoomsDirectory rooms={rooms} onReserve={openRoomBooking} />
          </div>
        )}

        {/* LIVE VOTING & POLLS TAB */}
        {activeTab === 'voting' && (
          <div className="tab-fade-in" style={{ width: '100%' }}>
            <VotingSection />
          </div>
        )}

        {/* REALTIME ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <div className="tab-fade-in" style={{ width: '100%' }}>
            <LiveActivityFeed />
          </div>
        )}
      </main>

      {/* 3. MODALS */}
      <BookingModal
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />

      <AuthModal />

      {/* 5. FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <p>© {new Date().getFullYear()} Campa. Real-time Classroom &amp; Seminar Hall Booking.</p>
          <p>Real-time WebSockets • Dynamic Community Voting • Role-Based Auth</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RealtimeProvider>
          <MainApp />
        </RealtimeProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
