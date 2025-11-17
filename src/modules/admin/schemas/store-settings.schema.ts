import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";

export type StoreSettingDocument = HydratedDocument<StoreSetting>;

@Schema({timestamps: true})
export class StoreSetting {
    @Prop({
        required: true,
        default: 0.0
    })
    globalDiscountPercentage: number;
}

export const StoreSettingSchema = SchemaFactory.createForClass(StoreSetting);