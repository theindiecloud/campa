import React from 'react';
import { Users, MapPin, ArrowRight, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';

export default function RoomCard({ room, onReserve }) {
  const { isAdmin } = useAuth();
  const { releaseRoom } = useRealtime();

  return (
    <div className={`room-card status-${room.status}`}>
      <div className="room-header">
        <div>
          <span className="room-type-tag">{room.category}</span>
          <h4 className="room-name">{room.name}</h4>
        </div>
        <span className={`status-badge ${room.status}`}>
          {room.status === 'available' && <span className="pulse-dot"></span>}
          {room.statusText}
        </span>
      </div>

      {room.currentSession && (
        <div className="current-session-banner">
          <span className="session-dot"></span>
          <span>Session: <strong>{room.currentSession}</strong></span>
        </div>
      )}

      <div className="room-meta-strip">
        <div className="meta-item">
          <Users size={14} />
          <span>{room.capacity} Seats</span>
        </div>
        <div className="meta-item">
          <MapPin size={14} />
          <span>{room.floor}</span>
        </div>
      </div>

      <div className="room-amenities">
        {room.amenities.map((amenity, idx) => (
          <span key={idx} className="amenity-chip">
            {amenity}
          </span>
        ))}
      </div>

      <div className="room-bottom-row">
        <div className="next-slot-info">
          <span className="next-slot-label">Next Slot</span>
          <span className="next-slot-time">{room.nextSlot}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isAdmin && room.status !== 'available' && (
            <button
              className="modal-close-btn"
              onClick={() => releaseRoom(room.id)}
              title="Admin: Release / Reset this Room"
            >
              <RotateCcw size={14} />
            </button>
          )}

          <button className="btn-reserve-room" onClick={() => onReserve(room)}>
            <span>Reserve</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

