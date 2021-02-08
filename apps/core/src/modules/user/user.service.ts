import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from './model/user.model';
import { BundleDto } from '../auth/dto/bundle.dto';
import { Bundle } from './interfaces/bundle.interface';
import { DeviceType } from './interfaces/device-type.interface';
import { BundleNotFoundError } from './exceptions/bundle-not-found.error';
import { UserNotFoundError } from './exceptions/user-not-found.error';
import { NewUserDto } from '../auth/dto/new-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel.name)
    private userModel: Model<UserModel>,
  ) {}

  async createNewUser(userData: NewUserDto): Promise<UserModel> {
    return await this.userModel.create(userData);
  }

  async saveBundle(bundleData: BundleDto, user: UserModel): Promise<void> {
    await this.userModel.updateOne(
      { id: user.id },
      {
        bundle: bundleData,
      },
    );
  }

  async fetchBundle(
    userId: string,
    requester: UserModel,
  ): Promise<DeviceType<string>> {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new UserNotFoundError();
    }
    const bundle: Bundle<string> | undefined = user.bundle;

    if (!bundle) {
      throw new BundleNotFoundError();
    }

    const preKey = bundle.oneTimePreKeys.pop();
    await this.saveBundle(bundle, requester);
    return {
      preKey,
      registrationId: bundle.registrationId,
      signedPreKey: bundle.signedPreKey,
      identityKey: bundle.identityPubKey,
    };
  }

  async findUserUsingId(id: string): Promise<UserModel> {
    return this.userModel.findOne({ id });
  }
}
