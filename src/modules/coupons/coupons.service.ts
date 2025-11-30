import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Coupon} from "./schemas/coupons.schema";
import {Model} from "mongoose";
import {CreateCouponDto} from "./dto/create-coupon.dto";
import {ApiResponseDto} from "../../common/dto/api-response.dto";
import {HttpStatusText} from "../../common/utils/httpStatusText";
import {CouponMapper} from "./coupons.mapper";
import {CouponResponseDto} from "./dto/coupon-response.dto";

@Injectable()
export class CouponsService {

    constructor(
        @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,
        private readonly couponMapper: CouponMapper,) {
    }

    async createCoupon(createCouponDto: CreateCouponDto): Promise<ApiResponseDto<CouponResponseDto>> {
        const coupon = await this.couponModel.findOne({code: createCouponDto.code});
        if (coupon) {
            throw new BadRequestException('Coupon already exists');
        }

        const currDate = new Date();
        if (new Date(createCouponDto.expireDate) < currDate) {
            throw new BadRequestException(`Expire date must be greater than ${currDate.toISOString()}`);
        }

        const createdCoupon = await this.couponModel.create(createCouponDto);

        const apiResponse: ApiResponseDto<CouponResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.couponMapper.toCouponResponse(createdCoupon),
        }
        return apiResponse;
    }

    async findAllCoupons(size: number, page: number): Promise<ApiResponseDto<CouponResponseDto[]>> {
        if (size < 1 || page < 1) {
            throw new BadRequestException('Size and page must be greater than 0');
        }

        const skip = (page - 1) * size;
        const coupons = await this.couponModel.find()
            .sort({isValid: -1})
            .limit(size).skip(skip)

        const apiResponse: ApiResponseDto<CouponResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: coupons.map(this.couponMapper.toCouponResponse),
        };
        return apiResponse;
    }

    async invalidateCoupons(code?: string): Promise<ApiResponseDto<null>> {
        if (code) {
            const invalidatedCoupons = await this.couponModel.updateOne({code}, {isValid: false});
            if (invalidatedCoupons.matchedCount === 0) {
                throw new NotFoundException(`Coupon: ${code} is not found`);
            }
        } else {
            await this.couponModel.updateMany({
                    expireDate: {$lt: new Date()},
                },
                {
                    isValid: false,
                }
            );
        }

        const apiResponse: ApiResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            data: null,
        };
        return apiResponse;
    }
}
