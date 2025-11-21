import {IsInt, IsMongoId, IsNotEmpty, IsOptional, Min} from "class-validator";

export class AddToCartRequestDto {
    @IsNotEmpty({message: 'Product id is required'})
    @IsMongoId({message: 'Product id must be a objectId format'})
    productId: string;

    @IsOptional()
    @IsInt({message: 'Product quantity must be a integer value'})
    @Min(1, {message: 'Product quantity must be greater than 0'})
    quantity: number = 1;
}