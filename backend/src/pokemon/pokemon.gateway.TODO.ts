import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { PokemonService } from './pokemon.service';

type JwtPayload = {
  sub?: string | number;
  userId?: string | number;
  email?: string;

};

@WebSocketGateway({
  cors: {
    origin: '*', 
    credentials: true,
  },
})
export class PokemonGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PokemonGateway.name);

  constructor(
    private readonly pokemonService: PokemonService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 1) Autenticar conexiones WebSocket validando JWT token
   * Acepta token por:
   *  - client.handshake.auth.token (recomendado)
   *  - Authorization header: "Bearer <token>"
   *  - query token (?token=...)
   */
  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);

      if (!token) {
        this.logger.warn(`WS connect rejected: missing token (${client.id})`);
        client.emit('ws-error', { message: 'Missing auth token' });
        return client.disconnect(true);
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      client.data.user = payload;

      this.logger.log(
        `WS connected: ${client.id} user=${payload.sub ?? payload.userId ?? 'unknown'}`,
      );

      client.emit('ws-authenticated', { ok: true });
    } catch (err: any) {
      this.logger.warn(
        `WS connect rejected: invalid token (${client.id}) - ${err?.message ?? err}`,
      );
      client.emit('ws-error', { message: 'Invalid or expired token' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data?.user;
    this.logger.log(
      `WS disconnected: ${client.id} user=${user?.sub ?? user?.userId ?? 'unknown'}`,
    );
  }

  /**
   * 4) Evento 'request-sprite'
   *  - Llamar a pokemonService.getRandomSprite()
   *  - Emitir al cliente con 'sprite-served'
   *  - Manejar errores
   */
  @SubscribeMessage('request-sprite')
  async requestSprite(@ConnectedSocket() client: Socket) {
 
    if (!client.data?.user) {
      client.emit('ws-error', { message: 'Unauthorized' });
      return;
    }

    try {
      const sprite = await this.pokemonService.getRandomSprite();
      client.emit('sprite-served', sprite);
      return { ok: true }; 
    } catch (err: any) {
      this.logger.error(
        `request-sprite error (${client.id}): ${err?.message ?? err}`,
      );

      // Si tu service lanza HttpException, puede traer response/message
      const msg =
        err?.response?.message?.toString?.() ??
        err?.message ??
        'Failed to serve sprite';

      client.emit('ws-error', { message: msg });
      return { ok: false, message: msg };
    }
  }


  @SubscribeMessage('delete-sprite')
  async deleteSprite(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { id?: number | string },
  ) {
    if (!client.data?.user) {
      client.emit('ws-error', { message: 'Unauthorized' });
      return;
    }

    const id = body?.id;
    if (id === undefined || id === null || id === '') {
      client.emit('ws-error', { message: 'Missing sprite id' });
      return { ok: false, message: 'Missing sprite id' };
    }

    try {
      const result = await this.pokemonService.remove(Number(id));
      client.emit('sprite-deleted', { id: Number(id), result });
      return { ok: true };
    } catch (err: any) {
      const msg =
        err?.response?.message?.toString?.() ??
        err?.message ??
        'Failed to delete sprite';

      client.emit('ws-error', { message: msg });
      return { ok: false, message: msg };
    }
  }

  private extractToken(client: Socket): string | null {
    // 1) handshake.auth.token
    const authToken = client.handshake?.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) return authToken;

    // 2) Authorization header
    const authHeader = client.handshake?.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
      return authHeader.slice(7).trim();
    }

    // 3) query token
    const q = client.handshake?.query?.token;
    if (typeof q === 'string' && q.trim()) return q;

    return null;
  }
}
