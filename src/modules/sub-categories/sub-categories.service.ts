import {BadRequestException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {CreateSubCategoryDto} from './dto/create-sub-category.dto';
import {SubCategory} from "./schemas/sub-category.schema";
import {Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {ApiResponseDto} from "../../common/dto/api-response.dto";
import {HttpStatusText} from "../../common/utils/httpStatusText";
import {SubCategoryResponseDto} from "./dto/sub-category-response.dto";
import {SubCategoriesMapper} from "./sub-categories.mapper";
import {Category} from "../categories/schemas/category.schema";

@Injectable()
export class SubCategoriesService {

    constructor(
        @InjectModel(SubCategory.name) private readonly subCategoryModel: Model<SubCategory>,
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
        @Inject() private readonly subCategoriesMapper: SubCategoriesMapper
    ) {
    }

    async createSubCategory(createSubCategoryDto: CreateSubCategoryDto): Promise<ApiResponseDto<SubCategoryResponseDto>> {
        const category = await this.categoryModel.findById(createSubCategoryDto.categoryId);
        if (!category) {
            throw new NotFoundException(`Category with id ${createSubCategoryDto.categoryId} not found`);
        }

        const subCategory = await this.subCategoryModel.findOne({
            name: createSubCategoryDto.name
        });
        if (subCategory) {
            throw new BadRequestException('Sub category already exists');
        }

        const createdCategory = await this.subCategoryModel
            .create(this.subCategoriesMapper.toSubCategoriesSchema(createSubCategoryDto));

        const apiResponse: ApiResponseDto<SubCategoryResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: {
                id: createdCategory._id.toString(),
                name: createdCategory.name,
                category: category.name,
            }
        };
        return apiResponse;
    }

    async findAllSubCategoriesByCategoryId(categoryId: string): Promise<ApiResponseDto<SubCategoryResponseDto[]>> {
        const category = await this.categoryModel.findById(categoryId);
        if (!category) {
            throw new NotFoundException(`Category with id ${categoryId} not found`);
        }

        const subCategories = await this.subCategoryModel.find({
            category: categoryId,
        })
            .select('name')
            .populate('category', 'name');

        const apiResponse: ApiResponseDto<SubCategoryResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: subCategories.map(this.subCategoriesMapper.toSubCategoriesResponse),
        };
        return apiResponse;
    }

    async deleteSubCategoryById(id: string): Promise<ApiResponseDto<null>> {
        const deletedResult = await this.subCategoryModel.deleteOne({_id: id});
        if (deletedResult.deletedCount === 0) {
            throw new NotFoundException(`Sub category with id: ${id} not found`);
        }

        const apiResponse: ApiResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            data: null
        };
        return apiResponse;
    }

}
