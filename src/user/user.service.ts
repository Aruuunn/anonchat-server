import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel, UserDocument } from './user.model';
import { User } from './user.interface';
import { BundleDto } from './bundle.dto';
import { Bundle } from './bundle.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel.name)
    private userModel: Model<UserDocument>,
  ) {}

  async createNewUser(userData: User): Promise<UserDocument> {
    return await this.userModel.create(userData);
  }

  async saveBundle(bundleData: BundleDto, user: UserDocument): Promise<void> {
    user.bundle = bundleData;
    await user.save();
  }

  async fetchBundle(userId: string): Promise<Bundle<string>> {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    return user.bundle;
  }

  async findUserUsingEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email });
  }
}
