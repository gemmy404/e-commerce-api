import {Injectable} from "@nestjs/common";
import {OrderResponseDto} from "./dto/order-response.dto";
import {OrderItemsResponseDto} from "./dto/order-items-response.dto";

@Injectable()
export class OrdersMapper {

    toOrdersResponse(order: any): OrderResponseDto {
        const items = order.items || [];
        return {
            id: order._id.toString(),
            totalPrice: order.total,
            usedCoupon: order.coupon || null,
            shippingAddress: order.shippingAddress,
            orderStatus: order.orderStatus,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            items: items.map(OrdersMapper.toOrderItemsResponse),
        };
    }

    private static toOrderItemsResponse(item: any): OrderItemsResponseDto {
        return {
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
        };
    }
}