import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { type ProductStatus } from './product.schema';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'name must be a string' })
  name!: string;

  @IsNotEmpty({ message: 'description is required' })
  @IsString({ message: 'description must be a string' })
  description!: string;

  @Min(0, { message: 'Price must be a positive number' })
  @IsNumber()
  price!: number;

  @IsOptional()
  @IsString({ message: 'status must be a string' })
  status?: ProductStatus;

  @IsOptional()
  @IsString({ message: 'imageUrl must be a string' })
  imageUrl?: string;

  @IsNotEmpty({ message: 'userId is required' })
  @IsString({ message: 'userId must be a string' })
  createdByClerkUserId!: string;
}

export class GetProductByIdDto {
  @IsNotEmpty()
  @IsString()
  id!: string;
}
