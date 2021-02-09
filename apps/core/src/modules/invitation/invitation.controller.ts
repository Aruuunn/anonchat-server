import {
    BadRequestException,
    Controller,
    Get,
    InternalServerErrorException,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import {ObjectId} from 'mongoose';
import {InvitationModel} from './invitation.model';
import {AuthGuard} from '../auth/gaurds/http/auth.guard';
import {InvitationService} from './invitation.service';
import {User} from '../user/decorators/get-user.decorator';
import {UserModel} from '../user/model/user.model';
import {isUUID} from '@nestjs/common/utils/is-uuid';
import {InvitationNotFoundError} from './exceptions/invitation-not-found.error';
import {UserService} from '../user/user.service';

@Controller({path: 'invitation'})
export class InvitationController {
    constructor(private invitationService: InvitationService, private userService: UserService) {
    }

    @Post()
    @UseGuards(AuthGuard)
    newInvitation(@User() user: UserModel): Promise<InvitationModel> {
        return this.invitationService.newInvitation(user);
    }

    @Post(':invitationId/open')
    @UseGuards(AuthGuard)
    async openInvitation(
        @Param('invitationId')
            invitationId: string,
        @User() user: UserModel,
    ) {

        try {
            const chat = await this.invitationService.invitationOpened(user, invitationId);
            const bundle = await this.userService.fetchBundle(chat.invitation.creatorOfInvitation, user);

            return {chatId: chat.id, bundle};
        } catch (e) {
            console.log(e);
            if (e instanceof InvitationNotFoundError) {
                throw new BadRequestException('Invitation Not found');
            } else {
                throw new InternalServerErrorException();
            }
        }
    }
}
