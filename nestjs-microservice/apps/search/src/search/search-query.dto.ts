import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SearchQueryDto {
  @IsString({ message: 'productId must be a string' })
  q!: string;

  @IsOptional()
  @Min(1)
  @IsInt({ message: 'imageUrl must be a string' })
  limit?: number;
}
