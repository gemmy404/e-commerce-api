import {Module} from '@nestjs/common';
import {StripeService} from './stripe.service';
import {StripeController} from './stripe.controller';
import Stripe from "stripe";
import * as process from "node:process";
import {MongooseModule} from "@nestjs/mongoose";
import {Cart, CartsSchema} from "../carts/schemas/carts.schema";
import {OrdersModule} from "../orders/orders.module";
import {Order, OrdersSchema} from "../orders/schemas/orders.schema";
import {Coupon, CouponsSchema} from "../coupons/schemas/coupons.schema";
import {ProductsModule} from "../products/products.module";
import {PaymentHandlerService} from "./payment.handler";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Cart.name, schema: CartsSchema},
            {name: Order.name, schema: OrdersSchema},
            {name: Coupon.name, schema: CouponsSchema},
        ]),
        OrdersModule,
        ProductsModule,
    ],
    controllers: [StripeController],
    providers: [
        {
            provide: 'STRIPE_CLIENT',
            useFactory: () => {
                return new Stripe(process.env.STRIPE_API_KEY!, {
                    apiVersion: '2025-11-17.clover'
                });
            }
        },
        StripeService,
        PaymentHandlerService,
    ],
})
export class StripeModule {
}
