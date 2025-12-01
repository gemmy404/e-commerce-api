export const validateCoupon = (coupon: any): boolean => {
    return !(
        !coupon.isValid ||
        coupon.expireDate.getTime() < new Date().getTime() ||
        coupon.maxUsage <= coupon.numberOfUsage
    );
}