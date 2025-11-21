import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument, Types} from "mongoose";
import {Product} from "../../products/schemas/products.schema";

export type CartItemDocument = HydratedDocument<CartItem>;

@Schema()
export class CartItem {
    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: Product.name
    })
    productId: Types.ObjectId;

    @Prop({
        required: true,
        min: 1
    })
    quantity: number;

    @Prop({
        required: true
    })
    price: number;
}

export const CartItemsSchema = SchemaFactory.createForClass(CartItem);