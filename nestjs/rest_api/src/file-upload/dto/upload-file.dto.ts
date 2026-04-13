import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadFiledDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
