// Central API Service Client
const API_BASE = '/api';

export const api = {
  // Auth
  async login(email, extraDetails = {}) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ...extraDetails })
    });
    return res.json();
  },

  async switchDemoUser(role) {
    const res = await fetch(`${API_BASE}/auth/switch-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/auth/users`);
    return res.json();
  },

  // Rooms
  async getRooms() {
    const res = await fetch(`${API_BASE}/rooms`);
    return res.json();
  },

  async bookRoom(id, bookingData) {
    const res = await fetch(`${API_BASE}/rooms/${id}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    return res.json();
  },

  async releaseRoom(id) {
    const res = await fetch(`${API_BASE}/rooms/${id}/release`, {
      method: 'POST'
    });
    return res.json();
  },

  // Polls & Voting
  async getPolls() {
    const res = await fetch(`${API_BASE}/polls`);
    return res.json();
  },

  async castVote(pollId, optionId, userId, userName) {
    const res = await fetch(`${API_BASE}/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId, userId, userName })
    });
    return res.json();
  },

  async createPoll(pollData) {
    const res = await fetch(`${API_BASE}/polls/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pollData)
    });
    return res.json();
  },

  // Activities
  async getActivities() {
    const res = await fetch(`${API_BASE}/activities`);
    return res.json();
  }
};

