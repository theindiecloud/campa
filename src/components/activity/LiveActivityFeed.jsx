import React from 'react';
import { Activity, Calendar, ThumbsUp, DoorOpen, Clock } from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';

export default function LiveActivityFeed() {
  const { activities, isConnected } = useRealtime();

  const getIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Calendar size={16} className="activity-icon-booking" />;
      case 'vote':
        return <ThumbsUp size={16} className="activity-icon-vote" />;
      default:
        return <DoorOpen size={16} className="activity-icon-room" />;
    }
  };

  return (
    <div className="activity-feed-wrapper">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <div className="pill-tag" style={{ marginBottom: '8px' }}>
            <Activity size={14} className="pill-sparkle" />
            <span>Campus Live Event Stream</span>
          </div>
          <h3>Realtime Activity Stream</h3>
          <p>Instant feed of hall reservations, community poll votes, and room status updates.</p>
        </div>

        <div className={`nav-ws-pill ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="ws-dot"></span>
          <span>{isConnected ? 'Broadcasting live updates' : 'Connecting to stream'}</span>
        </div>
      </div>

      <div className="activity-list">
        {activities.map((act) => (
          <div key={act.id} className="activity-item-card">
            <div className="activity-icon-wrapper">
              {getIcon(act.type)}
            </div>
            <div className="activity-content">
              <p className="activity-text">{act.text}</p>
              <div className="activity-time-row">
                <Clock size={12} />
                <span>{act.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

