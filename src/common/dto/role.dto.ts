import { IsNotEmpty } from 'class-validator';

export class RoleDto {
  @IsNotEmpty({ message: 'User role is required' })
  role: string;
}