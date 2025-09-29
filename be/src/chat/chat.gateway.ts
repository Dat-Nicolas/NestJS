import { Public } from '@/decorator/customize';
import {
  WebSocketGateway, WebSocketServer,
  OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Public()
@WebSocketGateway({
  cors: { origin: true, credentials: true },
  transports: ['websocket', 'polling'], // để có endpoint /socket.io cho curl test
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor() {
    console.log('[ChatGateway] constructed'); // SMOKE LOG
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    client.emit('hello', { msg: 'welcome to socket.io of topchit' });
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }
}
