import { IsArray, IsDateString, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class FlashcardRequestDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  meaning!: string;

  @IsOptional()
  @IsString()
  folder_id?: string | null;

  @IsOptional()
  @IsInt()
  review_count?: number;

  @IsOptional()
  @IsString()
  audio_url?: string | null;

  // usage: Json | null
  @IsOptional()
  usage?: any;

  @IsOptional()
  @IsString()
  status?: 'new' | 'review';

  @IsOptional()
  interval?: number;

  @IsOptional()
  @IsDateString()
  nextReview?: Date | null;

  @IsOptional()
  easeFactor?: number;

  @IsOptional()
  @IsInt()
  lapseCount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}


