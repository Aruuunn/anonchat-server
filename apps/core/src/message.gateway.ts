import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import { Socket, Client, Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsGuard } from './auth/gaurds/websocket/ws.guard';
import { UserModel } from './user/user.model';
import { BadRequestWsException } from './common/websockets/ws-exception';

export enum Events {
  CONNECT_USER = 'CONNECT_USER',
  SEND_MESSAGE = 'SEND_MESSAGE',
  RECEIVED_MESSAGE = 'RECEIVED_MESSAGE',
  CREATE_SELF_ROOM = 'CREATE_SELF_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  NEW_ACCESS_TOKEN = 'NEW_ACCESS_TOKEN',
}

@WebSocketGateway(undefined, {
  transports: ['websocket', 'polling'],
  cookie: true,
  origins: 'http://localhost:4200',
  allowUpgrades: true,
})
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger('MessageGateway');

  @WebSocketServer()
  private server: Server;

  private isTruthy(value: any): boolean {
    return value !== null && typeof value !== 'undefined';
  }

  private generateSelfRoomName(user: UserModel): string {
    return user._id;
  }

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

  handleConnection(client: Client): void {
    this.logger.log(`Connected - ${client.id}`);
  }

  handleDisconnect(client: Client): void {
    this.logger.log(`Disconnected - ${client.id}`);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(Events.CREATE_SELF_ROOM)
  createSelfRoom(@ConnectedSocket() socket: Socket): void {
    const user = this.getUser(socket);
    this.logger.log(`created self room for user - ${user._id}`);
    socket.join(user._id);
    return user._id;
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
    const roomName = this.generateRoomName(user._id, userId.trim());
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
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { to: string; message: unknown },
  ): void {
    const user = this.getUser(client);

    if (!this.isTruthy(payload.message) || !this.isTruthy(payload.to)) {
      throw new BadRequestWsException(
        'userId to send message (to) / message not provided',
      );
    }

    const roomName = this.generateRoomName(user._id, payload.to.trim());
    const data = { from: user._id, ...payload, roomName };

    client.to(roomName).emit(Events.RECEIVED_MESSAGE, data);
  }
}
