import {Injectable} from '@nestjs/common';
import {MailerService} from "@nestjs-modules/mailer";
import * as process from "node:process";

@Injectable()
export class MailService {

    constructor(private readonly mailerService: MailerService) {
    }

    async sendMail(to: string, name: string, resetCode: string): Promise<void> {
        try {
            await this.mailerService.sendMail({
                subject: 'Password Reset Request',
                to,
                from: process.env.GMAIL_EMAIL!,
                template: `${process.env.TEMPLATE_BASE_PATH}/templates/reset-password.html`,
                context: {
                    name,
                    resetCode,
                },
            });
        } catch (error) {
            console.log(error.message);
        }
    }

}
