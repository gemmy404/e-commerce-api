import {Body, Controller, DefaultValuePipe, Get, ParseIntPipe, Post, Query, UseGuards} from '@nestjs/common';
import {OrdersService} from './orders.service';
import {CreateOrderDto} from "./dto/create-order.dto";
import type {ConnectedUserDto} from "../../common/dto/connected-user.dto";
import {ConnectedUser} from "../auth/decorators/connected-user.decorator";
import {AuthGuard} from "../auth/guard/auth.guard";
import {OrderResponseDto} from "./dto/order-response.dto";
import {ApiResponseDto} from "../../common/dto/api-response.dto";

@Controller('api/v1/orders')
@UseGuards(AuthGuard)
export class OrdersController {

    constructor(private readonly ordersService: OrdersService) {
    }

    @Post('cash')
    createCashOrder(@Body() createOrderDto: CreateOrderDto, @ConnectedUser() connectedUser: ConnectedUserDto) {
        return this.ordersService.createCashOrder(createOrderDto, connectedUser);
    }

    @Get('my')
    findAllMyOrdersWithDetails(
        @Query('size', new DefaultValuePipe(4), ParseIntPipe) size: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @ConnectedUser() connectedUser: ConnectedUserDto,
    ): Promise<ApiResponseDto<OrderResponseDto[]>> {
        return this.ordersService.findAllMyOrdersWithDetails(size, page, connectedUser);
    }

}
