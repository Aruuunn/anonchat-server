import {NestFactory} from '@nestjs/core';
import {FastifyAdapter, NestFastifyApplication} from '@nestjs/platform-fastify';
import fastifyCookie from 'fastify-cookie';
import {AppModule} from './modules/app.module';
import {TransformOutputInterceptor} from './common/interceptors/transform-output.interceptor';


const PORT = process.env.PORT || 8000;

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({
            logger: false
        }));
    app.enableCors({
        credentials: true,
        origin: ['http://localhost:4200'],
    });
    await app.register(fastifyCookie);

    app.useGlobalInterceptors(new TransformOutputInterceptor());
    await app.listen(PORT);
}

bootstrap().then(() => {
    console.log(`Server Listening at port: ${PORT}`);
});
