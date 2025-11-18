import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument, Types} from "mongoose";
import {SubCategory} from "../../sub-categories/schemas/sub-category.schema";

export type ProductDocument = HydratedDocument<Product>;

@Schema({timestamps: true})
export class Product {
    @Prop({
        required: true,
    })
    name: string;

    @Prop({
        required: true,
    })
    description: string;

    @Prop({
        required: true,
    })
    price: number;

    @Prop({
        required: true,
    })
    quantity: number;

    @Prop({
        required: true,
    })
    imageCover: string;

    @Prop({
        required: false,
        type: [String],
    })
    images: string[];

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: SubCategory.name,
    })
    subCategory: SubCategory
}

export const ProductsSchema = SchemaFactory.createForClass(Product);