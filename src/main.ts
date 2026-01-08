import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import * as express from 'express';
import {join} from "path";
import {AllExceptionsFilter} from "./common/handler/all-exceptions.filter";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        rawBody: true,
        bodyParser: true,
    });

    app.useGlobalFilters(new AllExceptionsFilter());

    app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
    app.use(express.static("templates"));

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
