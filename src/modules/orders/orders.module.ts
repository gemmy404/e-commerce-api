import {Module} from '@nestjs/common';
import {OrdersService} from './orders.service';
import {OrdersController} from './orders.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Order, OrdersSchema} from "./schemas/orders.schema";
import {Cart, CartsSchema} from "../carts/schemas/carts.schema";
import {Product, ProductsSchema} from "../products/schemas/products.schema";
import {Coupon, CouponsSchema} from "../coupons/schemas/coupons.schema";
import {ProductsModule} from "../products/products.module";
import {OrdersMapper} from "./orders.mapper";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Order.name, schema: OrdersSchema},
            {name: Cart.name, schema: CartsSchema},
            {name: Coupon.name, schema: CouponsSchema},
            {name: Product.name, schema: ProductsSchema},
        ]),
        ProductsModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService, OrdersMapper],
    exports: [OrdersService],
})
export class OrdersModule {
}
