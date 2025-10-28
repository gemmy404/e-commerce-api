import {Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UsersSchema} from './schemas/users.schema';
import {UsersMapper} from "./mapper/users.mapper";
import {ResetPasswordCode, ResetPasswordCodeSchema} from "../auth/schemas/reset-password-code.schema";
import {AuthModule} from "../auth/auth.module";
import {MailModule} from "../mail/mail.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: User.name, schema: UsersSchema},
            {name: ResetPasswordCode.name, schema: ResetPasswordCodeSchema},
        ]),
        AuthModule,
        MailModule,
    ],
    controllers: [UsersController],
    providers: [UsersService, UsersMapper],
    exports: [UsersMapper]
})
export class UsersModule {
}
