import {
    BadRequestException,
    Controller,
    Get,
    InternalServerErrorException,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import {InvitationModel} from './invitation.model';
import {AuthGuard} from '../auth/gaurds/http/auth.guard';
import {InvitationService} from './invitation.service';
import {User} from '../user/decorators/get-user.decorator';
import {UserModel} from '../user/model/user.model';
import {InvitationNotFoundError} from './exceptions/invitation-not-found.error';
import {UserService} from '../user/user.service';
import {hmacHash} from '../../utils/hmacHash';

@Controller({path: 'invitation'})
export class InvitationController {
    constructor(private invitationService: InvitationService, private userService: UserService) {
    }

    @Post()
    @UseGuards(AuthGuard)
    newInvitation(@User() user: UserModel): Promise<InvitationModel> {
        return this.invitationService.newInvitation(user);
    }

    @Get(':invitationId')
    @UseGuards(AuthGuard)
    async fetchDetails(
        @Param('invitationId') invitationId: string,
        @User() user: UserModel
    ): Promise<{ fullName: string }> {
        const invitation = await this.invitationService.fetchInvitationUsingId(invitationId);

        if (invitation.creatorOfInvitation.id === user.id) {
            throw new BadRequestException();
        }
        return {fullName: invitation.creatorOfInvitation.fullName};
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
            const bundle = await this.userService.fetchBundle(chat.invitation.creatorOfInvitation);
            const recipientId = hmacHash(chat.invitation.creatorOfInvitation.id);
            return {chatId: chat.id, bundle, recipientId};
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
