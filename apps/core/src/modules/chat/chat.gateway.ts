import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import ALLOWED_ORIGINS from '../../config/allowed-origins.config';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { WsGuard } from '../auth/gaurds/websocket/ws.guard';
import { User } from '../../common/websockets/ws-get-user.decorator';
import { UserModel } from '../user/model/user.model';
import { isTruthy } from '../../utils/is-truthy.util';
import { Message } from './models/message.model';

enum WsEvents {
  SEND_MESSAGE = 'SEND_MESSAGE',
  CREATE_SELF_ROOM = 'CREATE_SELF_ROOM',
  RECEIVED_MESSAGE = 'RECEIVED_MESSAGE',
  FETCH_NOT_DELIVERED_MESSAGES = 'FETCH_NOT_DELIVERED_MESSAGES',
}

@WebSocketGateway(undefined, {
  cookie: true,
  origins: ALLOWED_ORIGINS,
  transports: ['websocket', 'polling'],
})
export class ChatGateway {
  constructor(private chatService: ChatService) {}

  @UseGuards(WsGuard)
  @SubscribeMessage(WsEvents.CREATE_SELF_ROOM)
  async createRoomForSingleUser(
    @ConnectedSocket() socket: Socket,
    @User() user: UserModel,
  ): Promise<string> {
    console.assert(isTruthy(user.id), 'user Id has to be truthy!');
    socket.join(user.id);

    return user.id;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(WsEvents.SEND_MESSAGE)
  async sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: Message,
    @User() user: UserModel,
  ) {
    const message = await this.chatService.addNewMessageToNotDeliveredMessages(
      user,
      payload,
    );

    return message._id;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(WsEvents.RECEIVED_MESSAGE)
  async messageReceived(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { messageId: string; chatId: string },
    @User() user: UserModel,
  ) {
    const { messageId, chatId } = payload;
    await this.chatService.onMessageDelivered(user, chatId, messageId);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(WsEvents.FETCH_NOT_DELIVERED_MESSAGES)
  async fetchNotDeliveredMessages(
    @ConnectedSocket() socket: Socket,
    @User() user: UserModel,
  ) {
    return user.notDeliveredMessages;
  }
}
