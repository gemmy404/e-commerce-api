import {IsEnum, IsNotEmpty, IsOptional, ValidateNested} from "class-validator";
import {PaymentMethods} from "../../../common/enums/payment-method.enum";
import {ShippingAddressDto} from "./shipping-address.dto";
import {Type} from "class-transformer";

export class CreateOrderDto {
    @IsNotEmpty({message: 'Shipping address is required'})
    @ValidateNested()
    @Type(() => ShippingAddressDto)
    shippingAddress: ShippingAddressDto;

    @IsOptional()
    @IsEnum(PaymentMethods)
    paymentMethod: PaymentMethods
}