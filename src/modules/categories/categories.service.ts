import {BadRequestException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {CreateCategoryDto} from './dto/create-category.dto';
import {Category} from "./schemas/category.schema";
import {Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {ApiResponseDto} from "../../common/dto/api-response.dto";
import {HttpStatusText} from "../../common/utils/httpStatusText";
import {CategoriesMapper} from "./categories.mapper";

@Injectable()
export class CategoriesService {

    constructor(
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
        @Inject() private readonly categoriesMapper: CategoriesMapper
    ) {
    }

    async createCategory(createCategoryDto: CreateCategoryDto): Promise<ApiResponseDto<Category>> {
        const category = await this.categoryModel.findOne({name: createCategoryDto.name});
        if (category) {
            throw new BadRequestException('Category already exists');
        }

        await this.categoryModel.create(createCategoryDto);

        const apiResponse: ApiResponseDto<Category> = {
            status: HttpStatusText.SUCCESS,
            data: {
                name: createCategoryDto.name,
            }
        };
        return apiResponse;
    }

    async findAllCategories(): Promise<ApiResponseDto<Category[]>> {
        const categories = await this.categoryModel.find().select('name');

        const apiResponse: ApiResponseDto<Category[]> = {
            status: HttpStatusText.SUCCESS,
            data: categories.map(this.categoriesMapper.toCategoriesResponse),
        };
        return apiResponse;
    }

    async deleteCategoryById(id: string): Promise<ApiResponseDto<null>> {
        const deletedResult = await this.categoryModel.deleteOne({_id: id});
        if (deletedResult.deletedCount === 0) {
            throw new NotFoundException(`Category with id: ${id} not found`);
        }

        const apiResponse: ApiResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            data: null
        };
        return apiResponse;
    }

}
