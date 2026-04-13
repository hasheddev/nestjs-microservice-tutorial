import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(80, { message: 'Title cannot be more than 80 characters' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Content must be a string' })
  @MinLength(10, { message: 'Content must be at least 10 characters long' })
  content?: string;

  @IsOptional()
  @IsInt({ message: 'Author ID must be an integer' })
  authorId?: number;
}
