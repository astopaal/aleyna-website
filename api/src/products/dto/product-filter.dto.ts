import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ProductFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'industrial-equipment' })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({ example: 'tr' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  isFeatured?: string | boolean;
}
