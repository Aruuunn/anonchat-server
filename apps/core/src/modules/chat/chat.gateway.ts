import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { HttpStatus, UseGuards } from '@nestjs/common';
import { ALLOWED_ORIGINS } from '../../config';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import WsGuard from '../auth/gaurds/websocket/ws.guard';
import { User } from '../../common/websockets/ws-get-user.decorator';
import { UserDocument } from '../user/model/user.model';
import { MessageDocument, MessageInterface } from './models/message.model';
import { DeviceType } from '../user/interfaces/device-type.interface';
import { ChatWsEvents } from './ws-events.chat';


@WebSocketGateway(undefined, {
  cookie: false,
  origins: ALLOWED_ORIGINS,
  transports: ['websocket', 'polling'],
})
export class ChatGateway {
  constructor(private chatService: ChatService) {
  }

  @WebSocketServer()
  private server: Server;

  @UseGuards(WsGuard)
  @SubscribeMessage(ChatWsEvents.CREATE_SELF_ROOM)
  async createRoomForSingleUser(
    @ConnectedSocket() socket: Socket,
    @User() user: UserDocument,
  ): Promise<string> {
    socket.join(user.id);
    return user.id;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(ChatWsEvents.SEND_MESSAGE)
  async sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: MessageInterface,
    @User() user: UserDocument,
  ): Promise<{ messageId: string }> {
    if (typeof payload?.chatId !== 'string' || typeof payload?.message !== 'object') {
      throw new WsException({ code: HttpStatus.BAD_REQUEST });
    }

    const addNewMessageResult = await this.chatService.addNewMessageToNotDeliveredMessages(
      user,
      payload,
    );

    if (addNewMessageResult.isErr()) {
      throw new WsException('Error while sending message');
    }

    const {
      message,
      userToSendMessage,
    } = addNewMessageResult.value;

    this.server.to(userToSendMessage.id).emit(ChatWsEvents.SEND_MESSAGE, { ...payload, messageId: message.id });

    return { messageId: message.id };
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(ChatWsEvents.RECEIVED_MESSAGE)
  async messageReceived(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { messageId: string; chatId: string },
    @User() user: UserDocument,
  ) {
    const { messageId, chatId } = payload;
    const result = await this.chatService.onMessageDelivered(user, chatId, messageId);
    if (result.isErr()) {
      throw new WsException('Error');
    }

    return {};
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(ChatWsEvents.FETCH_NOT_DELIVERED_MESSAGES)
  async fetchNotDeliveredMessages(
    @ConnectedSocket() socket: Socket,
    @User() user: UserDocument,
  ): Promise<MessageDocument[]> {
    return user.notDeliveredMessages;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(ChatWsEvents.RECEIVED_ALL_NOT_DELIVERED_MESSAGES)
  async onReceivedAllNotDeliveredMessages(
    @ConnectedSocket() socket: Socket,
    @User() user: UserDocument,
  ) {
    await this.chatService.clearAllNotDeliveredMessages(user);
    return {};
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(ChatWsEvents.FETCH_RECIPIENT_ID)
  async fetchRecipientId(
    @ConnectedSocket() socket: Socket,
    @User() user: UserDocument,
    @MessageBody() payload: { chatId: string },
  ): Promise<{ recipientId: string }> {
    const { chatId } = payload;
    const recipientIdFetchResult = await this.chatService.getRecipientId(chatId, user);

    if (recipientIdFetchResult.isErr()) {
      throw new WsException('Error in fetching recipient Id');
    }

    return { recipientId: recipientIdFetchResult.value };
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(ChatWsEvents.FETCH_KEY_BUNDLE)
  async fetchKeyBundle(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { chatId: string },
    @User() user: UserDocument,
  ): Promise<DeviceType<string>> {
    const { chatId } = payload;
    const result = await this.chatService.fetchKeyBundleUsingChatId(chatId, user);
    if (result.isErr()) {
      throw new WsException({ message: 'Error in fetching key bundle' });
    }

    return result.value;
  }
}
