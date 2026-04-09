import { IsOptional, IsEnum, IsNotEmpty ,IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';



export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number = 5;
}