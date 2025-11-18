import {
    Body,
    Controller,
    Param,
    ParseFilePipe,
    Patch,
    Post,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {AuthGuard} from '../auth/guard/auth.guard';
import {Roles} from '../auth/decorators/roles.decorator';
import {UserRoles} from '../../common/utils/userRoles';
import {ProductsService} from "../products/products.service";
import {FileInterceptor, FilesInterceptor} from "@nestjs/platform-express";
import {createMulterStorage} from "../../common/utils/multer-storage";
import {CreateProductDto} from "../products/dto/create-product.dto";
import {ApiResponseDto} from "../../common/dto/api-response.dto";
import {ProductResponseDto} from "../products/dto/product-response.dto";
import {UpdateProductDto} from "../products/dto/update-product.dto";

@Controller('api/v1/admin/products')
@UseGuards(AuthGuard)
@Roles([UserRoles.ADMIN])
export class AdminProductsController {

    constructor(private readonly productsService: ProductsService) {
    }

    @Post()
    @UseInterceptors(FileInterceptor('imageCover', {storage: createMulterStorage()}))
    createProduct(
        @Body() createProductDto: CreateProductDto,
        @UploadedFile(new ParseFilePipe({fileIsRequired: true})) imageCover: Express.Multer.File
    ): Promise<ApiResponseDto<ProductResponseDto>> {
        return this.productsService.createProduct(createProductDto, imageCover);
    }

    @Post(':id/upload-images')
    @UseInterceptors(FilesInterceptor('images', 5, {storage: createMulterStorage()}))
    uploadProductImages(
        @Param('id') id: string,
        @UploadedFiles(new ParseFilePipe({fileIsRequired: true})) images: Array<Express.Multer.File>
    ): Promise<ApiResponseDto<ProductResponseDto>> {
        return this.productsService.uploadProductImages(id, images)
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('imageCover', {storage: createMulterStorage()}))
    async updateProduct(
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
        @UploadedFile() imageCover?: Express.Multer.File
    ): Promise<ApiResponseDto<ProductResponseDto>> {
        return this.productsService.updateProduct(id, updateProductDto, imageCover);
    }


}
