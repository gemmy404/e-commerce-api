import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {RegisterRequestDto} from './dto/register-request.dto';
import {InjectModel} from '@nestjs/mongoose';
import {User} from '../users/schemas/users.schema';
import {Model} from 'mongoose';
import {LoginRequestDto} from './dto/login-request.dto';
import {JwtService} from '@nestjs/jwt';
import {ApiResponseDto} from '../../common/dto/api-response.dto';
import {HttpStatusText} from '../../common/utils/httpStatusText';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private jwtService: JwtService,
    ) {
    }

    async register(registerRequestDto: RegisterRequestDto) {
        const user = await this.userModel.findOne({
            email: registerRequestDto.email,
        }).select('email');
        if (user) {
            throw new BadRequestException('Email already exists, please try another email address');
        }

        if (registerRequestDto.password !== registerRequestDto.confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        registerRequestDto.password = await bcrypt.hash(
            registerRequestDto.password,
            10,
        );

        const createdUser = await this.userModel.create({...registerRequestDto, role: 'USER'});

        const apiResponse: ApiResponseDto<{ email: string }> = {
            status: HttpStatusText.SUCCESS,
            data: {
                email: createdUser.email,
            },
        };

        return apiResponse;
    }

    async login(loginRequestDto: LoginRequestDto) {
        const {email, password} = loginRequestDto;
        const savedUser = await this.userModel.findOne({email});
        if (!savedUser) {
            throw new NotFoundException('The email that you\'ve entered is incorrect');
        }

        const isMatchedPassword = await bcrypt.compare(password, savedUser.password);
        if (!isMatchedPassword) {
            throw new UnauthorizedException('The password that you\'ve entered is incorrect');
        }

        if (!savedUser.isActive) {
            throw new ForbiddenException('Your account is inactive. Please contact support');
        }

        const token = this.jwtService.sign(
            {sub: savedUser._id, email: savedUser.email, role: savedUser.role},
        );

        const apiResponse: ApiResponseDto<{ token: string }> = {
            status: HttpStatusText.SUCCESS,
            data: {
                token,
            },
        };

        return apiResponse;
    }

}
