import React, { useState } from 'react';
import { X, CheckCircle2, Tv, Mic, Wifi, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';

export default function BookingModal({ room, onClose }) {
  const { user } = useAuth();
  const { bookRoom } = useRealtime();

  const [selectedSlot, setSelectedSlot] = useState('2:00 PM - 3:30 PM');
  const [eventName, setEventName] = useState('');
  const [organizerName, setOrganizerName] = useState(user?.name || '');
  const [selectedEquipment, setSelectedEquipment] = useState({
    projector: true,
    microphone: true,
    livestream: false,
    whiteboard: false
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');

  if (!room) return null;

  const toggleEquipment = (key) => {
    setSelectedEquipment(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    const code = `CAMPA-${Math.floor(1000 + Math.random() * 9000)}`;
    setConfirmationCode(code);

    await bookRoom(room.id, {
      slot: selectedSlot,
      title: eventName.trim() || 'Tech Session',
      organizer: organizerName.trim() || user?.name || 'Anonymous',
      equipment: selectedEquipment
    });

    setBookingSuccess(true);

    // Launch celebratory confetti in brand colors
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0B3795', '#F59E0B', '#155EEF', '#FCD34D', '#FFFFFF']
    });

    setTimeout(() => {
      onClose();
      setBookingSuccess(false);
    }, 2400);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="room-type-tag">{room.category}</span>
            <h3>Book {room.name}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {bookingSuccess ? (
          <div style={{ textAlign: 'center', padding: '32px 10px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--available-soft)',
              color: 'var(--available)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '8px', color: 'var(--text-heading)' }}>
              Reservation Confirmed!
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {room.name} has been booked for <strong>{selectedSlot}</strong>. Real-time availability has been synchronized across all devices.
            </p>
            <div style={{
              display: 'inline-block',
              background: 'var(--bg-pill)',
              color: 'var(--brand-blue)',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              Pass ID: {confirmationCode}
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmBooking}>
            <div className="booking-form-group">
              <label className="form-label">Select Time Slot</label>
              <div className="time-slot-grid">
                {['10:00 AM - 11:30 AM', '1:00 PM - 2:30 PM', '2:45 PM - 4:15 PM', '4:30 PM - 6:00 PM'].map((slot, i) => (
                  <button
                    type="button"
                    key={i}
                    className={`time-slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="booking-form-group">
              <label className="form-label">Event / Session Title</label>
              <input
                type="text"
                required
                placeholder="e.g., Campus AI Study Jam"
                className="form-input"
                value={eventName}
                onChange={e => setEventName(e.target.value)}
              />
            </div>

            <div className="booking-form-group">
              <label className="form-label">Lead Organizer / Contact</label>
              <input
                type="text"
                required
                placeholder="e.g., Rocky"
                className="form-input"
                value={organizerName}
                onChange={e => setOrganizerName(e.target.value)}
              />
            </div>

            <div className="booking-form-group">
              <label className="form-label">Equipment Requirements</label>
              <div className="amenities-toggle-grid">
                <div
                  className={`amenity-toggle-item ${selectedEquipment.projector ? 'checked' : ''}`}
                  onClick={() => toggleEquipment('projector')}
                >
                  <Tv size={16} />
                  <span>HD Projector</span>
                </div>

                <div
                  className={`amenity-toggle-item ${selectedEquipment.microphone ? 'checked' : ''}`}
                  onClick={() => toggleEquipment('microphone')}
                >
                  <Mic size={16} />
                  <span>Podium Mic</span>
                </div>

                <div
                  className={`amenity-toggle-item ${selectedEquipment.livestream ? 'checked' : ''}`}
                  onClick={() => toggleEquipment('livestream')}
                >
                  <Wifi size={16} />
                  <span>Live Stream</span>
                </div>

                <div
                  className={`amenity-toggle-item ${selectedEquipment.whiteboard ? 'checked' : ''}`}
                  onClick={() => toggleEquipment('whiteboard')}
                >
                  <Sparkles size={16} />
                  <span>Whiteboard</span>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-confirm-booking">
              <span>Confirm &amp; Broadcast Reservation</span>
              <CheckCircle2 size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

