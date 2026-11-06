import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-Memory Data Store (with Real-time Sync)
const DB = {
  users: [
    { id: 'u1', name: 'Alex Rivera', className: 'CS-A', year: '3rd Year', email: 'alex@campa.dev', role: 'student', avatar: 'universal' },
    { id: 'u2', name: 'Dr. Sarah Chen', className: 'Computer Science', year: 'Faculty', email: 'sarah@campa.dev', role: 'speaker', avatar: 'universal' },
    { id: 'u3', name: 'Rocky (Campus Lead)', className: 'Campus Administration', year: 'Admin', email: 'rocky@campa.dev', role: 'admin', avatar: 'universal' }
  ],
  rooms: [
    {
      id: 'hall-alpha',
      type: 'auditorium',
      category: 'Auditorium',
      name: 'Hall Alpha - Main Auditorium',
      capacity: 180,
      status: 'available', // available | in-session | reserved
      statusText: 'Available Now',
      currentSession: null,
      nextSlot: '2:00 PM - 4:00 PM',
      amenities: ['Dual 4K Projectors', 'Surround Stage Audio', 'Podium & Lapel Mics', 'Live Stream Ready'],
      floor: 'Ground Floor, South Wing'
    },
    {
      id: 'cloud-lab',
      type: 'lab',
      category: 'Computer Lab',
      name: 'Cloud & AI Innovation Lab',
      capacity: 48,
      status: 'in-session',
      statusText: 'In Session until 2:30 PM',
      currentSession: 'Kubernetes Hands-on Workshop',
      nextSlot: '2:45 PM - 5:00 PM',
      amenities: ['48 Workstations', 'Gigabit Fiber WiFi', 'Smart Whiteboard', 'AC Climate Control'],
      floor: '2nd Floor, Tech Block'
    },
    {
      id: 'seminar-b',
      type: 'seminar',
      category: 'Seminar Hall',
      name: 'Seminar Hall B - Tech Theatre',
      capacity: 95,
      status: 'available',
      statusText: 'Available Now',
      currentSession: null,
      nextSlot: '3:15 PM - 5:30 PM',
      amenities: ['120" Motorized Screen', 'Wireless Microphones', 'Tiered Seating', 'HD Recording'],
      floor: '1st Floor, Main Hall'
    },
    {
      id: 'workshop-1',
      type: 'workshop',
      category: 'Workshop Studio',
      name: 'Workshop Studio 1',
      capacity: 36,
      status: 'reserved',
      statusText: 'Reserved at 4:00 PM',
      currentSession: null,
      nextSlot: 'Now until 3:45 PM',
      amenities: ['Modular Movable Desks', 'Whiteboard Walls', 'Power Strips', 'Ultra HD Display'],
      floor: '3rd Floor, Innovation Wing'
    },
    {
      id: 'hack-suite',
      type: 'lab',
      category: 'Innovation Space',
      name: 'Campa Innovation Suite',
      capacity: 65,
      status: 'available',
      statusText: 'Available Now',
      currentSession: null,
      nextSlot: 'Immediate Walk-in',
      amenities: ['Multi-Screen Display Wall', 'Breakout Collaboration Pods', 'Lounge Seating'],
      floor: 'Basement Media Hub'
    },
    {
      id: 'amphi-hall',
      type: 'auditorium',
      category: 'Amphitheatre',
      name: 'Open Interactive Amphitheatre',
      capacity: 130,
      status: 'available',
      statusText: 'Available Now',
      currentSession: null,
      nextSlot: '5:00 PM - 7:30 PM',
      amenities: ['360° Acoustic Tuning', 'High-Lumen Projector', 'Handheld Mics', 'Accessibility Ramps'],
      floor: 'East Courtyard Entry'
    }
  ],
  polls: [
    {
      id: 'poll-1',
      title: 'Which tech talk topic should we schedule in Hall Alpha this Saturday?',
      category: 'Session Vote',
      author: 'Rocky (Campus Lead)',
      authorRole: 'admin',
      totalVotes: 64,
      userVotes: {},
      options: [
        { id: 'opt-1', text: 'Building Agentic AI Apps with Gemini 2.0 & Python', votes: 31 },
        { id: 'opt-2', text: 'Cloud-Native Microservices with Go & Kubernetes', votes: 19 },
        { id: 'opt-3', text: 'Flutter & Dart Deep Dive: Multiplatform State', votes: 14 }
      ],
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'poll-2',
      title: 'Proposed Workshop: Zero-to-Hero Rust for Backend Systems',
      category: 'Workshop Approval',
      author: 'Dr. Sarah Chen',
      authorRole: 'speaker',
      totalVotes: 42,
      userVotes: {},
      options: [
        { id: 'opt-2a', text: 'Yes, definitely attend (3 hour deep dive)', votes: 29 },
        { id: 'opt-2b', text: 'Prefer beginner overview (1 hour)', votes: 10 },
        { id: 'opt-2c', text: 'Not interested at this time', votes: 3 }
      ],
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'poll-3',
      title: 'Hackathon Food & Refreshment Choice for 36-Hour Jam',
      category: 'Community Poll',
      author: 'Community Team',
      authorRole: 'organizer',
      totalVotes: 78,
      userVotes: {},
      options: [
        { id: 'opt-3a', text: 'Artisanal Pizza & Energy Drinks', votes: 44 },
        { id: 'opt-3b', text: 'Gourmet Wraps & Cold Brew Coffee', votes: 26 },
        { id: 'opt-3c', text: 'Healthy Bento Bowls & Fresh Juices', votes: 8 }
      ],
      active: true,
      createdAt: new Date().toISOString()
    }
  ],
  activities: [
    { id: 'act-1', text: 'Hall Alpha reserved for "Campus Cloud Study Jam"', time: '2m ago', type: 'booking' },
    { id: 'act-2', text: '31 developers voted for "Building Agentic AI Apps"', time: '5m ago', type: 'vote' },
    { id: 'act-3', text: 'Cloud & AI Lab status switched to In-Session', time: '14m ago', type: 'room' }
  ]
};

// WebSocket Broadcast Utility
function broadcast(type, payload) {
  const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  // Send initial snapshot on connect
  ws.send(JSON.stringify({
    type: 'INIT_SNAPSHOT',
    payload: {
      rooms: DB.rooms,
      polls: DB.polls,
      activities: DB.activities
    }
  }));

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      console.log('[WebSocket] Message:', data.type);
    } catch (err) {
      console.error('[WebSocket] Invalid JSON message:', err);
    }
  });
});

// REST API ROUTES
app.post('/api/auth/login', (req, res) => {
  const { email, name, className, branch, year, password } = req.body;
  const branchVal = branch || className || '';
  let user = DB.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user) {
    user = {
      id: `u-${Date.now()}`,
      name: name || (email ? email.split('@')[0] : 'Student'),
      branch: branchVal,
      className: branchVal,
      year: year || '',
      email: email || 'student@campa.edu',
      role: 'student',
      avatar: 'universal'
    };
    DB.users.push(user);
  } else {
    if (name) user.name = name;
    if (branchVal) {
      user.branch = branchVal;
      user.className = branchVal;
    }
    if (year) user.year = year;
    user.avatar = 'universal';
  }
  res.json({ success: true, user, token: `token_${user.id}_${Date.now()}` });
});

app.post('/api/auth/switch-demo', (req, res) => {
  const { role } = req.body;
  const user = DB.users.find(u => u.role === role) || DB.users[0];
  res.json({ success: true, user, token: `token_${user.id}_${Date.now()}` });
});

app.get('/api/auth/users', (req, res) => {
  res.json({ success: true, users: DB.users });
});

app.get('/api/rooms', (req, res) => {
  res.json({ success: true, rooms: DB.rooms });
});

app.post('/api/rooms/:id/book', (req, res) => {
  const { id } = req.params;
  const { slot, title, organizer, equipment } = req.body;
  
  const room = DB.rooms.find(r => r.id === id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }

  room.status = 'reserved';
  room.statusText = `Reserved (${slot || 'Upcoming'})`;
  room.currentSession = title || 'Reserved Session';

  const newActivity = {
    id: `act-${Date.now()}`,
    text: `${room.name} booked for "${title || 'Private Session'}" by ${organizer || 'Anonymous'}`,
    time: 'Just now',
    type: 'booking'
  };
  DB.activities.unshift(newActivity);
  if (DB.activities.length > 20) DB.activities.pop();

  broadcast('ROOM_UPDATED', { room, activity: newActivity });
  res.json({ success: true, room, activity: newActivity });
});

app.post('/api/rooms/:id/release', (req, res) => {
  const { id } = req.params;
  const room = DB.rooms.find(r => r.id === id);
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

  room.status = 'available';
  room.statusText = 'Available Now';
  room.currentSession = null;

  broadcast('ROOM_UPDATED', { room });
  res.json({ success: true, room });
});

app.get('/api/polls', (req, res) => {
  res.json({ success: true, polls: DB.polls });
});

app.post('/api/polls/:pollId/vote', (req, res) => {
  const { pollId } = req.params;
  const { optionId, userId, userName } = req.body;

  const poll = DB.polls.find(p => p.id === pollId);
  if (!poll) {
    return res.status(404).json({ success: false, message: 'Poll not found' });
  }

  const previousOptionId = poll.userVotes[userId];
  if (previousOptionId === optionId) {
    return res.json({ success: true, poll, message: 'Already voted for this option' });
  }

  if (previousOptionId) {
    const prevOption = poll.options.find(o => o.id === previousOptionId);
    if (prevOption && prevOption.votes > 0) prevOption.votes -= 1;
  } else {
    poll.totalVotes += 1;
  }

  const targetOption = poll.options.find(o => o.id === optionId);
  if (targetOption) {
    targetOption.votes += 1;
  }
  poll.userVotes[userId] = optionId;

  const newActivity = {
    id: `act-${Date.now()}`,
    text: `${userName || 'A member'} voted for "${targetOption?.text?.slice(0, 32)}..." in ${poll.category}`,
    time: 'Just now',
    type: 'vote'
  };
  DB.activities.unshift(newActivity);
  if (DB.activities.length > 20) DB.activities.pop();

  broadcast('POLL_UPDATED', { poll, activity: newActivity });
  res.json({ success: true, poll, activity: newActivity });
});

app.post('/api/polls/create', (req, res) => {
  const { title, category, options, author, authorRole } = req.body;
  if (!title || !options || options.length < 2) {
    return res.status(400).json({ success: false, message: 'Title and at least 2 options are required' });
  }

  const newPoll = {
    id: `poll-${Date.now()}`,
    title,
    category: category || 'Community Poll',
    author: author || 'Anonymous',
    authorRole: authorRole || 'attendee',
    totalVotes: 0,
    userVotes: {},
    options: options.map((opt, i) => ({
      id: `opt-${Date.now()}-${i}`,
      text: opt,
      votes: 0
    })),
    active: true,
    createdAt: new Date().toISOString()
  };

  DB.polls.unshift(newPoll);

  const newActivity = {
    id: `act-${Date.now()}`,
    text: `New poll created: "${title.slice(0, 38)}..." by ${author}`,
    time: 'Just now',
    type: 'vote'
  };
  DB.activities.unshift(newActivity);

  broadcast('POLL_CREATED', { poll: newPoll, activity: newActivity });
  res.json({ success: true, poll: newPoll, activity: newActivity });
});

app.get('/api/activities', (req, res) => {
  res.json({ success: true, activities: DB.activities });
});

server.listen(PORT, () => {
  console.log(`[Campa Server] REST & WebSocket backend running at http://localhost:${PORT}`);
});

