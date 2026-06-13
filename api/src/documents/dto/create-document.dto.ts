import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({ example: 'Product Brochure' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'product-brochure' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: {
      en: { title: 'Catalog', description: 'Product catalog' },
      de: { title: 'Katalog', description: 'Produktkatalog' },
    },
  })
  @IsOptional()
  @IsObject()
  translations?: Record<string, Record<string, string>>;

  @ApiProperty()
  @IsUUID('4')
  mediaId: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
