import React, { useState, useEffect } from 'react';
import { X, User, GraduationCap, Calendar, Mail, Lock, Eye, EyeOff, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AuthModal() {
  const { user, loginWithDetails, logout, isAuthModalOpen, setIsAuthModalOpen } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBranch(user.branch || user.className || '');
      setYear(user.year || '');
      setEmail(user.email || '');
      setPassword(user.password || '');
    } else {
      setName('');
      setBranch('');
      setYear('');
      setEmail('');
      setPassword('');
    }
  }, [user, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !branch || !year) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithDetails({
        name: name.trim(),
        branch: branch,
        className: branch,
        year: year,
        email: email.trim(),
        password: password
      });
      showToast(`Welcome to Campa, ${name.trim()}!`, 'success');
      setIsAuthModalOpen(false);
    } catch {
      showToast('Error saving account details', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    setName('');
    setBranch('');
    setYear('');
    setEmail('');
    setPassword('');
    showToast('Signed out successfully', 'info');
  };

  return (
    <div className="modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
      <div className="modal-sheet auth-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="room-type-tag">Student &amp; Campus Portal</span>
            <h3>{user ? 'Account Profile' : 'Student Sign In / Register'}</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsAuthModalOpen(false)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Universal Profile Header (Single universal avatar for all) */}
        <div className="universal-avatar-header">
          <div className="universal-avatar-circle">
            <User size={26} className="universal-avatar-icon" />
          </div>
          <div className="universal-avatar-text">
            <h4>{user?.name ? user.name : 'Universal Campus Profile'}</h4>
            <p>
              {user?.branch || user?.className || user?.year
                ? `${user.branch || user.className || 'General'} • ${user.year || 'Student'}`
                : 'Universal Student & Faculty Access'}
            </p>
          </div>
        </div>

        {/* 5-Field Form in Exact Requested Order:
            1st option: Name
            2nd option: Branch (AI DS, AI ML, CSE, ECE, IT, ME)
            3rd option: Year (max 4th Year)
            4th option: Email ID
            5th option: Password ("pass")
        */}
        <form onSubmit={handleSubmit} className="auth-form-fields">
          {/* 1st Option: Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-name">
              1. Name
            </label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                id="auth-name"
                type="text"
                className="form-input has-icon"
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 2nd Option: Branch */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-branch">
              2. Branch
            </label>
            <div className="input-with-icon">
              <GraduationCap size={16} className="input-icon" />
              <select
                id="auth-branch"
                className="form-input has-icon auth-select"
                value={branch}
                onChange={e => setBranch(e.target.value)}
                required
              >
                <option value="">Select Branch</option>
                <option value="AI DS">AI DS</option>
                <option value="AI ML">AI ML</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="IT">IT</option>
                <option value="ME">ME</option>
              </select>
            </div>
          </div>

          {/* 3rd Option: Year (Max to 4th Year) */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-year">
              3. Year
            </label>
            <div className="input-with-icon">
              <Calendar size={16} className="input-icon" />
              <select
                id="auth-year"
                className="form-input has-icon auth-select"
                value={year}
                onChange={e => setYear(e.target.value)}
                required
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          {/* 4th Option: Email ID */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">
              4. Email ID
            </label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                id="auth-email"
                type="email"
                className="form-input has-icon"
                placeholder="student@campa.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 5th Option: Pass */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-pass">
              5. Password
            </label>
            <div className="input-with-icon password-input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="auth-pass"
                type={showPassword ? 'text' : 'password'}
                className="form-input has-icon has-trailing-icon"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-trailing-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="auth-form-actions">
            <button
              type="submit"
              className="btn-confirm-booking btn-auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : user ? 'Save Changes' : 'Continue'}
            </button>

            {user && (
              <button
                type="button"
                className="btn-auth-logout"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
