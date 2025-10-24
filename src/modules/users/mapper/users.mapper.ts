import { User } from '../schemas/users.schema';
import { UserResponseDto } from '../dto/user-response-dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersMapper {

  toUserResponse(user: any): UserResponseDto {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isActive: user.isActive,
      role: user.role,
    };
  }

}