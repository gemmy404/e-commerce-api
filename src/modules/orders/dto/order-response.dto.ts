import {ShippingAddress} from "../schemas/shipping-address.schema";
import {OrderStatus} from "../../../common/enums/order-status.enum";
import {PaymentMethods} from "../../../common/enums/payment-method.enum";
import {PaymentStatus} from "../../../common/enums/payment-status.enum";
import {OrderItemsResponseDto} from "./order-items-response.dto";
import {UsedCouponDto} from "./used-coupon.dto";

export interface OrderResponseDto {
    id: string;
    totalPrice: number;
    usedCoupon: UsedCouponDto | null;
    shippingAddress: ShippingAddress;
    orderStatus: OrderStatus;
    paymentMethod: PaymentMethods;
    paymentStatus: PaymentStatus;
    items: OrderItemsResponseDto[];
}