import { ContentTargetType } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHeroSectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  translations?: Record<string, any>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  linkUrl?: string;

  @ApiPropertyOptional({ enum: ContentTargetType })
  @IsEnum(ContentTargetType)
  @IsOptional()
  targetType?: ContentTargetType;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  targetProductId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  targetCategoryId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  customUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  buttonText?: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  mediaId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
