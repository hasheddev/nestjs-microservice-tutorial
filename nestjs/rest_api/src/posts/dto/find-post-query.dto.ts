import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class FindPostQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString({ message: 'title must be a string' })
  @MaxLength(100, { message: 'title search cannot exeed 100 characters' })
  title?: string;
}
