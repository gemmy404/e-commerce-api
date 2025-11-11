import {
    Body,
    Controller,
    DefaultValuePipe, Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import {AuthGuard} from '../auth/guard/auth.guard';
import {AdminService} from './admin.service';
import {Roles} from '../auth/decorators/roles.decorator';
import {ApiResponseDto} from '../../common/dto/api-response.dto';
import {UserResponseDto} from '../users/dto/user-response-dto';
import {UserRoles} from '../../common/utils/userRoles';
import {RoleDto} from '../../common/dto/role.dto';
import {ConnectedUser} from "../auth/decorators/connected-user.decorator";
import type {ConnectedUserDto} from "../../common/dto/connected-user.dto";
import {CreateCategoryDto} from "../categories/dto/create-category.dto";
import {CategoriesService} from "../categories/categories.service";
import {SubCategoriesService} from "../sub-categories/sub-categories.service";
import {CreateSubCategoryDto} from "../sub-categories/dto/create-sub-category.dto";

@Controller('api/v1/admin')
@UseGuards(AuthGuard)
@Roles([UserRoles.ADMIN])
export class AdminController {

    constructor(
        private readonly adminsService: AdminService,
        private readonly categoriesService: CategoriesService,
        private readonly subCategoriesService: SubCategoriesService,
    ) {
    }

    @Get('users')
    findAllUsersByRole(
        @Query('role') role: string,
        @Query('size', new DefaultValuePipe(4), ParseIntPipe) size: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    ): Promise<ApiResponseDto<UserResponseDto[]>> {
        return this.adminsService.findAllUsersByRole(role, size, page);
    }

    @Patch('users/:id/role')
    changeUserRole(@Param('id') id: string, @Body() role: RoleDto, @ConnectedUser() connectedUser: ConnectedUserDto) {
        return this.adminsService.changeUserRole(id, role, connectedUser);
    }

    @Patch('users/:id/toggle-activation')
    toggleUserActivation(@Param('id') id: string, @ConnectedUser() connectedUser: ConnectedUserDto) {
        return this.adminsService.toggleUserActivation(id, connectedUser);
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
