import {Controller, Get, Param} from '@nestjs/common';
import {SubCategoriesService} from './sub-categories.service';
import {ApiResponseDto} from "../../common/dto/api-response.dto";
import {SubCategoryResponseDto} from "./dto/sub-category-response.dto";

@Controller('api/v1')
export class SubCategoriesController {
    constructor(private readonly subCategoriesService: SubCategoriesService) {
    }

    @Get('categories/:id/sub-categories')
    getSubCategoriesByCategoryId(@Param('id') id: string): Promise<ApiResponseDto<SubCategoryResponseDto[]>> {
        return this.subCategoriesService.findAllSubCategoriesByCategoryId(id);
    }

}
