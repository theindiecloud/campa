import React, { useState } from 'react';
import { ThumbsUp, Plus, CheckCircle2, Users, Sparkles, Zap, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import CreatePollModal from './CreatePollModal';

export default function VotingSection() {
  const { user } = useAuth();
  const { polls, castVote } = useRealtime();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredPolls = activeCategory === 'all'
    ? polls
    : polls.filter(p => p.category === activeCategory);

  const handleVote = (pollId, optionId) => {
    castVote(pollId, optionId, user?.id || 'guest', user?.name || 'Guest User');
  };

  return (
    <div className="voting-section-wrapper">
      {/* Header Row */}
      <div className="section-header-row">
        <div className="section-title-wrap">
          <div className="pill-tag" style={{ marginBottom: '8px' }}>
            <Zap size={14} className="pill-sparkle" />
            <span>Community Voice &amp; Scheduling Consensus</span>
          </div>
          <h3>Live Session &amp; Workshop Polls</h3>
          <p>Vote for upcoming topics to be scheduled in Campa halls. Results update live across campus.</p>
        </div>

        <button className="btn-nav-primary" onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} />
          <span>Propose Topic / Poll</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="filter-tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`filter-tab ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All Polls ({polls.length})
        </button>
        <button
          className={`filter-tab ${activeCategory === 'Session Vote' ? 'active' : ''}`}
          onClick={() => setActiveCategory('Session Vote')}
        >
          Session Votes
        </button>
        <button
          className={`filter-tab ${activeCategory === 'Workshop Approval' ? 'active' : ''}`}
          onClick={() => setActiveCategory('Workshop Approval')}
        >
          Workshop Ideas
        </button>
        <button
          className={`filter-tab ${activeCategory === 'Community Poll' ? 'active' : ''}`}
          onClick={() => setActiveCategory('Community Poll')}
        >
          Community
        </button>
      </div>

      {/* Polls Grid */}
      <div className="polls-grid">
        {filteredPolls.map(poll => {
          const userSelectedOptionId = poll.userVotes ? poll.userVotes[user?.id] : null;

          return (
            <div key={poll.id} className="poll-card">
              <div className="poll-card-header">
                <div>
                  <span className="poll-category-chip">{poll.category}</span>
                  <h4 className="poll-title">{poll.title}</h4>
                </div>
                <div className="poll-votes-total">
                  <Users size={14} />
                  <span>{poll.totalVotes} votes</span>
                </div>
              </div>

              {/* Author & Status */}
              <div className="poll-author-row">
                <span className="poll-author">Proposed by <strong>{poll.author}</strong></span>
                {userSelectedOptionId && (
                  <span className="poll-voted-badge">
                    <CheckCircle2 size={13} /> You voted
                  </span>
                )}
              </div>

              {/* Options List */}
              <div className="poll-options-list">
                {poll.options.map(option => {
                  const percentage = poll.totalVotes > 0
                    ? Math.round((option.votes / poll.totalVotes) * 100)
                    : 0;
                  const isSelected = userSelectedOptionId === option.id;

                  return (
                    <div
                      key={option.id}
                      className={`poll-option-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleVote(poll.id, option.id)}
                    >
                      {/* Animated Progress Fill */}
                      <div
                        className="poll-progress-fill"
                        style={{ width: `${percentage}%` }}
                      />

                      <div className="poll-option-content">
                        <div className="poll-option-left">
                          <div className={`poll-radio-indicator ${isSelected ? 'checked' : ''}`}>
                            {isSelected && <div className="poll-radio-dot" />}
                          </div>
                          <span className="poll-option-text">{option.text}</span>
                        </div>

                        <div className="poll-option-stats">
                          <span className="poll-percentage">{percentage}%</span>
                          <span className="poll-vote-count">({option.votes})</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <CreatePollModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}

