import { IsBoolean, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class FolderRequestDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsInt()
  saves?: number;
}


