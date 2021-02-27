import { Injectable } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { ChatDocument } from './models/chat.model';
import { UserDocument } from '../user/model/user.model';
import { MessageDocument, MessageInterface } from './models/message.model';
import { InvitationDocument } from '../invitation/invitation.model';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { UserService } from '../user/user.service';
import { DeviceType } from '../user/interfaces/device-type.interface';
import { hmacHash } from '../../utils/hmacHash';
import { err, ok, Result } from 'neverthrow';
import { ChatErrorFactory, ChatErrorsEnum } from './chat.exceptions';
import { Failure } from '../../common/failure.interface';
import { isTruthy } from '../../utils/is-truthy.util';
import { UserErrorsEnum } from '../user/user.exceptions';
import {
  CommonErrorFactory,
  CommonErrorsEnum,
} from '../../common/common-errors';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatDocument.name)
    private chatModel: Model<ChatDocument>,
    @InjectModel(MessageDocument.name)
    private messageModel: Model<MessageDocument>,
    private userService: UserService,
    @InjectConnection()
    private connection: Connection,
  ) {}

  async startNewChat(
    invitation: InvitationDocument,
    user: UserDocument,
  ): Promise<
    Result<ChatDocument, Failure<ChatErrorsEnum.ERROR_CREATING_CHAT>>
  > {
    try {
      const chat: ChatDocument = await this.chatModel.create({
        invitation,
        invitationAcceptedUser: user,
      });
      return ok(chat);
    } catch (e) {
      return err(ChatErrorFactory(ChatErrorsEnum.ERROR_CREATING_CHAT));
    }
  }

  async fetchChatDetailsUsingChatId(
    chatId: string,
  ): Promise<Result<ChatDocument, Failure<ChatErrorsEnum.CHAT_NOT_FOUND>>> {
    const chat: ChatDocument = await this.chatModel.findOne({
      _id: chatId,
    });
    if (isTruthy(chat)) {
      return ok(chat);
    } else {
      return err(ChatErrorFactory(ChatErrorsEnum.CHAT_NOT_FOUND));
    }
  }

  canAccessChatDetails(chat: ChatDocument, user: UserDocument): boolean {
    return (
      chat &&
      user &&
      !(
        user.id !== chat?.invitation?.creatorOfInvitation?.id &&
        user.id !== chat.invitationAcceptedUser?.id
      )
    );
  }

  async fetchKeyBundleUsingChatId(
    chatId: string,
    requester: UserDocument,
  ): Promise<
    Result<
      DeviceType<string>,
      Failure<
        | ChatErrorsEnum.CHAT_NOT_FOUND
        | CommonErrorsEnum.FORBIDDEN
        | UserErrorsEnum.ERROR_UPDATING_USER
      >
    >
  > {
    const chatFindResult = await this.fetchChatDetailsUsingChatId(chatId);

    if (chatFindResult.isErr()) {
      return err(chatFindResult.error);
    }

    const chat = chatFindResult.value;

    if (!this.canAccessChatDetails(chat, requester)) {
      return err(CommonErrorFactory(CommonErrorsEnum.FORBIDDEN));
    }

    const userFetchBundleResult = await this.userService.fetchBundle(
      chat.invitation.creatorOfInvitation.id === requester.id
        ? requester
        : chat.invitation.creatorOfInvitation,
    );

    if (userFetchBundleResult.isErr()) {
      return err(userFetchBundleResult.error);
    } else {
      return ok(userFetchBundleResult.value);
    }
  }

  async createNewMessage(
    message: MessageInterface,
  ): Promise<
    Result<MessageDocument, Failure<ChatErrorsEnum.ERROR_CREATING_MESSAGE>>
  > {
    try {
      const newMessage = await this.messageModel.create(message);
      return ok(newMessage);
    } catch (e) {
      return err(ChatErrorFactory(ChatErrorsEnum.ERROR_CREATING_MESSAGE));
    }
  }

  clearAllNotDeliveredMessages(
    user: UserDocument,
  ): Promise<
    Result<UserDocument, Failure<UserErrorsEnum.ERROR_UPDATING_USER>>
  > {
    return this.userService.updateUser(user, (user) => ({
      ...user,
      notDeliveredMessages: [],
    }));
  }

  async getRecipientId(
    chatId: string,
    requester: UserDocument,
  ): Promise<
    Result<
      string,
      Failure<ChatErrorsEnum.CHAT_NOT_FOUND | CommonErrorsEnum.FORBIDDEN>
    >
  > {
    const chatFindResult = await this.fetchChatDetailsUsingChatId(chatId);

    if (chatFindResult.isErr()) {
      return err(chatFindResult.error);
    }

    const chat = chatFindResult.value;

    if (!this.canAccessChatDetails(chat, requester)) {
      return err(CommonErrorFactory(CommonErrorsEnum.FORBIDDEN));
    }

    if (typeof chat?.invitation?.creatorOfInvitation?.id !== 'string') {
      // Not supposed to happen
      throw new Error('Unexpected Error');
    }

    if (chat?.invitation?.creatorOfInvitation?.id === requester.id) {
      return ok(chat.invitationAcceptedUser.id);
    } else {
      return ok(hmacHash(chat?.invitation?.creatorOfInvitation?.id));
    }
  }

  async addNewMessageToNotDeliveredMessages(
    user: UserDocument,
    message: MessageInterface,
  ): Promise<
    Result<
      { message: MessageDocument; userToSendMessage: UserDocument },
      Failure<
        | ChatErrorsEnum.CHAT_NOT_FOUND
        | CommonErrorsEnum.FORBIDDEN
        | ChatErrorsEnum.ERROR_CREATING_MESSAGE
        | UserErrorsEnum.ERROR_UPDATING_USER
      >
    >
  > {
    const { chatId } = message;

    const chatFindResult = await this.fetchChatDetailsUsingChatId(chatId);

    if (chatFindResult.isErr()) {
      return err(chatFindResult.error);
    }

    const chat = chatFindResult.value;

    if (
      chat?.invitationAcceptedUser?.id !== user.id &&
      chat?.invitation?.creatorOfInvitation?.id !== user.id
    ) {
      return err(CommonErrorFactory(CommonErrorsEnum.FORBIDDEN));
    }

    let userToSendMessage: UserDocument;
    if (chat.invitationAcceptedUser.id === user.id) {
      userToSendMessage = chat.invitation.creatorOfInvitation;
    } else {
      userToSendMessage = chat.invitationAcceptedUser;
    }

    const newMessageCreationResult = await this.createNewMessage(message);

    if (newMessageCreationResult.isErr()) {
      return err(newMessageCreationResult.error);
    }

    const newMessage = newMessageCreationResult.value;

    const addMessageToNotDeliveredMessagesResult = await this.userService.addNewMessageToNotDeliveredMessages(
      newMessage,
      userToSendMessage,
    );

    if (addMessageToNotDeliveredMessagesResult.isErr()) {
      return err(addMessageToNotDeliveredMessagesResult.error);
    }

    return ok({
      message: newMessage,
      userToSendMessage,
    });
  }

  async findChat(
    invitationId: string,
    invitationAcceptedUserId: string,
  ): Promise<Result<ChatDocument, Failure<ChatErrorsEnum.CHAT_NOT_FOUND>>> {
    const chats: ChatDocument[] = (await this.connection
      .model(ChatDocument.name)
      .find({
        invitation: {
          _id: invitationId,
        },
        invitationAcceptedUser: {
          _id: invitationAcceptedUserId,
        },
      })) as ChatDocument[];

    if (isTruthy(chats) && chats.length !== 0) {
      return ok(chats[0]);
    } else {
      return err(ChatErrorFactory(ChatErrorsEnum.CHAT_NOT_FOUND));
    }
  }

  async onMessageDelivered(
    user: UserDocument,
    chatId: string,
    messageId: string,
  ): Promise<
    Result<UserDocument, Failure<UserErrorsEnum.ERROR_UPDATING_USER>>
  > {
    return await this.userService.updateUser(user, (user) => ({
      ...user,
      notDeliveredMessages: user.notDeliveredMessages.filter(
        (message) => message.id !== messageId,
      ),
    }));
  }
}
