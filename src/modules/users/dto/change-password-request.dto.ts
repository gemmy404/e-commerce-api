import {IsNotEmpty, IsString} from "class-validator";

export class ChangePasswordDto {
    @IsNotEmpty({message: 'Old password is required'})
    @IsString({message: 'Old password must be a string'})
    oldPassword: string;

    @IsNotEmpty({message: 'New password is required'})
    @IsString({message: 'New password must be a string'})
    newPassword: string;

    @IsNotEmpty({message: 'Confirm password is required'})
    @IsString({message: 'Confirm password must be a string'})
    confirmNewPassword: string;
}