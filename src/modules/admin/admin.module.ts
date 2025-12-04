import {Module} from '@nestjs/common';
import {AdminController} from './admin.controller';
import {AdminService} from './admin.service';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UsersSchema} from '../users/schemas/users.schema';
import {UsersModule} from "../users/users.module";
import {CategoriesModule} from "../categories/categories.module";
import {SubCategoriesModule} from "../sub-categories/sub-categories.module";
import {StoreSetting, StoreSettingSchema} from "./schemas/store-settings.schema";
import {AdminCategoriesController} from "./admin-categories.controller";
import {AdminCouponsController} from "./admin-coupons.controller";
import {AdminProductsController} from "./admin-products.controller";
import {CouponsModule} from "../coupons/coupons.module";
import {ProductsModule} from "../products/products.module";
import {AdminOrdersController} from "./admin-orders.controller";
import {OrdersModule} from "../orders/orders.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: User.name, schema: UsersSchema},
            {name: StoreSetting.name, schema: StoreSettingSchema},
        ]),
        UsersModule,
        CategoriesModule,
        SubCategoriesModule,
        CouponsModule,
        ProductsModule,
        OrdersModule,
    ],
    controllers: [AdminController, AdminCategoriesController, AdminCouponsController, AdminProductsController, AdminOrdersController],
    providers: [AdminService],
})
export class AdminModule {
}