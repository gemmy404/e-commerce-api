import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument, Types} from "mongoose";
import {Product} from "../../products/schemas/products.schema";

export type OrderItemDocument = HydratedDocument<OrderItem>;

@Schema()
export class OrderItem {
    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: Product.name,
    })
    productId: Types.ObjectId;

    @Prop({
        required: true,
    })
    productName: string;

    @Prop({
        required: true,
    })
    productImage: string;

    @Prop({
        required: true,
        min: 1,
    })
    quantity: number;

    @Prop({
        required: true,
    })
    price: number;

    @Prop({
        required: true,
    })
    totalPrice: number;
}

export const OrderItemsSchema = SchemaFactory.createForClass(OrderItem);