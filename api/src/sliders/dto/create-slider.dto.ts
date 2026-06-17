import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentTargetType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsObject, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

class SliderTranslationDto {
  @ApiPropertyOptional({ example: 'Premium natural stone' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Discover architectural surfaces' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional({ example: 'Explore Collection' })
  @IsOptional()
  @IsString()
  buttonText?: string;
}

class SliderTranslationsDto {
  @ApiPropertyOptional({ type: SliderTranslationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SliderTranslationDto)
  tr?: SliderTranslationDto;

  @ApiPropertyOptional({ type: SliderTranslationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SliderTranslationDto)
  en?: SliderTranslationDto;

  @ApiPropertyOptional({ type: SliderTranslationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SliderTranslationDto)
  de?: SliderTranslationDto;
}

export class CreateSliderDto {
  @ApiProperty({ example: 'Corporate solutions' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional({ enum: ContentTargetType })
  @IsOptional()
  @IsEnum(ContentTargetType)
  targetType?: ContentTargetType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  targetProductId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  targetCategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buttonText?: string;

  @ApiPropertyOptional({ type: SliderTranslationsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SliderTranslationsDto)
  translations?: SliderTranslationsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  mediaId?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
