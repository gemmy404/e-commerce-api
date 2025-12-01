import {Module, ValidationPipe} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {MongooseModule} from '@nestjs/mongoose';
import {UsersModule} from './modules/users/users.module';
import {AuthModule} from './modules/auth/auth.module';
import * as process from 'node:process';
import {AdminModule} from './modules/admin/admin.module';
import {MailModule} from './modules/mail/mail.module';
import {CategoriesModule} from './modules/categories/categories.module';
import {SubCategoriesModule} from "./modules/sub-categories/sub-categories.module";
import {ProductsModule} from './modules/products/products.module';
import {CartsModule} from './modules/carts/carts.module';
import {CouponsModule} from "./modules/coupons/coupons.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.DATABASE_URL!),
        UsersModule,
        AuthModule,
        AdminModule,
        MailModule,
        CategoriesModule,
        SubCategoriesModule,
        ProductsModule,
        CartsModule,
        CouponsModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'APP_PIPE',
            useValue: new ValidationPipe({whitelist: true, forbidNonWhitelisted: true, transform: true}),
        },
    ],
})
export class AppModule {
}
