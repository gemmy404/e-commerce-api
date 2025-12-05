import {OrderItem} from "../orders/schemas/order-items.schema";

export class PaymentUtils {

    static buildLineItems(cart: any) {
        return cart.items.map((item: any) => {
            return {
                price_data: {
                    currency: 'egp',
                    product_data: {name: item.productId.name},
                    unit_amount: item.price * 100,
                },
                quantity: item.quantity,
            }
        });
    }

    static createOrderItems(cart: any, lineItems: any) {
        const orderItems: OrderItem[] = [];
        let subtotal = 0;
        cart.items.forEach((item: any, index: number): void => {
            const stripeItem = lineItems.data[index];
            const paidPrice = stripeItem.price.unit_amount / 100;

            orderItems.push({
                productId: item.productId._id.toString(),
                productName: item.productId.name,
                productImage: item.productId.imageCover,
                price: paidPrice,
                quantity: item.quantity,
                totalPrice: paidPrice * item.quantity,
            });

            subtotal += item.productId.price * item.quantity;
        });

        return {orderItems, subtotal};
    }

    static async applyCoupon(cart: any, orderSubtotal: number, couponsModel: any) {
        if (!cart.coupon) {
            return {discountAmount: 0, coupon: null};
        }

        const savedCoupon = await couponsModel.findOne({code: cart.coupon.code});
        savedCoupon.numberOfUsage++;
        if (savedCoupon.numberOfUsage >= savedCoupon.maxUsage) {
            savedCoupon.isValid = false;
            await savedCoupon.save();
        }

        const discountAmount = orderSubtotal * (cart.coupon.value / 100);
        return {discountAmount, coupon: cart.coupon};
    }
}