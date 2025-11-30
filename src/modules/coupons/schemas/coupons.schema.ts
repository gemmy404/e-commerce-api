import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument, Types} from "mongoose";
import {User} from "../../users/schemas/users.schema";

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({timestamps: true})
export class Coupon {
    @Prop({
        required: true,
        unique: true,
    })
    code: string;

    @Prop({
        type: Date,
        required: true,
        min: new Date(),
    })
    expireDate: Date;

    @Prop({
        required: true,
        default: true,
    })
    isValid: boolean;

    @Prop({
        required: true,
    })
    discount: number;

    @Prop({
        required: true,
    })
    maxUsage: number;

    @Prop({
        default: 0,
    })
    numberOfUsage: number;

    @Prop({
        type: Types.ObjectId,
        ref: User.name
    })
    user: User
}

export const CouponsSchema = SchemaFactory.createForClass(Coupon);