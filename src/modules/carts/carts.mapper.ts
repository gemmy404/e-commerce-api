import {Injectable} from "@nestjs/common";

@Injectable()
export class CartsMapper {

    toCartItemResponse(item: any) {
        return {
            productId: item.productId._id.toString(),
            productName: item.productId.name,
            quantity: item.quantity,
            price: item.price,
        };
    }
}