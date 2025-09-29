import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

type JoinPayload = { roomId: string };
type MessagePayload = { roomId: string; text: string; clientMsgId?: string };
type TypingPayload = { roomId: string; isTyping: boolean };

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4001', 'http://localhost:5173'],
    credentials: true,
  },
  path: '/socket.io', 
  namespace: '/',    
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() io!: Server;

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token ||
        client.handshake.headers?.authorization?.toString()?.replace('Bearer ', '');

      if (!token) throw new Error('Missing token');

      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_secret') as {
        id: string;
        email?: string;
        [k: string]: any;
      };

      // gắn user vào client
      (client.data as any).user = { id: payload.id, email: payload.email };
      // có thể join sẵn private room theo userId để push noti
      client.join(`user:${payload.id}`);

      // thông báo online
      this.io.emit('presence:online', { userId: payload.id });
    } catch (e) {
      client.emit('error', { message: 'Unauthorized' });
      return client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = (client.data as any)?.user?.id;
    if (userId) {
      this.io.emit('presence:offline', { userId });
    }
  }

  @SubscribeMessage('room:join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() body: JoinPayload) {
    const { roomId } = body;
    if (!roomId) return;
    client.join(roomId);
    client.emit('room:joined', { roomId });
  }

  @SubscribeMessage('chat:message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() body: MessagePayload) {
    const user = (client.data as any)?.user;
    if (!user) return;

    const msg = {
      roomId: body.roomId,
      text: body.text,
      senderId: user.id,
      clientMsgId: body.clientMsgId,
      sentAt: Date.now(),
    };

    // Broadcast tới room (trừ sender)
    client.to(body.roomId).emit('chat:message', msg);
    // Echo lại cho sender (giữ UI local optimistic)
    client.emit('chat:delivered', { clientMsgId: body.clientMsgId, serverTime: Date.now() });
  }

  @SubscribeMessage('chat:typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() body: TypingPayload) {
    const user = (client.data as any)?.user;
    if (!user) return;
    client.to(body.roomId).emit('chat:typing', { userId: user.id, isTyping: body.isTyping });
  }
}
