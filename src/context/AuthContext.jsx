import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('campa_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Wipe legacy demo user with emojis so the user starts clean
        if (parsed.email === 'alex@campa.dev' || parsed.avatar === '👨‍💻' || parsed.avatar === '🚀') {
          localStorage.removeItem('campa_user');
          return null;
        }
        parsed.avatar = 'universal';
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('campa_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('campa_user');
    }
  }, [user]);

  // Main login/register method with the 5 required fields
  const loginWithDetails = async (details) => {
    const branchValue = details.branch || details.className || '';
    try {
      const data = await api.login(details.email, { ...details, branch: branchValue });
      if (data && data.success && data.user) {
        const updated = {
          ...data.user,
          name: details.name || data.user.name,
          branch: branchValue || data.user.branch || '',
          className: branchValue || data.user.className || '',
          year: details.year || data.user.year || '',
          password: details.password,
          avatar: 'universal'
        };
        setUser(updated);
        return updated;
      }
    } catch (err) {
      console.warn('Backend login fallback to local session:', err);
    }

    const localUser = {
      id: `u-${Date.now()}`,
      name: details.name,
      branch: branchValue,
      className: branchValue,
      year: details.year,
      email: details.email,
      password: details.password,
      role: 'student',
      avatar: 'universal'
    };
    setUser(localUser);
    return localUser;
  };

  // Backward-compatible method
  const loginWithEmail = async (email, customName) => {
    return loginWithDetails({
      name: customName || (email ? email.split('@')[0] : 'Student'),
      className: '',
      year: '',
      email,
      password: ''
    });
  };

  const switchRole = async (role) => {
    const roleUser = {
      id: `u-${role}`,
      name: role === 'admin' ? 'Campus Admin' : role === 'speaker' ? 'Faculty Speaker' : 'Student User',
      className: 'Campus Dept',
      year: 'Active',
      email: `${role}@campa.dev`,
      role: role,
      avatar: 'universal'
    };
    setUser(roleUser);
    return roleUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campa_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role || 'guest',
        isAdmin: user?.role === 'admin',
        isSpeaker: user?.role === 'speaker' || user?.role === 'faculty',
        isAttendee: user?.role === 'attendee' || user?.role === 'student' || !user?.role,
        switchRole,
        loginWithEmail,
        loginWithDetails,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
