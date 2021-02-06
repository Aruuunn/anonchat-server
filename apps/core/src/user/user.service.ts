import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from './user.model';
import { User } from './user.interface';
import { BundleDto } from './bundle.dto';
import { Bundle } from './bundle.interface';
import { DeviceType } from './device-type.interface';
import { BundleNotFoundError } from './Exceptions/bundle-not-found.error';
import { UserNotFoundError } from './Exceptions/user-not-found.error';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel.name)
    private userModel: Model<UserModel>,
  ) {}

  async createNewUser(userData: User): Promise<UserModel> {
    return await this.userModel.create(userData);
  }

  async saveBundle(bundleData: BundleDto, user: UserModel): Promise<void> {
    await this.userModel.updateOne(
      { email: user.email },
      {
        bundles: [
          ...user.bundles.filter(
            (bundle) => bundle.registrationId !== bundleData.registrationId,
          ),
          bundleData,
        ],
      },
    );
  }

  async fetchBundle(
    userId: string,
    registrationId: number,
    requester: UserModel,
  ): Promise<DeviceType<string>> {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new UserNotFoundError('User Not Found');
    }
    const bundle: Bundle<string> | undefined = user.bundles.find(
      (bundle) => bundle.registrationId === registrationId,
    );

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

  async findUserUsingEmail(email: string): Promise<UserModel> {
    return this.userModel.findOne({ email });
  }
}
