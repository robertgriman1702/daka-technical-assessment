import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { PokemonService } from './pokemon.service';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: { origin: '*' } })
export class PokemonGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly pokemonService: PokemonService,
    private readonly jwtService: JwtService
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1] ||
        client.handshake.auth.token ||
        (client.handshake.query.token as string);

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'secretKey' }); // Using env or default as in AuthModule
      // Optionally attach user to socket
      (client as any).user = payload;
      console.log(`Client connected: ${client.id}, User: ${payload.username}`);
    } catch (e) {
      console.log('Connection rejected: Invalid token');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('request-sprite')
  async requestSprite(@ConnectedSocket() client: Socket) {
    const user = (client as any).user;
    if (!user) return;

    // Trigger update in service
    await this.pokemonService.getRandomSprite();

    // Get the full object stored in service
    const pokemonData = this.pokemonService.getLastSprite();

    client.emit('sprite-served', pokemonData);
  }

  // Optional: If we were storing state on server, we'd remove it here.
  // For now, the client manages the list, but we provide the event as per specs.
  @SubscribeMessage('delete-sprite')
  deleteSprite(@MessageBody() id: number) {
    // Server side logic if we persisted data
    return { deleted: true, id };
  }
}
