import {CartItemResponseDto} from "./cart-item-response.dto";

export interface CartResponseDto {
    items: CartItemResponseDto[];
    subtotal: number;
    discountAmount: number;
    total: number;
}