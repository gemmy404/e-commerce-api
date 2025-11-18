export interface ProductResponseDto {
    id: string;
    name: string;
    description: string;
    category: string;
    quantity: number;
    price: number;
    priceAfterDiscount: number;
    imageCover: string;
    images: string[];
}