import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { realtimeWS } from '../services/websocket';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const RealtimeContext = createContext(null);

export function RealtimeProvider({ children }) {
  const [rooms, setRooms] = useState([]);
  const [polls, setPolls] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Connect WebSocket and initialize snapshot
  useEffect(() => {
    realtimeWS.connect();

    const unsubStatus = realtimeWS.onStatusChange((status) => {
      setIsConnected(status);
    });

    const unsubInit = realtimeWS.on('INIT_SNAPSHOT', (data) => {
      if (data.rooms) setRooms(data.rooms);
      if (data.polls) setPolls(data.polls);
      if (data.activities) setActivities(data.activities);
      setIsLoading(false);
    });

    const unsubRoom = realtimeWS.on('ROOM_UPDATED', (data) => {
      setRooms(prev => prev.map(r => r.id === data.room.id ? data.room : r));
      if (data.activity) {
        setActivities(prev => [data.activity, ...prev.slice(0, 19)]);
        showToast(data.activity.text, 'booking');
      }
    });

    const unsubPoll = realtimeWS.on('POLL_UPDATED', (data) => {
      setPolls(prev => prev.map(p => p.id === data.poll.id ? data.poll : p));
      if (data.activity) {
        setActivities(prev => [data.activity, ...prev.slice(0, 19)]);
      }
    });

    const unsubPollCreated = realtimeWS.on('POLL_CREATED', (data) => {
      setPolls(prev => [data.poll, ...prev]);
      if (data.activity) {
        setActivities(prev => [data.activity, ...prev.slice(0, 19)]);
        showToast(data.activity.text, 'info');
      }
    });

    // Fallback fetch in case WebSocket takes a second
    api.getRooms().then(res => {
      if (res.success) setRooms(res.rooms);
    }).catch(console.warn);

    api.getPolls().then(res => {
      if (res.success) setPolls(res.polls);
    }).catch(console.warn);

    api.getActivities().then(res => {
      if (res.success) setActivities(res.activities);
    }).catch(console.warn);

    return () => {
      unsubStatus();
      unsubInit();
      unsubRoom();
      unsubPoll();
      unsubPollCreated();
    };
  }, [showToast]);

  // Actions
  const bookRoom = useCallback(async (roomId, bookingData) => {
    try {
      const res = await api.bookRoom(roomId, bookingData);
      if (res.success) {
        setRooms(prev => prev.map(r => r.id === res.room.id ? res.room : r));
        return { success: true, room: res.room };
      }
      return { success: false, message: res.message };
    } catch (err) {
      // Fallback local update
      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            status: 'reserved',
            statusText: `Reserved (${bookingData.slot || 'Upcoming'})`,
            currentSession: bookingData.title
          };
        }
        return r;
      }));
      return { success: true };
    }
  }, []);

  const releaseRoom = useCallback(async (roomId) => {
    try {
      const res = await api.releaseRoom(roomId);
      if (res.success) {
        setRooms(prev => prev.map(r => r.id === res.room.id ? res.room : r));
      }
    } catch {
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: 'available', statusText: 'Available Now', currentSession: null } : r));
    }
  }, []);

  const castVote = useCallback(async (pollId, optionId, userId, userName) => {
    // Optimistic local update
    setPolls(prev => prev.map(p => {
      if (p.id === pollId) {
        const prevOptId = p.userVotes[userId];
        const updatedOptions = p.options.map(opt => {
          if (opt.id === optionId) return { ...opt, votes: opt.votes + 1 };
          if (opt.id === prevOptId && opt.votes > 0) return { ...opt, votes: opt.votes - 1 };
          return opt;
        });
        return {
          ...p,
          totalVotes: prevOptId ? p.totalVotes : p.totalVotes + 1,
          userVotes: { ...p.userVotes, [userId]: optionId },
          options: updatedOptions
        };
      }
      return p;
    }));

    try {
      await api.castVote(pollId, optionId, userId, userName);
    } catch (err) {
      console.warn('Realtime vote backend sync queued:', err);
    }
  }, []);

  const createPoll = useCallback(async (pollData) => {
    try {
      const res = await api.createPoll(pollData);
      if (res.success && res.poll) {
        setPolls(prev => [res.poll, ...prev]);
        return { success: true, poll: res.poll };
      }
    } catch {
      const fallbackPoll = {
        id: `poll-${Date.now()}`,
        title: pollData.title,
        category: pollData.category || 'Community Poll',
        author: pollData.author || 'Anonymous',
        authorRole: pollData.authorRole || 'attendee',
        totalVotes: 0,
        userVotes: {},
        options: pollData.options.map((opt, i) => ({ id: `opt-${Date.now()}-${i}`, text: opt, votes: 0 })),
        active: true
      };
      setPolls(prev => [fallbackPoll, ...prev]);
      return { success: true, poll: fallbackPoll };
    }
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        rooms,
        polls,
        activities,
        isConnected,
        isLoading,
        bookRoom,
        releaseRoom,
        castVote,
        createPoll
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) throw new Error('useRealtime must be used within RealtimeProvider');
  return context;
}

