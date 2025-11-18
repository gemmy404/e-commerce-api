import {IsMongoId, IsNotEmpty, Min} from "class-validator";
import {Type} from "class-transformer";

export class CreateProductDto {
    @IsNotEmpty({message: 'Product name is required'})
    name: string;

    @IsNotEmpty({message: 'Description is required'})
    description: string;

    @IsNotEmpty({message: 'Price is required'})
    @Type(() => Number)
    @Min(1, {message: 'Price must be greater than 0'})
    price: number;

    @IsNotEmpty({message: 'Quantity is required'})
    @Type(() => Number)
    @Min(1, {message: 'Quantity must be greater than 0'})
    quantity: number;

    @IsNotEmpty({message: 'Subcategory id is required'})
    @IsMongoId({message: 'Subcategory id must be in objectId format'})
    subCategoryId: string;
}