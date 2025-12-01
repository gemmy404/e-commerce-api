import {Module} from '@nestjs/common';
import {CartsService} from './carts.service';
import {CartsController} from './carts.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Cart, CartsSchema} from "./schemas/carts.schema";
import {Product, ProductsSchema} from "../products/schemas/products.schema";
import {CartsMapper} from "./carts.mapper";
import {Coupon, CouponsSchema} from "../coupons/schemas/coupons.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Cart.name, schema: CartsSchema},
            {name: Product.name, schema: ProductsSchema},
            {name: Coupon.name, schema: CouponsSchema},
        ]),
    ],
    controllers: [CartsController],
    providers: [CartsService, CartsMapper],
})
export class CartsModule {
}
