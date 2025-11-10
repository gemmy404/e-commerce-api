import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument, Types} from "mongoose";
import {Category} from "../../categories/schemas/category.schema";

export type SubCategoryDocument = HydratedDocument<SubCategory>;

@Schema({timestamps: true})
export class SubCategory {
    @Prop({
        required: true,
        unique: true,
    })
    name: string;

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: Category.name,
    })
    category: Category;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);