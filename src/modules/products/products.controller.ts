import {Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ProductsService} from './products.service';
import {ApiResponseDto} from "../../common/dto/api-response.dto";
import {ProductResponseDto} from "./dto/product-response.dto";

@Controller('api/v1/products')
export class ProductsController {

    constructor(private readonly productsService: ProductsService) {
    }

    @Get()
    getAllProducts(
        @Query('size', new DefaultValuePipe(4), ParseIntPipe) size: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    ): Promise<ApiResponseDto<ProductResponseDto[]>> {
        return this.productsService.getAllProducts(size, page);
    }

    @Get('filter')
    filterProducts(
        @Query('size', new DefaultValuePipe(4), ParseIntPipe) size: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('name') name?: string,
        @Query('subCategory') subCategory?: string,
    ): Promise<ApiResponseDto<ProductResponseDto[]>> {
        return this.productsService.filterProducts(size, page, name, subCategory);
    }

    @Get(':id')
    getProductById(@Param('id') id: string): Promise<ApiResponseDto<ProductResponseDto>> {
        return this.productsService.getProductById(id);
    }


}
