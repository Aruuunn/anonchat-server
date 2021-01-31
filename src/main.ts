import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { TransformOutputInterceptor } from './transform-output.interceptor';

const PORT = process.env.PORT || 8000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: ['http://localhost:4200']
  });
  app.use(cookieParser());
  app.useGlobalInterceptors(new TransformOutputInterceptor());
  await app.listen(PORT);
}

bootstrap().then(() => {
  console.log(`Server Listening at port: ${PORT}`);
});
