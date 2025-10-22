import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name: string;
  @IsOptional()
  avatar: Express.Multer.File;
}
