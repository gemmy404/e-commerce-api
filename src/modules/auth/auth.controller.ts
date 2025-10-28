import {Body, Controller, HttpCode, HttpStatus, Patch, Post, Query} from '@nestjs/common';
import {RegisterRequestDto} from './dto/register-request.dto';
import {AuthService} from './auth.service';
import {LoginRequestDto} from './dto/login-request.dto';
import {ResetPasswordRequestDto} from "./dto/reset-password-request.dto";
import {VerifyCodeRequestDto} from "./dto/verify-code-request.dto";

@Controller('api/v1/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('register')
    register(@Body() registerRequestDto: RegisterRequestDto) {
        return this.authService.register(registerRequestDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginRequestDto: LoginRequestDto) {
        return this.authService.login(loginRequestDto);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    forgotPassword(@Query('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post('verify-code')
    @HttpCode(HttpStatus.OK)
    verifyResetCode(@Body() verifyCodeRequestDto: VerifyCodeRequestDto) {
        return this.authService.verifyResetCode(verifyCodeRequestDto);
    }

    @Patch('reset-password')
    resetPassword(@Body() resetPasswordRequestDto: ResetPasswordRequestDto) {
        return this.authService.resetPassword(resetPasswordRequestDto);
    }

}
