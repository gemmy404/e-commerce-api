import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument, Types} from "mongoose";
import {OrderItem, OrderItemsSchema} from "./order-items.schema";
import {PaymentStatus} from "../../../common/enums/payment-status.enum";
import {OrderStatus} from "../../../common/enums/order-status.enum";
import {PaymentMethods} from "../../../common/enums/payment-method.enum";
import {User} from "../../users/schemas/users.schema";
import {ShippingAddress, ShippingAddressSchema} from "./shipping-address.schema";

export type OrderDocument = HydratedDocument<Order>

@Schema({timestamps: true})
export class Order {
    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: User.name
    })
    userId: Types.ObjectId;

    @Prop({
        type: [OrderItemsSchema],
        default: [],
    })
    items: OrderItem[];

    @Prop({
        default: 0
    })
    subtotal: number;

    @Prop({
        default: 0
    })
    discountAmount: number;

    @Prop({
        default: 0
    })
    total: number;

    @Prop({
        required: false,
        type: {
            code: String,
            value: Number,
        },
    })
    coupon?: {
        code: string;
        value: number;
    };

    @Prop({
        required: false,
    })
    stripeSessionId: string;

    @Prop({
        required: false,
    })
    stripePaymentIntentId: string;

    @Prop({
        required: true,
        type: ShippingAddressSchema,
    })
    shippingAddress: ShippingAddress;

    @Prop({
        enum: OrderStatus,
        default: OrderStatus.CREATED,
    })
    orderStatus: OrderStatus;

    @Prop({
        required: false,
        type: Date,
    })
    paidAt: Date;

    @Prop({
        required: false,
        type: Date,
    })
    deliveredAt: Date

    @Prop({
        enum: PaymentMethods,
        default: PaymentMethods.CASH,
    })
    paymentMethod: PaymentMethods;

    @Prop({
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    paymentStatus: PaymentStatus;
}

export const OrdersSchema = SchemaFactory.createForClass(Order);