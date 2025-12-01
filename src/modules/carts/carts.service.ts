import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Cart} from "./schemas/carts.schema";
import {Model} from "mongoose";
import {CartItem} from "./schemas/cart-items.schema";
import {Product} from "../products/schemas/products.schema";
import {ConnectedUserDto} from "../../common/dto/connected-user.dto";
import {ApiResponseDto} from "../../common/dto/api-response.dto";
import {HttpStatusText} from "../../common/utils/httpStatusText";
import {CartItemResponseDto} from "./dto/cart-item-response.dto";
import {CartsMapper} from "./carts.mapper";
import {CartResponseDto} from "./dto/cart-response.dto";
import {AddToCartRequestDto} from "./dto/add-to-cart-request.dto";
import {Coupon} from "../coupons/schemas/coupons.schema";
import {validateCoupon} from "../../common/utils/validateCoupon";

@Injectable()
export class CartsService {

    constructor(
        @InjectModel(Cart.name) private readonly cartsModel: Model<Cart>,
        @InjectModel(Product.name) private readonly productsModel: Model<Product>,
        @InjectModel(Coupon.name) private readonly couponsModel: Model<Coupon>,
        private readonly cartsMapper: CartsMapper
    ) {
    }

    async addToCart(addToCartRequestDto: AddToCartRequestDto, connectedUser: ConnectedUserDto): Promise<ApiResponseDto<null>> {
        const {productId, quantity} = addToCartRequestDto;

        const savedProduct = await this.productsModel.findById(productId);
        if (!savedProduct) {
            throw new NotFoundException(`Product with id ${productId} not found`);
        }

        let savedCart = await this.cartsModel.findOne({userId: connectedUser.sub});
        if (!savedCart) {
            savedCart = await this.cartsModel.create({userId: connectedUser.sub});
        }

        const exists = savedCart.items.findIndex(item => item.productId.toString() === productId);
        if (exists !== -1) {
            throw new BadRequestException(`Product already exists`);
        }

        if (savedProduct.quantity < quantity) {
            throw new BadRequestException(
                `The stock quantity is insufficient; there are only ${savedProduct.quantity} of these`
            );
        }

        const item: CartItem = {
            productId: savedProduct._id,
            quantity,
            price: savedProduct.price,
        };
        await this.cartsModel.updateOne(
            {_id: savedCart._id},
            {$push: {items: item}}
        );

        const apiResponse: ApiResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            data: null,
        };
        return apiResponse;
    }

    async getOrCreateCart(connectedUser: ConnectedUserDto): Promise<ApiResponseDto<CartResponseDto>> {
        let savedCart = await this.cartsModel
            .findOne({userId: connectedUser.sub})
            .populate('items.productId');
        if (!savedCart) {
            savedCart = await this.cartsModel.create({userId: connectedUser.sub});
        }

        const items: CartItemResponseDto[] = [];
        let subtotal = 0;
        savedCart.items.map((item: any) => {
            items.push(this.cartsMapper.toCartItemResponse(item));
            subtotal += item.productId.price * item.quantity;
        });

        let discountAmount: number = 0;
        if (savedCart.coupon) {
            const savedCoupon = await this.couponsModel.findOne({code: savedCart.coupon.code});
            if (savedCoupon && validateCoupon(savedCoupon)) {
                discountAmount = subtotal * (savedCart.coupon.value / 100);
            }
        }

        const apiResponse: ApiResponseDto<CartResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: {
                items,
                subtotal,
                discountAmount,
                total: subtotal - discountAmount,
            },
        };
        return apiResponse;
    }

    async removeItemFromCart(productId: string, connectedUser: ConnectedUserDto): Promise<ApiResponseDto<null>> {
        let savedCart = await this.cartsModel.findOne({userId: connectedUser.sub});
        if (!savedCart) {
            savedCart = await this.cartsModel.create({userId: connectedUser.sub});
        }

        const item = savedCart.items.find(item => item.productId.toString() === productId);
        if (!item) {
            throw new NotFoundException(`Product with id ${productId} not found`);
        }

        if (savedCart.items.length === 1) {
            await this.cartsModel.updateOne(
                {userId: connectedUser.sub},
                {$pull: {items: item}, coupon: null},
            );
        } else {
            await this.cartsModel.updateOne(
                {userId: connectedUser.sub},
                {$pull: {items: item}},
            );
        }

        const apiResponse: ApiResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            data: null
        };
        return apiResponse;
    }

    async updateQuantity(productId: string, quantity: number, connectedUser: ConnectedUserDto): Promise<ApiResponseDto<null>> {
        let savedCart = await this.cartsModel.findOne({userId: connectedUser.sub});
        if (!savedCart) {
            savedCart = await this.cartsModel.create({userId: connectedUser.sub});
        }

        const savedProduct = await this.productsModel.findById(productId);
        if (!savedProduct) {
            throw new NotFoundException(`Product with id ${productId} not found`);
        }

        const indexOfItem = savedCart.items.findIndex(item => item.productId.toString() === productId);
        if (indexOfItem === -1) {
            throw new NotFoundException(`Product with id ${productId} not found in cart`);
        }

        if (savedProduct.quantity < quantity) {
            throw new BadRequestException(
                `The stock quantity is insufficient; there are only ${savedProduct.quantity} of these`
            );
        }

        savedCart.items[indexOfItem].quantity = quantity;
        await savedCart.save();

        const apiResponse: ApiResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            data: null
        };
        return apiResponse;
    }

    async applyCoupon(code: string, connectedUser: ConnectedUserDto): Promise<ApiResponseDto<null>> {
        const savedCoupon = await this.couponsModel.findOne({code});
        if (!savedCoupon) {
            throw new NotFoundException(`The coupon you entered is incorrect`);
        }

        const savedCart = await this.cartsModel.findOne({userId: connectedUser.sub});
        if (!savedCart || savedCart.items.length === 0) {
            throw new NotFoundException(`Cart is empty`);
        }

        if (!validateCoupon(savedCoupon)) {
            savedCoupon.isValid = false;
            await savedCoupon.save();
            throw new BadRequestException(`The coupon is expired`)
        }

        savedCart.coupon = {code, value: savedCoupon.discount};
        await savedCart.save();

        const apiResponse: ApiResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            data: null,
        };
        return apiResponse;
    }
}
