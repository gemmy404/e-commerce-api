import {Module} from '@nestjs/common';
import {CouponsService} from './coupons.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Coupon, CouponsSchema} from "./schemas/coupons.schema";
import {CouponMapper} from "./coupons.mapper";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Coupon.name, schema: CouponsSchema},
        ]),
    ],
    providers: [CouponsService, CouponMapper],
    exports: [CouponsService],
})
export class CouponsModule {
}
