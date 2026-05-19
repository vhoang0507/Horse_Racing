import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socket = null;

export const useSocket = (onRaceStarted, onRaceResult) => {
  const handlers = useRef({ onRaceStarted, onRaceResult });
  handlers.current = { onRaceStarted, onRaceResult };

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.on('race_started', (data) => handlers.current.onRaceStarted?.(data));
    socket.on('race_result', (data) => handlers.current.onRaceResult?.(data));

    return () => { socket?.disconnect(); socket = null; };
  }, []);

  const joinRace = (raceId) => socket?.emit('join_race', raceId);
  const leaveRace = (raceId) => socket?.emit('leave_race', raceId);

  return { joinRace, leaveRace };
};
