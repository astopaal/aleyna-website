import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Industrial Equipment' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'industrial-equipment' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: {
      en: { name: 'Natural Stones', description: 'Natural surface categories' },
      de: { name: 'Natursteine', description: 'Natürliche Oberflächenkategorien' },
    },
  })
  @IsOptional()
  @IsObject()
  translations?: Record<string, Record<string, string>>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  parentId?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
