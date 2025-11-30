export interface CouponResponseDto {
    code: string;
    expireDate: string;
    discount: number;
    isValid: boolean;
    maxUsage: number;
    numberOfUsage: number;
}