import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {User} from '../users/schemas/users.schema';
import {Model} from 'mongoose';
import {ApiResponseDto} from '../../common/dto/api-response.dto';
import {HttpStatusText} from '../../common/utils/httpStatusText';
import {UserResponseDto} from '../users/dto/user-response-dto';
import {UsersMapper} from '../users/users.mapper';
import {UserRoles} from '../../common/utils/userRoles';
import {ConnectedUserDto} from '../../common/dto/connected-user.dto';
import {RoleDto} from '../../common/dto/role.dto';
import {StoreSetting} from "./schemas/store-settings.schema";

@Injectable()
export class AdminService {

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(StoreSetting.name) private readonly storeSettingModel: Model<StoreSetting>,
        private readonly usersMapper: UsersMapper,
    ) {
    }

    async findAllUsersByRole(role: string, size: number, page: number): Promise<ApiResponseDto<UserResponseDto[]>> {
        if (!role) {
            throw new BadRequestException('Role is required');
        }
        role = role.toUpperCase()
        if (!Object.values(UserRoles).includes(role as UserRoles)) {
            throw new NotFoundException('User role not found');
        }

        if (size < 1 || page < 1) {
            throw new BadRequestException('Size and page must be greater than 0');
        }

        const skip = (page - 1) * size;
        const users = await this.userModel
            .find({role})
            .select('-password -__v -avatar')
            .limit(size).skip(skip);

        const apiResponse: ApiResponseDto<UserResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: users.map(this.usersMapper.toUserResponse),
        };

        return apiResponse;
    }

    async changeUserRole(userId: string, roleDto: RoleDto, connectedUser: ConnectedUserDto): Promise<ApiResponseDto<UserResponseDto>> {
        if (userId === connectedUser.sub) {
            throw new ForbiddenException('You cannot change role for your account');
        }

        const role: string = roleDto.role.toUpperCase();

        if (!Object.values(UserRoles).includes(role as UserRoles)) {
            throw new NotFoundException('User role not found');
        }

        const updatedUser = await this.userModel
            .findByIdAndUpdate(userId, {role}, {new: true})
            .select('-password -__v -avatar');
        if (!updatedUser) {
            throw new NotFoundException(`User with id: ${userId} not found`);
        }

        const apiResponse: ApiResponseDto<UserResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.usersMapper.toUserResponse(updatedUser),
        };

        return apiResponse;
    }

    async toggleUserActivation(id: string, connectedUser: ConnectedUserDto): Promise<ApiResponseDto<UserResponseDto>> {
        const savedUser = await this.userModel.findById(id).select('-password -__v');
        if (!savedUser) {
            throw new NotFoundException(`User with id: ${id} not found`);
        }

        if (id === connectedUser.sub) {
            throw new ForbiddenException('You cannot deactivate your own account');
        }

        const updatedUser = await this.userModel
            .findByIdAndUpdate(id, {isActive: !savedUser.isActive}, {new: true})
            .select('-password -__v -avatar');

        const apiResponse: ApiResponseDto<UserResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.usersMapper.toUserResponse(updatedUser),
        };

        return apiResponse;
    }

    async getStoreSettings(): Promise<ApiResponseDto<{ globalDiscountPercentage: number }>> {
        let setting = await this.storeSettingModel.findOne();
        if (!setting) {
            setting = await this.storeSettingModel.create({});
        }

        const apiResponse: ApiResponseDto<{ globalDiscountPercentage: number }> = {
            status: HttpStatusText.SUCCESS,
            data: {
                globalDiscountPercentage: setting.globalDiscountPercentage,
            },
        };
        return apiResponse;
    }

    async updateGlobalDiscount(discount: number) {
        await this.storeSettingModel
            .updateOne({}, {globalDiscountPercentage: discount}, {upsert: true});

        const apiResponse: ApiResponseDto<{ globalDiscountPercentage: number }> = {
            status: HttpStatusText.SUCCESS,
            data: {
                globalDiscountPercentage: discount,
            }
        };
        return apiResponse;
    }

}
