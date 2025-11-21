import {CartItemResponseDto} from "./cart-item-response.dto";

export interface CartResponseDto {
    items: CartItemResponseDto[];
    total: number;
}