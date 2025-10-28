import {Module, ValidationPipe} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {MongooseModule} from '@nestjs/mongoose';
import {UsersModule} from './modules/users/users.module';
import {AuthModule} from './modules/auth/auth.module';
import * as process from 'node:process';
import {MailModule} from './modules/mail/mail.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.DATABASE_URL!),
        UsersModule,
        AuthModule,
        MailModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'APP_PIPE',
            useValue: new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}),
        },
    ],
})
export class AppModule {
}
