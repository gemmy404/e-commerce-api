import {Body, Controller, Delete, Param, Post, UseGuards} from '@nestjs/common';
import {AuthGuard} from '../auth/guard/auth.guard';
import {Roles} from '../auth/decorators/roles.decorator';
import {UserRoles} from '../../common/utils/userRoles';
import {CreateCategoryDto} from "../categories/dto/create-category.dto";
import {CategoriesService} from "../categories/categories.service";
import {SubCategoriesService} from "../sub-categories/sub-categories.service";
import {CreateSubCategoryDto} from "../sub-categories/dto/create-sub-category.dto";

@Controller('api/v1/admin')
@UseGuards(AuthGuard)
@Roles([UserRoles.ADMIN])
export class AdminCategoriesController {

    constructor(
        private readonly categoriesService: CategoriesService,
        private readonly subCategoriesService: SubCategoriesService,
    ) {
    }

    @Post('categories')
    createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.createCategory(createCategoryDto);
    }

    @Delete('categories/:id')
    deleteCategoryById(@Param('id') id: string) {
        return this.categoriesService.deleteCategoryById(id);
    }


    @Post('sub-categories')
    createSubCategory(@Body() createSubCategoryDto: CreateSubCategoryDto) {
        return this.subCategoriesService.createSubCategory(createSubCategoryDto);
    }

    @Delete('sub-categories/:id')
    deleteSubCategoryById(@Param('id') id: string) {
        return this.subCategoriesService.deleteSubCategoryById(id);
    }

}
