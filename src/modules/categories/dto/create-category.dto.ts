import {IsNotEmpty, IsString} from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty({message: 'Category name is required'})
    @IsString({message: 'Category name must be a string'})
    name: string;
}
