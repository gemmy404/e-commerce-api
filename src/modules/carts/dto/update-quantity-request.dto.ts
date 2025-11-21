import {IsInt, Min} from "class-validator";

export class UpdateQuantityRequestDto {
    @IsInt({message: 'Product quantity must be a integer value'})
    @Min(1, {message: 'Product quantity must be greater than 0'})
    quantity: number;
}