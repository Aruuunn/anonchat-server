import {
    Body,
    Controller,
    Post,
    Res,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import {Response} from 'express';
import {AuthService} from './auth.service';
import {NewUserDto} from './dto/new-user.dto';
import {cookieOptions} from '../../config/cookie.config';
import {InvitationService} from '../invitation/invitation.service';


function setCookie(res: Response, data: Record<string, string>): void {
    for (const key of Object.keys(data)) {
        res.cookie(key, data[key], cookieOptions);
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
        @Res() res: Response,
    ): Promise<void> {
        const {user, accessToken, refreshToken} = await this.authService.register(
            payload,
        );

        const invitation = await this.invitationService.newInvitation(user);

        setCookie(res, {refreshToken});
        res.send({data: {invitationId: invitation.id, id: user.id}, accessToken});
    }
}
