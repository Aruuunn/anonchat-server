import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { err, ok, Result } from 'neverthrow';
import { UserDocument } from './model/user.model';
import { BundleDto } from '../auth/dto/bundle.dto';
import { Bundle } from './interfaces/bundle.interface';
import { DeviceType } from './interfaces/device-type.interface';
import { NewUserDto } from '../auth/dto/new-user.dto';
import { MessageDocument } from '../chat/models/message.model';
import { UserErrorFactory, UserErrorsEnum } from './user.exceptions';
import { Failure } from '../../common/failure.interface';
import { UserInterface } from './interfaces/user.interface';
import { KeysEnum } from '../../common/keys-enum';
import { isTruthy } from '../../utils/is-truthy.util';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserDocument.name)
    private userModel: Model<UserDocument>,
  ) {}

  public async updateUser(
    user: UserDocument,
    fn: (
      user: UserDocument,
    ) => Omit<UserInterface, 'notDeliveredMessages'> & {
      notDeliveredMessages: MessageDocument[];
    },
  ): Promise<
    Result<UserDocument, Failure<UserErrorsEnum.ERROR_UPDATING_USER>>
  > {
    try {
      const newUserData: UserInterface = fn(user);

      const userPropertiesToUpdate: KeysEnum<UserInterface> = {
        bundle: true,
        fullName: true,
        notDeliveredMessages: true,
      };

      for (const key of Object.keys(userPropertiesToUpdate)) {
        if (newUserData[key] && userPropertiesToUpdate[key]) {
          user[key] = newUserData[key];
        }
      }
      //await user.save();
      await user.update(user);
      return ok(user);
    } catch (e) {
      return err(UserErrorFactory(UserErrorsEnum.ERROR_UPDATING_USER));
    }
  }

  private async saveBundle(
    bundle: BundleDto,
    user: UserDocument,
  ): Promise<
    Result<UserDocument, Failure<UserErrorsEnum.ERROR_UPDATING_USER>>
  > {
    const result = await this.updateUser(user, (user) => ({ ...user, bundle }));

    if (result.isOk()) {
      return ok(result.value);
    } else {
      return err(result.error);
    }
  }

  async findUserUsingId(
    userId: string,
  ): Promise<Result<UserDocument, Failure<UserErrorsEnum.USER_NOT_FOUND>>> {
    const user: UserDocument = await this.userModel.findOne({ _id: userId });
    if (!isTruthy(user)) {
      return err(UserErrorFactory(UserErrorsEnum.USER_NOT_FOUND));
    }
    return ok(user);
  }

  async createNewUser(
    userData: NewUserDto,
  ): Promise<
    Result<UserDocument, Failure<UserErrorsEnum.ERROR_CREATING_USER>>
  > {
    try {
      const newUser: UserDocument = await this.userModel.create(userData);
      return ok(newUser);
    } catch (e) {
      return err(UserErrorFactory(UserErrorsEnum.ERROR_CREATING_USER));
    }
  }

  async addNewMessageToNotDeliveredMessages(
    message: MessageDocument,
    user: UserDocument,
  ): Promise<
    Result<UserDocument, Failure<UserErrorsEnum.ERROR_UPDATING_USER>>
  > {
    const result = await this.updateUser(user, (user) => ({
      ...user,
      notDeliveredMessages: [
        ...user.notDeliveredMessages.filter((m) => m.id !== message.id),
        message,
      ],
    }));

    if (result.isOk()) {
      return ok(result.value);
    } else {
      return err(result.error);
    }
  }

  async fetchBundle(
    requestedUser: UserDocument,
  ): Promise<
    Result<DeviceType<string>, Failure<UserErrorsEnum.ERROR_UPDATING_USER>>
  > {
    const bundle: Bundle<string> = requestedUser.bundle;


    const oneTimePreKeys = bundle.oneTimePreKeys;
    const preKey = oneTimePreKeys.pop();

    const result = await this.saveBundle(
      { ...bundle, oneTimePreKeys },
      requestedUser,
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({
      preKey,
      registrationId: bundle.registrationId,
      signedPreKey: bundle.signedPreKey,
      identityKey: bundle.identityPubKey,
    });
  }
}
