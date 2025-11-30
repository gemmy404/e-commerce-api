import {Injectable} from "@nestjs/common";
import {CouponResponseDto} from "./dto/coupon-response.dto";

@Injectable()
export class CouponMapper {

    toCouponResponse(coupon: any): CouponResponseDto {
        return {
            code: coupon.code,
            expireDate: coupon.expireDate,
            discount: coupon.discount,
            isValid: coupon.isValid,
            maxUsage: coupon.maxUsage,
            numberOfUsage: coupon.numberOfUsage,
        };
    }

}