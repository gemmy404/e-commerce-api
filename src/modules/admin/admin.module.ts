import {Module} from '@nestjs/common';
import {AdminController} from './admin.controller';
import {AdminService} from './admin.service';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UsersSchema} from '../users/schemas/users.schema';
import {UsersMapper} from '../users/users.mapper';
import {UsersModule} from "../users/users.module";
import {CategoriesModule} from "../categories/categories.module";
import {SubCategoriesModule} from "../sub-categories/sub-categories.module";

@Module({
    imports: [
        MongooseModule.forFeature([{name: User.name, schema: UsersSchema}]),
        UsersModule,
        CategoriesModule,
        SubCategoriesModule,
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {
}