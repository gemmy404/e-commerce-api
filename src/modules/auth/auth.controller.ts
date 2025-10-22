import {Body, Controller, HttpCode, HttpStatus, Post, Query} from '@nestjs/common';
import {RegisterRequestDto} from './dto/register-request.dto';
import {AuthService} from './auth.service';
import {LoginRequestDto} from './dto/login-request.dto';

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

}
