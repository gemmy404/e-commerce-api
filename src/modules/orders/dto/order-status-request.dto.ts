import {OrderStatus} from "../../../common/enums/order-status.enum";
import {IsEnum, IsNotEmpty} from "class-validator";

export class OrderStatusRequestDto {
    @IsNotEmpty({message: 'Order status is required'})
    @IsEnum(OrderStatus)
    newStatus: OrderStatus
}