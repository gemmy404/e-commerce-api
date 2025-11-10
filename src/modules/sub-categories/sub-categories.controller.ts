import {Controller, Get, Query} from '@nestjs/common';
import {SubCategoriesService} from './sub-categories.service';
import {ApiResponseDto} from "../../common/dto/api-response.dto";
import {SubCategory} from "./schemas/sub-category.schema";
import {SubCategoryResponseDto} from "./dto/sub-category-response.dto";

@Controller('api/v1/sub-categories')
export class SubCategoriesController {
    constructor(private readonly subCategoriesService: SubCategoriesService) {
    }

    @Get()
    filterSubCategoriesByCategoryId(@Query('id') id: string): Promise<ApiResponseDto<SubCategoryResponseDto[]>> {
        return this.subCategoriesService.findAllSubCategoriesByCategoryId(id);
    }

}
