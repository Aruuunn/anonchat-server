import {NestFactory} from '@nestjs/core';
import {FastifyAdapter, NestFastifyApplication} from '@nestjs/platform-fastify';
import fastifyCookie from 'fastify-cookie';
import {AppModule} from './modules/app.module';
import {TransformOutputInterceptor} from './common/interceptors/transform-output.interceptor';
import {COOKIE_SECRET} from './config';

const PORT = process.env.PORT || 8000;

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({
            logger: true
        }));
    app.enableCors({
        credentials: true,
        origin: ['http://localhost:4200'],
    });
    await app.register(fastifyCookie, {
        secret: COOKIE_SECRET
    });

    app.useGlobalInterceptors(new TransformOutputInterceptor());
    await app.listen(PORT);
}

bootstrap().then(() => {
    console.log(`Server Listening at port: ${PORT}`);
});
