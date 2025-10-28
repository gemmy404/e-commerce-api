import {IsEmail, IsNotEmpty, IsString} from "class-validator";

export class VerifyCodeRequestDto {
    @IsNotEmpty({message: 'Code is required'})
    @IsString({message: 'Code must be a string'})
    code: string;

    @IsNotEmpty({message: 'Email is required'})
    @IsEmail({}, {message: 'Email must be a valid email address'})
    email: string;
}