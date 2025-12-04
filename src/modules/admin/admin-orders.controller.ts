import {Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Patch, Query, UseGuards} from '@nestjs/common';
import {AuthGuard} from '../auth/guard/auth.guard';
import {Roles} from '../auth/decorators/roles.decorator';
import {UserRoles} from '../../common/enums/user-roles.enum';
import {OrdersService} from "../orders/orders.service";
import {OrderResponseDto} from "../orders/dto/order-response.dto";
import {ApiResponseDto} from "../../common/dto/api-response.dto";
import {OrderStatusRequestDto} from "../orders/dto/order-status-request.dto";

@Controller('api/v1/admin/orders')
@UseGuards(AuthGuard)
@Roles([UserRoles.ADMIN])
export class AdminOrdersController {

    constructor(private readonly ordersService: OrdersService) {
    }

    @Get()
    findAllOrdersWithDetails(
        @Query('size', new DefaultValuePipe(4), ParseIntPipe) size: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    ): Promise<ApiResponseDto<OrderResponseDto[]>> {
        return this.ordersService.findAllOrdersWithDetails(size, page);
    }

    @Patch(':id/status')
    transitionOrderStatus(@Param('id') id: string, @Body() orderStatusRequestDto: OrderStatusRequestDto) {
        return this.ordersService.transitionOrderStatus(id, orderStatusRequestDto);
    }

}
