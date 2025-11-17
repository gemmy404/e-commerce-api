import {Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Patch, Query, UseGuards} from '@nestjs/common';
import {AuthGuard} from '../auth/guard/auth.guard';
import {AdminService} from './admin.service';
import {Roles} from '../auth/decorators/roles.decorator';
import {ApiResponseDto} from '../../common/dto/api-response.dto';
import {UserResponseDto} from '../users/dto/user-response-dto';
import {UserRoles} from '../../common/utils/userRoles';
import {RoleDto} from '../../common/dto/role.dto';
import {ConnectedUser} from "../auth/decorators/connected-user.decorator";
import type {ConnectedUserDto} from "../../common/dto/connected-user.dto";

@Controller('api/v1/admin')
@UseGuards(AuthGuard)
@Roles([UserRoles.ADMIN])
export class AdminController {

    constructor(private readonly adminService: AdminService) {
    }

    @Get('users')
    findAllUsersByRole(
        @Query('role') role: string,
        @Query('size', new DefaultValuePipe(4), ParseIntPipe) size: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    ): Promise<ApiResponseDto<UserResponseDto[]>> {
        return this.adminService.findAllUsersByRole(role, size, page);
    }

    @Patch('users/:id/role')
    changeUserRole(@Param('id') id: string, @Body() role: RoleDto, @ConnectedUser() connectedUser: ConnectedUserDto) {
        return this.adminService.changeUserRole(id, role, connectedUser);
    }

    @Patch('users/:id/toggle-activation')
    toggleUserActivation(@Param('id') id: string, @ConnectedUser() connectedUser: ConnectedUserDto) {
        return this.adminService.toggleUserActivation(id, connectedUser);
    }

    @Get('store-settings')
    async getStoreSettings() {
        return this.adminService.getStoreSettings();
    }

    @Patch('store-settings/discount')
    async updateGlobalDiscount(@Body('discount') discount: number) {
        return this.adminService.updateGlobalDiscount(discount);
    }

}
