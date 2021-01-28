import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel, UserDocument } from './user.model';
import { User } from './user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel.name)
    private userModel: Model<UserDocument>,
  ) {}

  async createNewUser(userData: User): Promise<UserDocument> {
    return await this.userModel.create(userData);
  }

  async findUserUsingEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email });
  }
}
