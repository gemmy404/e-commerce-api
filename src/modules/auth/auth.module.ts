import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UsersSchema} from '../users/schemas/users.schema';
import {AuthService} from './auth.service';
import {JwtModule} from '@nestjs/jwt';
import * as process from 'node:process';
import {MailService} from "../mail/mail.service";

@Module({
    imports: [
        MongooseModule.forFeature([{name: User.name, schema: UsersSchema}]),
        JwtModule.registerAsync({
            global: true,
            useFactory: () => ({
                secret: process.env.JWT_SECRET_KEY,
                signOptions: {expiresIn: '30m'},
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {
}
