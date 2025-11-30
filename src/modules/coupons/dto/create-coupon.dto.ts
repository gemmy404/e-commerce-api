import {IsDateString, IsNotEmpty, IsNumber} from "class-validator";

export class CreateCouponDto {
    @IsNotEmpty({message: 'Coupon code is required'})
    code: string;

    @IsNotEmpty({message: 'Expire date is required'})
    @IsDateString({}, {message: 'Expire date must be a date format'})
    expireDate: Date;

    @IsNotEmpty({message: 'Coupon discount is required'})
    @IsNumber({}, {message: 'Coupon discount must be number'})
    discount: number;

    @IsNotEmpty({message: 'Coupon max usage is required'})
    @IsNumber({}, {message: 'Coupon max usage must be number'})
    maxUsage: number;
}
