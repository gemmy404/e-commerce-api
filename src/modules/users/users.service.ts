import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {UpdateUserDto} from './dto/update-user.dto';
import {Model} from 'mongoose';
import {User} from './schemas/users.schema';
import {InjectModel} from '@nestjs/mongoose';
import {ConnectedUserDto} from "../../common/dto/connected-user.dto";
import {UsersMapper} from "./users.mapper";
import {ApiResponseDto} from "../../common/dto/api-response.dto";
import {UserResponseDto} from "./dto/user-response-dto";
import {HttpStatusText} from "../../common/utils/httpStatusText";
import {ChangePasswordDto} from "./dto/change-password-request.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly usersMapper: UsersMapper
    ) {
    }

    async getUserProfile(connectedUser: ConnectedUserDto): Promise<ApiResponseDto<UserResponseDto>> {
        const savedUser = await this.userModel
            .findById(connectedUser.sub)
            .select('-password -__v');
        if (!savedUser) {
            throw new NotFoundException(`User with id ${connectedUser.sub} not found`);
        }

        const apiResponse: ApiResponseDto<UserResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.usersMapper.toUserResponse(savedUser),
        }
        return apiResponse;
    }

    async updateProfile(updateUserDto: UpdateUserDto, connectedUser: ConnectedUserDto): Promise<ApiResponseDto<UserResponseDto>> {
        const updatedUser = await this.userModel
            .findByIdAndUpdate(connectedUser.sub, updateUserDto, {new: true})
            .select('-password -__v');
        if (!updatedUser) {
            throw new NotFoundException(`User with id ${connectedUser.sub} not found`);
        }

        const apiResponse: ApiResponseDto<UserResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.usersMapper.toUserResponse(updatedUser),
        }
        return apiResponse;
    }

    async uploadProfilePicture(file: Express.Multer.File, connectedUser: ConnectedUserDto): Promise<ApiResponseDto<UserResponseDto>> {
        const fileUrl = `${process.env.BASE_URL}/${file.path.replace(/\\/g, '/')}`;

        const updatedUser = await this.userModel
            .findByIdAndUpdate(connectedUser.sub, {avatar: fileUrl}, {new: true})
            .select('-password -__v');
        if (!updatedUser) {
            throw new NotFoundException(`User with id ${connectedUser.sub} not found`);
        }

        const apiResponse: ApiResponseDto<UserResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.usersMapper.toUserResponse(updatedUser),
        }
        return apiResponse;
    }

    async changePassword(changePasswordDto: ChangePasswordDto, connectedUser: ConnectedUserDto) {
        const savedUser = await this.userModel.findById(connectedUser.sub);
        if (!savedUser) {
            throw new NotFoundException(`User with id ${connectedUser.sub} not found`);
        }

        const isMatchedPassword = await bcrypt.compare(changePasswordDto.oldPassword, savedUser.password);
        if (!isMatchedPassword) {
            throw new BadRequestException('The old password that you\'ve entered is incorrect');
        }

        if (changePasswordDto.newPassword !== changePasswordDto.confirmNewPassword) {
            throw new BadRequestException('The new password does not match');
        }

        const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
        // await savedUser.updateOne({ password: hashedNewPassword });
        await this.userModel
            .findByIdAndUpdate(connectedUser.sub, {password: hashedNewPassword})
            .select('-password -__v');

        const apiResponse: ApiResponseDto<null> = {
            status: HttpStatusText.SUCCESS,
            data: null,
        };
        return apiResponse;
    }

}
