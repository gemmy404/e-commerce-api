import {Body, Controller, Headers, Post, Res, UseGuards} from '@nestjs/common';
import express from 'express';
import {StripeService} from './stripe.service';
import {ConnectedUser} from "../auth/decorators/connected-user.decorator";
import type {ConnectedUserDto} from "../../common/dto/connected-user.dto";
import {AuthGuard} from "../auth/guard/auth.guard";
import {CreateOrderDto} from "../orders/dto/create-order.dto";
import {RawBody} from "./decoractors/raw-body.decorator";

@Controller('api/v1/stripe')
export class StripeController {

    constructor(private readonly stripeService: StripeService) {
    }

    @Post('create-checkout')
    @UseGuards(AuthGuard)
    createCheckout(@Body() createOrderDto: CreateOrderDto, @ConnectedUser() connectedUser: ConnectedUserDto) {
        return this.stripeService.createCheckoutSession(createOrderDto, connectedUser);
    }

    @Post('webhook')
    async handleWebhook(
        @RawBody() rawBody: Buffer,
        @Headers('stripe-signature') stripeSignature: string,
        @Res() res: express.Response,
    ) {
        try {
            await this.stripeService.handleWebhook(rawBody, stripeSignature);
            res.status(200).send('Webhook received successfully');
        } catch (error) {
            res.status(400).send(`Webhook error: ${error.message}`);
        }
    }

}
