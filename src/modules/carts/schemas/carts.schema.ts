import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument, Types} from "mongoose";
import {User} from "../../users/schemas/users.schema";
import {CartItem, CartItemsSchema} from "./cart-items.schema";

export type CartDocument = HydratedDocument<Cart>;

@Schema({timestamps: true})
export class Cart {
    @Prop({
        type: [CartItemsSchema],
        default: []
    })
    items: CartItem[];

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: User.name,
        unique: true,
    })
    userId: Types.ObjectId;
}

export const CartsSchema = SchemaFactory.createForClass(Cart);