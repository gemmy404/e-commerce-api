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

@Injectable()
export class CartsService {

    constructor(
        @InjectModel(Cart.name) private readonly cartsModel: Model<Cart>,
        @InjectModel(Product.name) private readonly productsModel: Model<Product>,
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
        let total = 0;
        savedCart.items.map(item => {
            items.push(this.cartsMapper.toCartItemResponse(item))
            total += item.price * item.quantity;
        });

        const apiResponse: ApiResponseDto<CartResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: {
                items,
                total
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

        await this.cartsModel.updateOne(
            {userId: connectedUser.sub},
            {$pull: {items: item}}
        );

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
}
