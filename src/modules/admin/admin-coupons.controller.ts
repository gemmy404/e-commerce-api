import {Body, Controller, DefaultValuePipe, Get, ParseIntPipe, Patch, Post, Query, UseGuards} from '@nestjs/common';
import {AuthGuard} from '../auth/guard/auth.guard';
import {Roles} from '../auth/decorators/roles.decorator';
import {ApiResponseDto} from '../../common/dto/api-response.dto';
import {UserRoles} from '../../common/enums/user-roles.enum';
import {CouponsService} from "../coupons/coupons.service";
import {CreateCouponDto} from "../coupons/dto/create-coupon.dto";
import {CouponResponseDto} from "../coupons/dto/coupon-response.dto";

@Controller('api/v1/admin/coupons')
@UseGuards(AuthGuard)
@Roles([UserRoles.ADMIN])
export class AdminCouponsController {

    constructor(private readonly couponsService: CouponsService) {
    }

    @Post()
    createCoupon(@Body() createCouponDto: CreateCouponDto): Promise<ApiResponseDto<CouponResponseDto>> {
        return this.couponsService.createCoupon(createCouponDto);
    }

    @Get()
    findAllCoupons(
        @Query('size', new DefaultValuePipe(4), ParseIntPipe) size: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    ): Promise<ApiResponseDto<CouponResponseDto[]>> {
        return this.couponsService.findAllCoupons(size, page);
    }

    @Patch('invalidate-coupons')
    invalidateCoupons(@Query('coupon') coupon?: string): Promise<ApiResponseDto<null>> {
        return this.couponsService.invalidateCoupons(coupon);
    }

}
