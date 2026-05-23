import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socket = null;

export const useSocket = (onRaceStarted, onRaceResult) => {
  const handlers = useRef({ onRaceStarted, onRaceResult });
  handlers.current = { onRaceStarted, onRaceResult };

  useEffect(() => {
    const getSocketUrl = () => {
      if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
      if (window.location.hostname === 'localhost') return 'http://localhost:5000';
      return '/_/backend';
    };

    const SOCKET_URL = getSocketUrl();
    socket = io(SOCKET_URL, { 
      transports: ['websocket'],
      ...(window.location.hostname !== 'localhost' && { path: '/_/backend/socket.io' })
    });

    socket.on('race_started', (data) => handlers.current.onRaceStarted?.(data));
    socket.on('race_result', (data) => handlers.current.onRaceResult?.(data));

    return () => { socket?.disconnect(); socket = null; };
  }, []);

  const joinRace = (raceId) => socket?.emit('join_race', raceId);
  const leaveRace = (raceId) => socket?.emit('leave_race', raceId);

  return { joinRace, leaveRace };
};
