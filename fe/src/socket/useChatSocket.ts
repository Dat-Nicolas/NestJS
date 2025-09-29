// useChatSocket.ts
import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { connectSocket } from '../../socket';

export function useChatSocket(token: string, roomId?: string, handlers?: {
  onMessage?: (m: any) => void;
  onTyping?: (t: any) => void;
}) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const s = connectSocket(token);
    socketRef.current = s;

    s.on('chat:message', handlers?.onMessage ?? (() => {}));
    s.on('chat:typing', handlers?.onTyping ?? (() => {}));

    if (roomId) {
      s.emit('room:join', { roomId });
    }

    return () => {
      s.off('chat:message');
      s.off('chat:typing');
      s.disconnect();
    };
  }, [token, roomId]);

  const sendMessage = (text: string) => {
    const clientMsgId = crypto.randomUUID?.() ?? String(Date.now());
    socketRef.current?.emit('chat:message', { roomId, text, clientMsgId });
    return clientMsgId; // để UI optimistic
  };

  const sendTyping = (isTyping: boolean) => {
    socketRef.current?.emit('chat:typing', { roomId, isTyping });
  };

  return { sendMessage, sendTyping, socket: socketRef.current };
}
