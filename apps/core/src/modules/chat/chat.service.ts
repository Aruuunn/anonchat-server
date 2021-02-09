import {Injectable} from '@nestjs/common';
import {InvitationService} from '../invitation/invitation.service';
import {Model} from 'mongoose';
import {ChatModel} from './models/chat.model';
import {UserModel} from '../user/model/user.model';
import {Message, MessageModel} from './models/message.model';
import {InvitationModel} from '../invitation/invitation.model';
import {InjectModel} from '@nestjs/mongoose';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(ChatModel.name)
        private chatRepository: Model<ChatModel>,
    ) {
    }

    async startNewChat(
        invitation: InvitationModel,
        user: UserModel,
    ): Promise<ChatModel> {
        return await this.chatRepository.create({
            invitation,
            invitationAcceptedUser: user
        });
    }

    async fetchChatDetailsUsingChatId(chatId: string): Promise<ChatModel> {
        return this.chatRepository.findOne({
            _id: chatId,
        });
    }

    async createNewMessage(message: Message): Promise<MessageModel> {
        const newMessage = new MessageModel(message);
        await newMessage.save();
        return newMessage;
    }

    async addNewMessageToNotDeliveredMessages(
        user: UserModel,
        message: Message,
    ): Promise<MessageModel> {
        const {chatId} = message;
        const chat = await this.chatRepository.findById(chatId);
        if (!chat) {
            throw new Error('Chat Not found!');
        }
        if (
            chat.invitationAcceptedUser.id !== user.id &&
            chat.creatorOfInvitation.id !== user.id
        ) {
            throw new Error('Forbidden');
        }
        const userToSendMessage =
            chat.invitationAcceptedUser.id === user.id
                ? chat.creatorOfInvitation
                : chat.invitationAcceptedUser;
        const newMessage = await this.createNewMessage(message);
        userToSendMessage.notDeliveredMessages.push(newMessage);
        await userToSendMessage.save();
        return newMessage;
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
