import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UploadMediaDto {
  @ApiPropertyOptional({ example: 'products' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9/-]+$/)
  folder?: string;

  @ApiPropertyOptional({ example: 'Industrial pump side view' })
  @IsOptional()
  @IsString()
  altText?: string;
}
