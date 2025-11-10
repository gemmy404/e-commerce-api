import {Controller, Get} from '@nestjs/common';
import {CategoriesService} from './categories.service';
import {ApiResponseDto} from "../../common/dto/api-response.dto";
import {Category} from "./schemas/category.schema";

@Controller('api/v1/categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {
    }

    @Get()
    findAllCategories(): Promise<ApiResponseDto<Category[]>> {
        return this.categoriesService.findAllCategories();
    }

}
