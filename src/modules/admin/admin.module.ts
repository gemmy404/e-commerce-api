import {Module} from '@nestjs/common';
import {AdminController} from './admin.controller';
import {AdminService} from './admin.service';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UsersSchema} from '../users/schemas/users.schema';
import {UsersModule} from "../users/users.module";
import {CategoriesModule} from "../categories/categories.module";
import {SubCategoriesModule} from "../sub-categories/sub-categories.module";
import {StoreSetting, StoreSettingSchema} from "./schemas/store-settings.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: User.name, schema: UsersSchema},
            {name: StoreSetting.name, schema: StoreSettingSchema},
        ]),
        UsersModule,
        CategoriesModule,
        SubCategoriesModule,
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {
}