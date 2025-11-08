import {
    Body,
    Controller,
    Get,
    ParseFilePipe,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {UsersService} from './users.service';
import {UpdateUserDto} from './dto/update-user.dto';
import {AuthGuard} from '../auth/guard/auth.guard';
import {ConnectedUser} from "../auth/decorators/connected-user.decorator";
import type {ConnectedUserDto} from "../../common/dto/connected-user.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {ApiResponseDto} from "../../common/dto/api-response.dto";
import {UserResponseDto} from "./dto/user-response-dto";
import {createMulterStorage} from "../../common/utils/multer-storage";
import {ChangePasswordDto} from "./dto/change-password-request.dto";

@Controller('api/v1/users')
@UseGuards(AuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {
    }

    @Get('profile')
    getUserProfile(@ConnectedUser() connectedUser: ConnectedUserDto): Promise<ApiResponseDto<UserResponseDto>> {
        return this.usersService.getUserProfile(connectedUser);
    }

    @Patch('profile')
    updateProfile(
        @Body() updateUserDto: UpdateUserDto,
        @ConnectedUser() connectedUser: ConnectedUserDto
    ): Promise<ApiResponseDto<UserResponseDto>> {
        return this.usersService.updateProfile(updateUserDto, connectedUser);
    }

    @Post('profile-picture')
    @UseInterceptors(FileInterceptor('file', {storage: createMulterStorage()}))
    uploadProfilePicture(
        @UploadedFile(new ParseFilePipe({fileIsRequired: true})) file: Express.Multer.File,
        @ConnectedUser() connectedUser: ConnectedUserDto
    ): Promise<ApiResponseDto<UserResponseDto>> {
        return this.usersService.uploadProfilePicture(file, connectedUser);
    }

    @Patch('change-password')
    changePassword(@Body() changePasswordDto: ChangePasswordDto, @ConnectedUser() connectedUser: ConnectedUserDto) {
        return this.usersService.changePassword(changePasswordDto, connectedUser);
    }

}
