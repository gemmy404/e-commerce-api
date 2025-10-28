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
import {MailService} from "../mail/mail.service";
import {generateResetPasswordCode} from "../../common/utils/generateCodes";
import {ResetPasswordCode} from "./schemas/reset-password-code.schema";
import {VerifyCodeRequestDto} from "./dto/verify-code-request.dto";
import {ResetPasswordRequestDto} from "./dto/reset-password-request.dto";
import {ConnectedUserDto} from "../../common/dto/connected-user.dto";

@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(ResetPasswordCode.name) private readonly resetPasswordModel: Model<ResetPasswordCode>,
        private jwtService: JwtService,
        private readonly mailService: MailService,
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

    async forgotPassword(email: string) {
        const savedUser = await this.userModel.findOne({email}).select('-password -__v');
        if (!savedUser) {
            throw new NotFoundException('The email that you\'ve entered is incorrect');
        }

        const resetCode = this.generateCodeRequest(savedUser._id.toString(), 6);
        // InvalidatePreviousCodes
        await this.resetPasswordModel.updateMany({
                user: savedUser._id.toString(),
                isValid: true
            },
            {
                $set: {
                    isValid: false
                }
            }
        );

        // saveResetCode in db
        await this.resetPasswordModel.create({
            code: resetCode.code,
            expireAt: resetCode.expireAt,
            user: resetCode.userId
        });

        // send email
        await this.mailService.sendMail(email, savedUser.name, resetCode.code);

        const apiResponse: ApiResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            data: null
        }
        return apiResponse;
    }

    async verifyResetCode(verifyCodeRequestDto: VerifyCodeRequestDto) {
        const savedUser = await this.userModel.findOne({email: verifyCodeRequestDto.email});
        if (!savedUser) {
            throw new NotFoundException('The email that you\'ve entered is incorrect');
        }

        const savedCode = await this.resetPasswordModel.findOne({
            code: verifyCodeRequestDto.code,
            user: savedUser._id.toString(),
        });
        if (!savedCode) {
            throw new NotFoundException('The code that you\'ve entered is incorrect');
        }

        if (!savedCode.isValid || savedCode.expireAt.getTime() < Date.now()) {
            await this.resetPasswordModel.updateMany({
                    user: savedUser._id.toString(),
                    isValid: true
                },
                {
                    $set: {
                        isValid: false
                    }
                }
            );
            const resetCode = this.generateCodeRequest(savedUser._id.toString(), 6);
            await this.resetPasswordModel.create({
                code: resetCode.code,
                expireAt: resetCode.expireAt,
                user: resetCode.userId
            });
            await this.mailService.sendMail(verifyCodeRequestDto.email, savedUser.name, resetCode.code);
            throw new BadRequestException('The code is expired, a new code has been sent to your email')
        }

        await this.resetPasswordModel.updateMany({
                user: savedUser._id.toString(),
                isValid: true
            },
            {
                $set: {
                    isValid: false
                }
            }
        );
        const token = this.jwtService.sign(
            {sub: savedUser._id, email: savedUser.email, role: savedUser.role},
            {expiresIn: '5m'}
        );

        const apiResponse: ApiResponseDto<{ token: string }> = {
            status: HttpStatusText.SUCCESS,
            data: {token}
        };
        return apiResponse;
    }

    async resetPassword(resetPasswordRequestDto: ResetPasswordRequestDto) {
        if (resetPasswordRequestDto.newPassword !== resetPasswordRequestDto.confirmNewPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        let payload: ConnectedUserDto;
        try {
            payload = await this.jwtService.verifyAsync(resetPasswordRequestDto.token);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
        const hashedNewPassword = await bcrypt.hash(resetPasswordRequestDto.newPassword, 10);
        await this.userModel.findByIdAndUpdate(payload.sub, {password: hashedNewPassword});

        const apiResponse: ApiResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            data: null
        };
        return apiResponse;
    }

    private generateCodeRequest(userId: string, length: number) {
        const code = generateResetPasswordCode(length);

        const expireAt = new Date();
        const currentMinutes = expireAt.getMinutes();
        expireAt.setMinutes(currentMinutes + 5);

        return {code, userId, expireAt};
    }

}
