import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ProductCreatedDto {
  // Exec order: IsString -> IsNotEmpty
  @IsNotEmpty()
  @IsString({ message: 'productId must be a string' })
  productId!: string;

  @IsNotEmpty()
  @IsString({ message: 'name must be a string' })
  name!: string;

  @IsNotEmpty()
  @IsString({ message: 'description must be a string' })
  description!: string;

  @IsIn(['Draft', 'Active'])
  @IsString({ message: 'status must be a string' })
  status!: 'Draft' | 'Active';

  @Min(0)
  @IsNumber()
  price!: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString({ message: 'imageUrl must be a string' })
  imageUrl?: string;

  @IsNotEmpty()
  @IsString({ message: 'userId must be a string' })
  createdByClerkUserId!: string;
}

export class ProductDeletedDto {
  @IsNotEmpty()
  @IsString({ message: 'productId must be a string' })
  productId!: string;
  @IsNotEmpty()
  @IsString({ message: 'userId must be a string' })
  createdByClerkUserId!: string;
}
