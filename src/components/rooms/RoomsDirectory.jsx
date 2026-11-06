import React, { useState } from 'react';
import { Calendar, CheckCircle2, Users, Wifi } from 'lucide-react';
import RoomCard from './RoomCard';

export default function RoomsDirectory({ rooms = [], onReserve }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredRooms = activeFilter === 'all'
    ? rooms
    : rooms.filter(room => room.type === activeFilter);

  const availableCount = rooms.filter(r => r.status === 'available').length;
  const inSessionCount = rooms.filter(r => r.status === 'in-session').length;

  return (
    <div className="rooms-directory-wrapper" style={{ width: '100%' }}>
      {/* QUICK STATS STRIP */}
      <section className="stats-strip">
        <div className="stat-card">
          <div className="stat-icon-box">
            <Calendar size={20} />
          </div>
          <div>
            <div className="stat-number">{rooms.length}</div>
            <div className="stat-label">Total Campus Halls</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="stat-number">{availableCount} Open</div>
            <div className="stat-label">Available Right Now</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box gold">
            <Users size={20} />
          </div>
          <div>
            <div className="stat-number">{inSessionCount} Active</div>
            <div className="stat-label">Sessions Underway</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box">
            <Wifi size={20} />
          </div>
          <div>
            <div className="stat-number">100%</div>
            <div className="stat-label">Fiber &amp; AV Equipped</div>
          </div>
        </div>
      </section>

      {/* ROOMS DIRECTORY */}
      <section className="spaces-section">
        <div className="section-header-row">
          <div className="section-title-wrap">
            <h3>Explore Campus Spaces</h3>
            <p>Select any room to view live time slots and reserve your slot.</p>
          </div>

          {/* Filter Pills */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Spaces ({rooms.length})
            </button>
            <button
              className={`filter-tab ${activeFilter === 'auditorium' ? 'active' : ''}`}
              onClick={() => setActiveFilter('auditorium')}
            >
              Auditoriums
            </button>
            <button
              className={`filter-tab ${activeFilter === 'lab' ? 'active' : ''}`}
              onClick={() => setActiveFilter('lab')}
            >
              Computer Labs
            </button>
            <button
              className={`filter-tab ${activeFilter === 'seminar' ? 'active' : ''}`}
              onClick={() => setActiveFilter('seminar')}
            >
              Seminar Halls
            </button>
            <button
              className={`filter-tab ${activeFilter === 'workshop' ? 'active' : ''}`}
              onClick={() => setActiveFilter('workshop')}
            >
              Workshops
            </button>
          </div>
        </div>

        {/* ROOM CARDS GRID */}
        <div className="rooms-grid">
          {filteredRooms.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              onReserve={onReserve}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
