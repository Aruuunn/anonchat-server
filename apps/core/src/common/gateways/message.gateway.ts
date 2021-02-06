import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsGuard } from '../../modules/auth/gaurds/websocket/ws.guard';
import { UserModel } from '../../modules/user/model/user.model';
import { BadRequestWsException } from '../websockets/exceptions/ws-exception';
import { isTruthy } from '../../utils/is-truthy.util';
import ALLOWED_ORIGINS from '../../config/allowed-origins.config';
import { Events } from '../websockets/enum/ws-events.enum';

@WebSocketGateway(undefined, {
  transports: ['websocket', 'polling'],
  cookie: true,
  origins: ALLOWED_ORIGINS,
  allowUpgrades: true,
})
export class MessageGateway {
  private logger = new Logger('MessageGateway');

  @WebSocketServer()
  private server: Server;

  private generateRoomName(userId1: string, userId2: string): string {
    return userId1 > userId2 ? userId2 + userId1 : userId1 + userId2;
  }

  private canUserJoinRoom(roomName: string, user: UserModel): boolean {
    const userId = user._id;
    const exp1 = RegExp(`^${userId}`);
    const exp2 = RegExp(`${userId}$`);
    return exp1.test(roomName) || exp2.test(roomName);
  }

  private joinRoom(roomName: string, socket: Socket, user: UserModel) {
    if (this.canUserJoinRoom(roomName, user)) {
      socket.join(roomName.trim());
      this.logger.log(`user - ${user._id} joined ${roomName}`);
    } else {
      this.logger.log(`user(${user._id}) blocked to join room (${roomName})`);
    }
  }

  private getUser(client: Socket): UserModel {
    const user = client?.request?.user;
    console.assert(
      user !== null && typeof user !== 'undefined',
      'User Should be Defined',
    );
    return user;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(Events.CREATE_SELF_ROOM)
  createSelfRoom(@ConnectedSocket() socket: Socket): void {
    const user = this.getUser(socket);
    this.logger.log(`created self room for user - ${user.id}`);
    socket.join(user.id);
    return user.id;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('HELLO')
  hello(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): WsResponse<unknown> {
    return { event: 'HELLO', data: { message: 'Hello from Server' } };
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(Events.CONNECT_USER)
  connectUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() { userId }: { userId: string },
  ): { roomName: string } {
    const user: UserModel = this.getUser(client);
    const roomName = this.generateRoomName(user.id, userId.trim());
    this.joinRoom(roomName, client, user);
    this.server.in(userId.trim()).emit(Events.CONNECT_USER, { roomName });
    return { roomName };
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(Events.JOIN_ROOM)
  join(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { roomName: string },
  ): string {
    const { roomName } = payload;
    const user = this.getUser(socket);
    this.joinRoom(roomName.trim(), socket, user);
    return roomName;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(Events.SEND_MESSAGE)
  sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { to: string; message: unknown },
  ): void {
    const user = this.getUser(socket);

    if (!isTruthy(payload.message) || !isTruthy(payload.to)) {
      throw new BadRequestWsException(
        'userId to send message (to) / message not provided',
      );
    }

    const roomName = this.generateRoomName(user.id, payload.to.trim());
    const data = { from: user.id, ...payload, roomName };

    socket.to(roomName).emit(Events.RECEIVED_MESSAGE, data);
  }
}
