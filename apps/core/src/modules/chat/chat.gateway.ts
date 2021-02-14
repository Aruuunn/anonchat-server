import {
    WebSocketGateway,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
    WebSocketServer,
} from '@nestjs/websockets';
import {UseGuards} from '@nestjs/common';
import ALLOWED_ORIGINS from '../../config/allowed-origins.config';
import {Server, Socket} from 'socket.io';
import {ChatService} from './chat.service';
import WsGuard from '../auth/gaurds/websocket/ws.guard';
import {User} from '../../common/websockets/ws-get-user.decorator';
import {UserModel} from '../user/model/user.model';
import {isTruthy} from '../../utils/is-truthy.util';
import {MessageInterface} from './models/message.model';
import {DeviceType} from '../user/interfaces/device-type.interface';
import {WsEvents} from './ws-events';

@WebSocketGateway(undefined, {
    cookie: true,
    origins: ALLOWED_ORIGINS,
    transports: ['websocket', 'polling'],
})
export class ChatGateway {
    constructor(private chatService: ChatService) {
    }

    @WebSocketServer()
    private server: Server;

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
        @MessageBody() payload: MessageInterface,
        @User() user: UserModel,
    ) {
        const {
            message,
            userToSendMessage,
        } = await this.chatService.addNewMessageToNotDeliveredMessages(
            user,
            payload,
        );
        console.log(this.server.clients())
        this.server.to(userToSendMessage.id).emit(WsEvents.SEND_MESSAGE, {...payload, messageId: message.id});

        return {messageId: message.id};
    }

    @UseGuards(WsGuard)
    @SubscribeMessage(WsEvents.RECEIVED_MESSAGE)
    async messageReceived(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: { messageId: string; chatId: string },
        @User() user: UserModel,
    ) {
        const {messageId, chatId} = payload;
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

    @UseGuards(WsGuard)
    @SubscribeMessage(WsEvents.RECEIVED_ALL_NOT_DELIVERED_MESSAGES)
    async onReceivedAllNotDeliveredMessages(
        @ConnectedSocket() socket: Socket,
        @User() user: UserModel,
    ) {
        await this.chatService.clearAllNotDeliveredMessages(user);
        return {};
    }

    @UseGuards(WsGuard)
    @SubscribeMessage(WsEvents.FETCH_RECIPIENT_ID)
    async fetchRecipientId(
        @ConnectedSocket() socket: Socket,
        @User() user: UserModel,
        @MessageBody() payload: { chatId: string }
    ) {
        const {chatId} = payload;
        console.log({payload});
        const recipientId = await this.chatService.getRecipientId(chatId, user);

        return {recipientId};
    }

    @UseGuards(WsGuard)
    @SubscribeMessage(WsEvents.FETCH_KEY_BUNDLE)
    async fetchKeyBundle(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: { chatId: string },
        @User() user: UserModel
    ): Promise<DeviceType<string>> {
        const {chatId} = payload;
        return await this.chatService.fetchKeyBundleUsingChatId(chatId, user);
    }
}
