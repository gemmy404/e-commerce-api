import {BadRequestException, Inject, Injectable} from '@nestjs/common';
import Stripe from "stripe";
import * as process from "node:process";
import {ConnectedUserDto} from "../../common/dto/connected-user.dto";
import {ApiResponseDto} from "../../common/dto/api-response.dto";
import {HttpStatusText} from "../../common/utils/httpStatusText";
import {CreateOrderDto} from "../orders/dto/create-order.dto";
import {PaymentHandlerService} from "./payment.handler";

@Injectable()
export class StripeService {
    private readonly webhookSecret: string

    constructor(
        @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
        private readonly paymentHandlerService: PaymentHandlerService,
    ) {
        this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    }

    async createCheckoutSession(createOrderDto: CreateOrderDto, connectedUser: ConnectedUserDto) {
        const sessionUrl = await this.paymentHandlerService.createCheckoutSession(createOrderDto, connectedUser);

        const apiResponse: ApiResponseDto<{ url: string | null }> = {
            status: HttpStatusText.SUCCESS,
            data: {url: sessionUrl},
        }
        return apiResponse;
    }

    async handleWebhook(rawBody: Buffer, stripeSignature: string) {
        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(rawBody, stripeSignature, this.webhookSecret);
        } catch (error) {
            console.log(error);
            throw new BadRequestException(`Webhook Error: ${error.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            await this.paymentHandlerService.processSuccessfulPayment(session);
        }

        return {received: true};
    }
}
