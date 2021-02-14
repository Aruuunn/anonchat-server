import {Injectable} from '@nestjs/common';
import {Model} from 'mongoose';
import {ChatModel} from './models/chat.model';
import {UserModel} from '../user/model/user.model';
import {MessageInterface, MessageModel} from './models/message.model';
import {InvitationModel} from '../invitation/invitation.model';
import {InjectModel} from '@nestjs/mongoose';
import {UserService} from '../user/user.service';
import {DeviceType} from '../user/interfaces/device-type.interface';
import {hmacHash} from '../../utils/hmacHash';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(ChatModel.name)
        private chatRepository: Model<ChatModel>,
        @InjectModel(MessageModel.name)
        private messageRepository: Model<MessageModel>,
        private userService: UserService
    ) {
    }

    async startNewChat(
        invitation: InvitationModel,
        user: UserModel,
    ): Promise<ChatModel> {
        return await this.chatRepository.create({
            invitation,
            invitationAcceptedUser: user,
        });
    }

    async fetchChatDetailsUsingChatId(chatId: string): Promise<ChatModel> {
        return this.chatRepository.findOne({
            _id: chatId,
        });
    }

    canAccessChatDetails(chat: ChatModel, user: UserModel): boolean {
        return chat && user && !(user.id !== chat.invitation.creatorOfInvitation.id && user.id !== chat.invitationAcceptedUser.id);
    }

    async fetchKeyBundleUsingChatId(chatId: string, requester: UserModel): Promise<DeviceType<string>> {
        const chat = await this.fetchChatDetailsUsingChatId(chatId);
        if (!chat) {
            throw new Error('Chat Details Not Found');
        }

        if (!this.canAccessChatDetails(chat, requester)) {
            throw new Error('Forbidden to fetch bundle');
        }

        return await this.userService.fetchBundle(
            chat.creatorOfInvitation.id === requester.id
                ? requester
                : chat.creatorOfInvitation
        );

    }

    async createNewMessage(message: MessageInterface): Promise<MessageModel> {
        const newMessage = new MessageModel(message);
        await newMessage.save();
        return newMessage;
    }

    async clearAllNotDeliveredMessages(user: UserModel): Promise<void> {
        user.notDeliveredMessages = [];
        await user.save();
    }

    async getRecipientId(chatId: string, requester: UserModel): Promise<string> {
        const chat = await this.chatRepository.findById(chatId);

        if (!this.canAccessChatDetails(chat, requester)) {
            throw new Error('Forbidden to fetch recipientID');
        }

        if (chat.invitation.creatorOfInvitation.id === requester.id) {
            return chat.invitationAcceptedUser.id;
        } else {
            return hmacHash(chat.invitation.creatorOfInvitation.id);
        }
    }

    async addNewMessageToNotDeliveredMessages(
        user: UserModel,
        message: MessageInterface,
    ): Promise<{ message: MessageModel; userToSendMessage: UserModel }> {
        const {chatId} = message;
        const chat = await this.chatRepository.findById(chatId);
        if (!chat) {
            throw new Error('Chat Not found!');
        }
        if (
            chat.invitationAcceptedUser.id !== user.id &&
            chat.invitation.creatorOfInvitation.id !== user.id
        ) {
            throw new Error('Forbidden');
        }
        const userToSendMessage =
            chat.invitationAcceptedUser.id === user.id
                ? chat.invitation.creatorOfInvitation
                : chat.invitationAcceptedUser;

        const newMessage = await this.messageRepository.create(message);

        return {
            message:
                (await this.userService.addNewMessageToNotDeliveredMessages(newMessage, userToSendMessage))
                    .notDeliveredMessages[user.notDeliveredMessages.length]
            , userToSendMessage
        };
    }

    async onMessageDelivered(
        user: UserModel,
        chatId: string,
        messageId: string,
    ): Promise<void> {
        user.notDeliveredMessages = user.notDeliveredMessages.filter(
            (message) => message.id !== messageId && message.chatId !== chatId,
        );
        await user.save();
    }
}
