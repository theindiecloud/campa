import React, { useState } from 'react';
import { X, Plus, Trash2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';

export default function CreatePollModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { createPoll } = useRealtime();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Session Vote');
  const [options, setOptions] = useState(['', '']);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validOptions = options.map(o => o.trim()).filter(Boolean);
    if (!title.trim() || validOptions.length < 2) return;

    await createPoll({
      title: title.trim(),
      category,
      options: validOptions,
      author: user?.name || 'Anonymous',
      authorRole: user?.role || 'attendee'
    });

    setTitle('');
    setOptions(['', '']);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="room-type-tag">Community Governance</span>
            <h3>Propose Topic / Session Poll</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="booking-form-group">
            <label className="form-label">Category</label>
            <div className="time-slot-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {['Session Vote', 'Workshop Idea', 'Community Poll'].map(cat => (
                <button
                  type="button"
                  key={cat}
                  className={`time-slot-btn ${category === cat ? 'selected' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="booking-form-group">
            <label className="form-label">Poll Question / Topic Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Which Deep Learning framework should we cover?"
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="booking-form-group">
            <label className="form-label">Options (2 to 5 options)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {options.map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    required
                    placeholder={`Option ${idx + 1}`}
                    className="form-input"
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      className="modal-close-btn"
                      onClick={() => handleRemoveOption(idx)}
                      title="Remove Option"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 5 && (
              <button
                type="button"
                className="btn-secondary-outline"
                style={{ marginTop: '10px', width: '100%', padding: '8px', fontSize: '0.84rem' }}
                onClick={handleAddOption}
              >
                <Plus size={15} />
                <span>Add Another Option</span>
              </button>
            )}
          </div>

          <button type="submit" className="btn-confirm-booking">
            <Sparkles size={18} />
            <span>Publish Realtime Poll</span>
          </button>
        </form>
      </div>
    </div>
  );
}

