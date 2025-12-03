import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class ShippingAddress {
    @Prop({
        required: true,
    })
    city: string;

    @Prop({
        required: true,
    })
    district: string;

    @Prop({
        required: true,
    })
    street: string;
}

export const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);