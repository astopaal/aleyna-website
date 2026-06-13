import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Industrial Pump X120' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'industrial-pump-x120' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: {
      en: { name: 'Culture Stone', description: 'Architectural wall surface' },
      de: { name: 'Kulturstein', description: 'Architektonische Wandoberfläche' },
    },
  })
  @IsOptional()
  @IsObject()
  translations?: Record<string, Record<string, string>>;

  @ApiProperty({ example: 25 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 149999, description: 'Price in minor units' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceCents: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  categoryIds: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  imageIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  isFeatured?: boolean;
}
