import {
    Body,
    Controller, InternalServerErrorException,
    Post,
    Res,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import {FastifyReply} from 'fastify';
import {AuthService} from './auth.service';
import {NewUserDto} from './dto/new-user.dto';
import {cookieOptions} from '../../config';
import {InvitationService} from '../invitation/invitation.service';
import {InvitationDocument} from '../invitation/invitation.model';


function setCookie(res: FastifyReply, data: Record<string, string>): void {
    for (const key of Object.keys(data)) {
        res.setCookie(key, data[key], cookieOptions);
    }
}

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private invitationService: InvitationService) {
    }

    @Post('register')
    @UsePipes(ValidationPipe)
    async register(
        @Body() payload: NewUserDto,
        @Res() res: FastifyReply,
    ): Promise<void> {
        const result = await this.authService.register(
            payload,
        );
        if (result.isErr()) {
            throw new InternalServerErrorException();
        }
        const {accessToken, user, refreshToken} = result.value;

        const invitationResult = await this.invitationService.newInvitation(user);

        if (invitationResult.isErr()) {
            throw new InternalServerErrorException();
        }

        const invitation = invitationResult.value;

        setCookie(res, {refreshToken});
        res.send({data: {invitationId: invitation.id, id: user.id}, accessToken});
    }
}
