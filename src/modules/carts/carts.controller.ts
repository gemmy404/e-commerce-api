import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {CartsService} from './carts.service';
import {ConnectedUser} from "../auth/decorators/connected-user.decorator";
import type {ConnectedUserDto} from "../../common/dto/connected-user.dto";
import {AuthGuard} from "../auth/guard/auth.guard";
import {AddToCartRequestDto} from "./dto/add-to-cart-request.dto";
import {UpdateQuantityRequestDto} from "./dto/update-quantity-request.dto";
import {ApiResponseDto} from "../../common/dto/api-response.dto";
import {CartResponseDto} from "./dto/cart-response.dto";
import {ApplyCouponRequestDto} from "./dto/apply-coupon-request.dto";

@Controller('api/v1/carts')
@UseGuards(AuthGuard)
export class CartsController {

    constructor(private readonly cartsService: CartsService) {
    }

    @Post('items')
    addToCart(
        @Body() addToCartRequestDto: AddToCartRequestDto,
        @ConnectedUser() connectedUser: ConnectedUserDto
    ): Promise<ApiResponseDto<null>> {
        return this.cartsService.addToCart(addToCartRequestDto, connectedUser);
    }

    @Get()
    getOrCreateCart(@ConnectedUser() connectedUser: ConnectedUserDto): Promise<ApiResponseDto<CartResponseDto>> {
        return this.cartsService.getOrCreateCart(connectedUser);
    }

    @Patch('items/:productId/quantity')
    updateQuantity(
        @Param('productId') productId: string,
        @Body() updateQuantityRequestDto: UpdateQuantityRequestDto,
        @ConnectedUser() connectedUser: ConnectedUserDto
    ): Promise<ApiResponseDto<null>> {
        return this.cartsService.updateQuantity(productId, updateQuantityRequestDto.quantity, connectedUser);
    }

    @Delete('items/:productId')
    removeItemFromCart(
        @Param('productId') productId: string,
        @ConnectedUser() connectedUser: ConnectedUserDto
    ): Promise<ApiResponseDto<null>> {
        return this.cartsService.removeItemFromCart(productId, connectedUser);
    }

    @Post('apply-coupon')
    applyCoupon(
        @Body() applyCouponRequestDto: ApplyCouponRequestDto,
        @ConnectedUser() connectedUser: ConnectedUserDto
    ): Promise<ApiResponseDto<null>> {
        return this.cartsService.applyCoupon(applyCouponRequestDto.code, connectedUser);
    }

}
