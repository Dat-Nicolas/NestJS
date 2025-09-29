// socket.ts
import { io, Socket } from 'socket.io-client';

export function connectSocket(token: string): Socket {
  const socket = io('http://localhost:8080', {
    path: '/socket.io',
    transports: ['websocket'], // ưu tiên WS
    withCredentials: true,
    auth: { token }, // gửi token ở handshake
  });

  // optional: auto-reconnect events
  socket.on('connect_error', (e) => console.warn('ws connect_error', e.message));
  socket.on('error', (e) => console.warn('ws error', e));
  return socket;
}
