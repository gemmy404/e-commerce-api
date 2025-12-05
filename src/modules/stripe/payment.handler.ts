import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Cart} from "../carts/schemas/carts.schema";
import Stripe from "stripe";
import {Model} from "mongoose";
import {Coupon} from "../coupons/schemas/coupons.schema";
import {OrdersService} from "../orders/orders.service";
import {ProductsService} from "../products/products.service";
import {ConnectedUserDto} from "../../common/dto/connected-user.dto";
import {CreateOrderDto} from "../orders/dto/create-order.dto";
import {PaymentUtils} from "./payment.utils";
import process from "node:process";
import {Order} from "../orders/schemas/orders.schema";
import {OrderStatus} from "../../common/enums/order-status.enum";
import {PaymentMethods} from "../../common/enums/payment-method.enum";
import {PaymentStatus} from "../../common/enums/payment-status.enum";

@Injectable()
export class PaymentHandlerService {
    constructor(
        @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
        @InjectModel(Cart.name) private readonly cartsModel: Model<Cart>,
        @InjectModel(Coupon.name) private readonly couponsModel: Model<Coupon>,
        @InjectModel(Order.name) private readonly ordersModel: Model<Order>,
        private readonly ordersService: OrdersService,
        private readonly productsService: ProductsService,
    ) {
    }

    async createCheckoutSession(createOrderDto: CreateOrderDto, connectedUser: ConnectedUserDto) {
        const savedCart = await this.cartsModel
            .findOne({userId: connectedUser.sub})
            .populate('items.productId');
        if (!savedCart) {
            throw new NotFoundException(`You don't have a cart`);
        }

        let stripeCoupon: Stripe.Response<Stripe.Coupon>;
        if (savedCart.coupon) {
            stripeCoupon = await this.stripe.coupons.create({
                percent_off: savedCart.coupon.value,
                duration: 'once',
            });
        }

        await this.ordersService.validateCartAndCalculateOrder(savedCart);

        const lineItems = PaymentUtils.buildLineItems(savedCart);

        let couponId = stripeCoupon! ? stripeCoupon!.id : undefined;
        const session = await this.stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: lineItems,
            discounts: [{coupon: couponId}],
            client_reference_id: connectedUser.sub,
            success_url: process.env.PAYMENT_SUCCESS_URL,
            cancel_url: process.env.PAYMENT_FAIL_URL,
            metadata: {
                cartId: savedCart._id.toString(),
                shippingAddress: JSON.stringify(createOrderDto.shippingAddress),
            }
        });

        return session.url;
    }

    async processSuccessfulPayment(session: Stripe.Checkout.Session) {
        const savedCart = await this.cartsModel
            .findOne({userId: session.client_reference_id})
            .populate('items.productId', 'name price quantity imageCover');

        const shippingAddress = JSON.parse(session.metadata?.shippingAddress!);
        const lineItems = await this.stripe.checkout.sessions.listLineItems(session.id);

        const {orderItems, subtotal} = PaymentUtils.createOrderItems(savedCart, lineItems);

        const {discountAmount, coupon} = await PaymentUtils.applyCoupon(savedCart, subtotal, this.couponsModel);

        await this.ordersModel.create({
            userId: session.client_reference_id,
            items: orderItems,
            subtotal,
            discountAmount,
            total: subtotal - discountAmount,
            coupon,
            orderStatus: OrderStatus.CONFIRMED,
            paymentMethod: PaymentMethods.CARD,
            paymentStatus: PaymentStatus.PAID,
            paidAt: new Date(),
            shippingAddress,
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent,
        });

        await this.productsService.decreaseStock(savedCart!.items);
        savedCart!.items = [];
        savedCart!.coupon = undefined;
        await savedCart!.save();
    }
}