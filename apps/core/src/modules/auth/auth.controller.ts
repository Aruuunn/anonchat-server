import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { NewUserDto } from './dto/new-user.dto';
import { cookieOptions } from '../../config';
import { InvitationService } from '../invitation/invitation.service';
import { AccessTokenService } from './jwttoken/access-token.service';
import { RefreshTokenService } from './jwttoken/refresh-token.service';
import { isValidJwt } from '../../utils/is-valid-jwt';
import { TokenErrorsEnum } from './jwttoken/token.exceptions';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private invitationService: InvitationService,
    private accessTokenService: AccessTokenService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  @Post('register')
  @UsePipes(ValidationPipe)
  async register(
    @Body() payload: NewUserDto,
    @Res() res: FastifyReply,
  ): Promise<void> {
    const result = await this.authService.register(payload);
    if (result.isErr()) {
      throw new InternalServerErrorException();
    }
    const { accessToken, user, refreshToken } = result.value;

    const invitationResult = await this.invitationService.newInvitation(user);

    if (invitationResult.isErr()) {
      throw new InternalServerErrorException();
    }

    const invitation = invitationResult.value;

    res.setCookie('refreshToken', refreshToken, cookieOptions).send({
      data: {
        invitationId: invitation.id,
        id: user.id,
      },
      accessToken,
    });
  }

  @Get('access-token/refresh')
  refreshAccessToken(@Req() req: FastifyRequest) {
    const { refreshToken } = req.cookies;

    if (!isValidJwt(refreshToken)) {
      throw new BadRequestException();
    }

    const refreshTokenVerifyResult = this.refreshTokenService.verify(
      refreshToken,
    );

    if (refreshTokenVerifyResult.isErr()) {
      if (
        refreshTokenVerifyResult.error.type === TokenErrorsEnum.TOKEN_EXPIRED
      ) {
        throw new UnauthorizedException();
      } else {
        throw new BadRequestException();
      }
    }
    const { id } = refreshTokenVerifyResult.value;
    const accessToken = this.accessTokenService.generateTokenUsingId(id);

    return { accessToken };
  }
}
