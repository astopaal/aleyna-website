import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateProductDto, CreateProductVariantDto } from './create-product.dto';

export class UpdateProductVariantDto extends PartialType(CreateProductVariantDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({ type: [UpdateProductVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductVariantDto)
  variants?: UpdateProductVariantDto[];
}
