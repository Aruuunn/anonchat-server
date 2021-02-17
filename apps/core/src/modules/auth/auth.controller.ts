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
            console.log(result.error);
            throw new InternalServerErrorException();
        }
        const {accessToken, user, refreshToken} = result.value;

        const invitationResult = await this.invitationService.newInvitation(user);

        if (invitationResult.isErr()) {
            console.log(invitationResult.error);
            throw new InternalServerErrorException();
        }

        const invitation = invitationResult.value;

        res.setCookie('refreshToken', refreshToken, {...cookieOptions, signed: false, path: '/'}).send({
            data: {
                invitationId: invitation.id,
                id: user.id
            }, accessToken
        });
    }
}
