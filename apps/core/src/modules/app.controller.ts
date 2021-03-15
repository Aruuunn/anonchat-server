import { Controller, Get, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { resolve } from 'path';
import * as fs from 'fs';

@Controller({
  path: '',
})
export class AppController {

  @Get('app*')
  getApp(@Res() res: FastifyReply): void {
    const stream = fs.createReadStream(
      resolve('./client-build/chat-app/index.html'),
    );
    res.type('text/html').send(stream);
  }
}
