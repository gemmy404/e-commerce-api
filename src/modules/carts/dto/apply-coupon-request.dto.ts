import {IsNotEmpty} from "class-validator";

export class ApplyCouponRequestDto {
    @IsNotEmpty({message: 'Coupon is required'})
    code: string
}