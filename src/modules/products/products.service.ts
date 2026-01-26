import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Product, ProductDocument} from "./schemas/products.schema";
import {Model} from "mongoose";
import {CreateProductDto} from "./dto/create-product.dto";
import {ProductsMapper} from "./products.mapper";
import {StoreSetting} from "../admin/schemas/store-settings.schema";
import {ApiResponseDto} from "../../common/dto/api-response.dto";
import {ProductResponseDto} from "./dto/product-response.dto";
import {HttpStatusText} from "../../common/utils/httpStatusText";
import {UpdateProductDto} from "./dto/update-product.dto";
import {SubCategory} from "../sub-categories/schemas/sub-category.schema";
import {CartItem} from "../carts/schemas/cart-items.schema";
import {CloudinaryService} from "../cloudinary/cloudinary.service";
import {buildImageUrl} from "../../common/utils/buildImageUrl";

@Injectable()
export class ProductsService {

    constructor(
        @InjectModel(Product.name) private readonly productModel: Model<Product>,
        @InjectModel(SubCategory.name) private readonly subCategoryModel: Model<SubCategory>,
        @InjectModel(StoreSetting.name) private readonly storeSettingModel: Model<StoreSetting>,
        private readonly productsMapper: ProductsMapper,
        private readonly cloudinaryService: CloudinaryService,
    ) {
    }

    async createProduct(
        createProductDto: CreateProductDto,
        imageCover: Express.Multer.File
    ): Promise<ApiResponseDto<ProductResponseDto>> {
        const subCategory = await this.subCategoryModel.findById(createProductDto.subCategoryId);
        if (!subCategory) {
            throw new NotFoundException(`SubCategory with id: ${createProductDto.subCategoryId} not found`);
        }

        let uploadedDetails;
        try {
         uploadedDetails = await this.cloudinaryService.uploadFile(imageCover);
        } catch (e) {
            throw new BadRequestException(`Uploading image fail: ${e.message}`);
        }

        const createdProduct = await this.productModel
            .create({
                ...createProductDto,
                subCategory: createProductDto.subCategoryId,
                imageCover: uploadedDetails.public_id
            });

        createdProduct.imageCover = buildImageUrl(createdProduct.imageCover) as string;
        createdProduct.images = buildImageUrl(createdProduct.images) as string[];

        const apiResponse: ApiResponseDto<ProductResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: {...this.productsMapper.toProductsResponse(createdProduct), category: subCategory.name},
        };
        return apiResponse;
    }

    async uploadProductImages(
        productId: string,
        images: Array<Express.Multer.File>
    ): Promise<ApiResponseDto<ProductResponseDto>> {
        const savedProduct = await this.productModel.findById(productId)
            .populate('subCategory');
        if (!savedProduct) {
            throw new NotFoundException(`Product with id: ${productId} not found`);
        }

        let uploadedResult;
        try {
            uploadedResult = await this.cloudinaryService.uploadFiles(images);
        } catch (e) {
            throw new BadRequestException('Images upload failed');
        }

        const filesUrl: string[] = [];
        uploadedResult.map(imgDetails => {
            filesUrl.push(imgDetails.public_id);
        })

        savedProduct.images = filesUrl;
        const updatedProduct = await savedProduct.save();

        this.cloudinaryService.removeTags(filesUrl);

        updatedProduct.imageCover = buildImageUrl(updatedProduct.imageCover) as string;
        updatedProduct.images = buildImageUrl(updatedProduct.images) as string[];

        const apiResponse: ApiResponseDto<ProductResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: {...this.productsMapper.toProductsResponse(updatedProduct), category: savedProduct.subCategory.name},
        };
        return apiResponse;
    }

    async updateProduct(
        productId: string,
        updateProductDto: UpdateProductDto,
        imageCover?: Express.Multer.File
    ): Promise<ApiResponseDto<ProductResponseDto>> {
        const savedProduct = await this.productModel.findById(productId);
        if (!savedProduct) {
            throw new NotFoundException(`Product with id: ${productId} not found`);
        }

        let fileUrl: string | undefined = undefined;
        if (imageCover) {
            fileUrl = `${process.env.BASE_URL}/${imageCover.path.replace(/\\/g, '/')}`;
        }

        const updatedProduct = await this.productModel
            .findByIdAndUpdate(productId,
                {...updateProductDto, subCategory: updateProductDto?.subCategoryId, imageCover: fileUrl},
                {new: true})
            .populate('subCategory');

        const apiResponse: ApiResponseDto<ProductResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.productsMapper.toProductsResponse(updatedProduct!),
        };
        return apiResponse;
    }

    async getAllProducts(size: number, page: number): Promise<ApiResponseDto<ProductResponseDto[]>> {
        if (size < 1 || page < 1) {
            throw new BadRequestException('Size and page must be greater than 0');
        }

        const skip = (page - 1) * size;

        const products = await this.productModel.find()
            .limit(size).skip(skip)
            .populate('subCategory');
        const globalDiscount = await this.globalDiscount();

        const productsResponse: ProductResponseDto[] = products.map((product: ProductDocument): ProductResponseDto =>
            this.productsMapper.toProductsResponse(product, globalDiscount)
        );

        const apiResponse: ApiResponseDto<ProductResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: productsResponse,
        };
        return apiResponse;
    }

    async getProductById(productId: string): Promise<ApiResponseDto<ProductResponseDto>> {
        const savedProduct = await this.productModel.findById(productId)
            .populate('subCategory');
        if (!savedProduct) {
            throw new NotFoundException(`Product with id ${productId} not found`);
        }

        const globalDiscount = await this.globalDiscount();

        const apiResponse: ApiResponseDto<ProductResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.productsMapper.toProductsResponse(savedProduct, globalDiscount),
        };
        return apiResponse;
    }

    async filterProducts(
        size: number,
        page: number,
        productName?: string,
        subCategory?: string
    ): Promise<ApiResponseDto<ProductResponseDto[]>> {
        if (size < 1 || page < 1) {
            throw new BadRequestException('Size and page must be greater than 0');
        }

        const skip = (page - 1) * size;
        const filter: any = {};
        if (productName) {
            filter.name = {$regex: productName, $options: 'i'};
        }
        if (subCategory) {
            const savedSubCategory = await this.subCategoryModel.findOne({name: subCategory});
            if (!savedSubCategory) {
                throw new NotFoundException(`SubCategory with name: ${subCategory} not found`);
            }
            filter.subCategory = savedSubCategory._id.toString();
        }

        if (Object.keys(filter).length === 0) {
            throw new BadRequestException(`At least add product name or subcategory`);
        }

        const products = await this.productModel.find({
            $or: [
                {name: filter.name},
                {subCategory: filter.subCategory},
            ]
        })
            .limit(size).skip(skip)
            .populate('subCategory');
        const globalDiscount = await this.globalDiscount();

        const productsResponse: ProductResponseDto[] = products.map((product: ProductDocument): ProductResponseDto =>
            this.productsMapper.toProductsResponse(product, globalDiscount)
        );

        const apiResponse: ApiResponseDto<ProductResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: productsResponse,
        };
        return apiResponse;
    }

    private async globalDiscount(): Promise<number> {
        const storeSetting = await this.storeSettingModel.findOne();
        return storeSetting?.globalDiscountPercentage && storeSetting.globalDiscountPercentage > 0 ?
            storeSetting.globalDiscountPercentage : 0;
    }

    async decreaseStock(items: CartItem[]) {
        const bulkOps = items.map((item: any) => ({
            updateOne: {
                filter: {_id: item.productId._id},
                update: {$inc: {quantity: -item.quantity}}
            }
        }));
        return await this.productModel.bulkWrite(bulkOps);
    }

}
