import {Injectable} from "@nestjs/common";
import {ProductResponseDto} from "./dto/product-response.dto";
import {ProductDocument} from "./schemas/products.schema";

@Injectable()
export class ProductsMapper {

    toProductsResponse(product: ProductDocument, globalDiscount: number = 0): ProductResponseDto {
        return {
            id: product._id.toString(),
            name: product.name,
            description: product.description,
            category: product.subCategory.name,
            quantity: product.quantity,
            price: product.price,
            priceAfterDiscount: product.price - product.price * (globalDiscount / 100),
            imageCover: product.imageCover,
            images: product.images
        };
    }

}