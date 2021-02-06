import { WsException } from '@nestjs/websockets';

export interface WsExceptionMessage {
  code: number;
  message: string;
}

export class BaseWsException {
  constructor(private error: WsExceptionMessage) {
    throw new WsException(error);
  }
}

export class UnAuthorizedWsException extends BaseWsException {
  constructor(message?: string) {
    super({ code: 401, message: message ?? 'Un-Authorized' });
  }
}

export class BadRequestWsException extends BaseWsException {
  constructor(message?: string) {
    super({ code: 400, message: message ?? 'Bad Request' });
  }
}
