import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {UserModel} from './model/user.model';
import {BundleDto} from '../auth/dto/bundle.dto';
import {Bundle} from './interfaces/bundle.interface';
import {DeviceType} from './interfaces/device-type.interface';
import {NewUserDto} from '../auth/dto/new-user.dto';
import {isTruthy} from '../../utils/is-truthy.util';
import {MessageInterface, MessageModel} from '../chat/models/message.model';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(UserModel.name)
        private userModel: Model<UserModel>,
    ) {
    }

    async createNewUser(userData: NewUserDto): Promise<UserModel> {
        return await this.userModel.create(userData);
    }

    async saveBundle(bundleData: BundleDto, user: UserModel): Promise<void> {

        await this.userModel.updateOne(
            {_id: user.id},
            {
                bundle: bundleData,
            },
        );
    }

    async addNewMessageToNotDeliveredMessages(message: MessageModel, user: UserModel): Promise<UserModel> {

        user.notDeliveredMessages.push(message);
        await user.save();
        //   await user.updateOne({
        //     notDeliveredMessages: [...user.notDeliveredMessages, message]
        //});
        console.log({user, message});
        return user;
    }

    async fetchBundle(
        requestedUser: UserModel,
    ): Promise<DeviceType<string>> {

        const bundle: Bundle<string> | undefined = requestedUser.bundle;

        if (!isTruthy(bundle)) {
            throw new Error('Bundle is not defined');
        }
        const preKey = bundle.oneTimePreKeys.pop();

        await this.saveBundle(bundle, requestedUser);

        return {
            preKey,
            registrationId: bundle.registrationId,
            signedPreKey: bundle.signedPreKey,
            identityKey: bundle.identityPubKey,
        };
    }

    async findUserUsingId(id: string): Promise<UserModel> {
        return this.userModel.findOne({_id: id});
    }
}
