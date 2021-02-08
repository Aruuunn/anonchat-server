import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InvitationModel } from './invitation.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from '../user/model/user.model';
import { InvitationNotFoundError } from './exceptions/invitation-not-found.error';
import { DeviceType } from '../user/interfaces/device-type.interface';
import { UserService } from '../user/user.service';

@Injectable()
export class InvitationService {
  constructor(
    @InjectModel(InvitationModel.name)
    private invitationModel: Model<InvitationModel>,
    private userService: UserService,
  ) {}

  async fetchInvitationUsingId(id: string): Promise<InvitationModel> {
    return this.invitationModel.findOne({ id });
  }

  async newInvitation(from: UserModel): Promise<InvitationModel> {
    return this.invitationModel.create({ from });
  }

  async fetchBundleUsingInvitationId(
    invitationId: string,
    requester: UserModel,
  ): Promise<DeviceType<string>> {
    const invitation = await this.fetchInvitationUsingId(invitationId);
    if (!invitation) {
      throw new InvitationNotFoundError();
    }
    if (
      requester.id !== invitation.from?.id &&
      requester.id !== invitation.to?.id
    ) {
      throw new UnauthorizedException();
    }

    if (requester.id === invitation.from.id) {
      if (typeof invitation.to?.id === 'undefined') {
        throw new BadRequestException('Invitation Not Yet Opened');
      }
      return await this.userService.fetchBundle(invitation.to?.id, requester);
    } else {
      return await this.userService.fetchBundle(invitation.from.id, requester);
    }
  }

  async invitationOpened(by: UserModel, invitationId: string): Promise<void> {
    const invitation = await this.invitationModel.findOne({ id: invitationId });

    if (!invitation) {
      throw new InvitationNotFoundError();
    }
    invitation.to = by;
    await invitation.save();
  }
}
