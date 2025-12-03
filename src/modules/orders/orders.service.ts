import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Order} from "./schemas/orders.schema";
import {Model} from "mongoose";
import {CreateOrderDto} from "./dto/create-order.dto";
import {ConnectedUserDto} from "../../common/dto/connected-user.dto";
import {Cart} from "../carts/schemas/carts.schema";
import {CartItem} from "../carts/schemas/cart-items.schema";
import {OrderItem} from "./schemas/order-items.schema";
import {Coupon} from "../coupons/schemas/coupons.schema";
import {validateCoupon} from "../../common/utils/validateCoupon";
import {ProductsService} from "../products/products.service";
import {ApiResponseDto} from "../../common/dto/api-response.dto";
import {HttpStatusText} from "../../common/utils/httpStatusText";
import {OrdersMapper} from "./orders.mapper";
import {OrderResponseDto} from "./dto/order-response.dto";
import {OrderStatus} from "../../common/enums/order-status.enum";
import {PaymentMethods} from "../../common/enums/payment-method.enum";
import {PaymentStatus} from "../../common/enums/payment-status.enum";
import {OrderStatusRequestDto} from "./dto/order-status-request.dto";

@Injectable()
export class OrdersService {

    constructor(
        @InjectModel(Order.name) private readonly ordersModel: Model<Order>,
        @InjectModel(Cart.name) private readonly cartsModel: Model<Cart>,
        @InjectModel(Coupon.name) private readonly couponsModel: Model<Coupon>,
        private readonly productsService: ProductsService,
        private readonly ordersMapper: OrdersMapper,
    ) {
    }

    async createCashOrder(
        createOrderDto: CreateOrderDto,
        connectedUser: ConnectedUserDto
    ): Promise<ApiResponseDto<null>> {
        const savedCart = await this.cartsModel.findOne({userId: connectedUser.sub})
            .populate('items.productId', 'name price quantity imageCover');
        if (!savedCart) {
            throw new NotFoundException(`You don't have a cart`);
        }
        const orderDetails = await this.validateCartAndCalculateOrder(savedCart);

        await this.ordersModel.create({
            userId: connectedUser.sub,
            ...orderDetails,
            shippingAddress: createOrderDto.shippingAddress,
        });

        await this.productsService.decreaseStock(savedCart.items);
        savedCart.items = [];
        if (savedCart.coupon && orderDetails.coupon) {
            const savedCoupon = await this.couponsModel.findOne({code: savedCart.coupon.code});
            if (savedCoupon) {
                savedCoupon.numberOfUsage++;
                await savedCoupon.save();
            }
            savedCart.coupon = undefined;
        }
        await savedCart.save();

        const apiResponse: ApiResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            data: null,
        };
        return apiResponse;
    }

    // For user orders
    async findAllMyOrdersWithDetails(
        size: number,
        page: number,
        connectedUser: ConnectedUserDto
    ): Promise<ApiResponseDto<OrderResponseDto[]>> {
        const query = {userId: connectedUser.sub};
        const ordersResponse: OrderResponseDto[] = await this.getOrdersWithDetails(query, size, page);

        const apiResponse: ApiResponseDto<OrderResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: ordersResponse,
        }
        return apiResponse;
    }

    // For admin
    async findAllOrdersWithDetails(size: number, page: number): Promise<ApiResponseDto<OrderResponseDto[]>> {
        const ordersResponse: OrderResponseDto[] = await this.getOrdersWithDetails({}, size, page);

        const apiResponse: ApiResponseDto<OrderResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: ordersResponse,
        }
        return apiResponse;
    }

    async transitionOrderStatus(
        orderId: string,
        orderStatusRequestDto: OrderStatusRequestDto
    ): Promise<ApiResponseDto<OrderResponseDto>> {
        const savedOrder = await this.ordersModel
            .findById(orderId, '-items -coupon -shippingAddress');
        if (!savedOrder) {
            throw new NotFoundException(`Order with id: ${orderId} not found`);
        }

        const {newStatus} = orderStatusRequestDto;

        if (savedOrder.orderStatus === OrderStatus.DELIVERED) {
            throw new BadRequestException('Order already delivered');
        } else if (
            newStatus === OrderStatus.SHIPPED &&
            savedOrder.orderStatus !== OrderStatus.CREATED &&
            savedOrder.orderStatus !== OrderStatus.CONFIRMED
        ) {
            throw new BadRequestException('Cannot move to SHIPPING from current status');
        } else if (newStatus === OrderStatus.DELIVERED && savedOrder.orderStatus !== OrderStatus.SHIPPED) {
            throw new BadRequestException('Cannot move to DELIVERED from current status');
        }

        if (newStatus === OrderStatus.SHIPPED) {
            savedOrder.orderStatus = OrderStatus.SHIPPED;
        } else if (newStatus === OrderStatus.DELIVERED) {
            savedOrder.orderStatus = OrderStatus.DELIVERED;
            savedOrder.deliveredAt = new Date();

            if (savedOrder.paymentMethod === PaymentMethods.CASH && savedOrder.paymentStatus !== PaymentStatus.PAID) {
                savedOrder.paymentStatus = PaymentStatus.PAID;
                savedOrder.paidAt = new Date();
            }
        }

        const updatedOrder = await savedOrder.save();
        const apiResponse: ApiResponseDto<OrderResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.ordersMapper.toOrdersResponse(updatedOrder),
        }
        return apiResponse;
    }

    private async getOrdersWithDetails(query: any, size: number, page: number) {
        if (size < 1 || page < 1) {
            throw new BadRequestException('Size and page must be greater than 0');
        }

        const skip = (page - 1) * size;
        const orders = await this.ordersModel
            .find(query, '-coupon._id -shippingAddress._id')
            .sort({createdAt: -1})
            .skip(skip).limit(size);

        return orders.map(this.ordersMapper.toOrdersResponse);
    }

    async validateCartAndCalculateOrder(savedCart: any) {
        const cartItems: CartItem[] = savedCart.items;
        if (cartItems.length === 0) {
            throw new NotFoundException(`Cart is empty`);
        }

        const orderItems: OrderItem[] = [];
        const subtotal: number = cartItems.reduce((sum: number, item: any): number => {
            if (item.productId.quantity < item.quantity) {
                throw new BadRequestException(
                    `The stock quantity is insufficient for ${item.productId.name}`
                );
            }
            orderItems.push({
                productId: item.productId._id.toString(),
                productName: item.productId.name,
                productImage: item.productId.imageCover,
                price: item.productId.price,
                quantity: item.quantity,
                totalPrice: item.productId.price * item.quantity,
            });

            sum += item.productId.price * item.quantity;
            return sum;
        }, 0);

        const coupon = savedCart.coupon || null;
        let discountAmount = 0;
        const savedCoupon = await this.couponsModel.findOne({code: coupon?.code});
        if (coupon && savedCoupon) {
            if (!validateCoupon(savedCoupon)) {
                savedCoupon.isValid = false;
                throw new BadRequestException(
                    `The coupon has expired. It has been removed from your cart. Please try checkout again`
                );
            }
            discountAmount = subtotal * (coupon.value / 100);
        }
        return {
            items: orderItems,
            subtotal,
            discountAmount,
            total: subtotal - discountAmount,
            coupon,
        };
    }

}
