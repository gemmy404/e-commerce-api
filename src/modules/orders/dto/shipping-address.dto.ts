import { IsNotEmpty, IsString } from 'class-validator';

export class ShippingAddressDto {
    @IsNotEmpty({ message: 'City is required' })
    @IsString({message: 'City must be a string'})
    city: string;

    @IsNotEmpty({ message: 'District is required' })
    @IsString({message: 'District must be a string'})
    district: string;

    @IsNotEmpty({ message: 'Street is required' })
    @IsString({message: 'Street must be a string'})
    street: string;
}
