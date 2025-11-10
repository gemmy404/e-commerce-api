import {IsMongoId, IsNotEmpty, IsString} from "class-validator";

export class CreateSubCategoryDto {
    @IsNotEmpty({message: 'Category name is required'})
    @IsString({message: 'Category name must be a string'})
    name: string;

    @IsNotEmpty({message: 'Category id is required'})
    @IsMongoId({message: 'Category id must be in objectId format'})
    categoryId: string;
}
