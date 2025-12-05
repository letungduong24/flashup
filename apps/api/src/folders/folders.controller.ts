import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { createZodDto } from 'nestjs-zod';
import { folderRequestSchema, folderResponseSchema } from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

class FolderRequestDto extends createZodDto(folderRequestSchema) {}

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() request, @Body() folderRequestDto: FolderRequestDto) {
    return this.foldersService.create(request.user.id, folderRequestDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Request() request) {
    return this.foldersService.findAll(request.user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Request() request, @Param('id') id: string) {
    return this.foldersService.findOne(request.user.id, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Request() request,
    @Param('id') id: string,
    @Body() folderRequestDto: FolderRequestDto,
  ) {
    return this.foldersService.update(request.user.id, id, folderRequestDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Request() request, @Param('id') id: string) {
    return this.foldersService.remove(request.user.id, id);
  }

  @Post('generate-ai')
  @HttpCode(HttpStatus.CREATED)
  generateWithAI(@Request() request, @Body('folderName') folderName: string) {
    if (!folderName || !folderName.trim()) {
      throw new BadRequestException('Tên bộ sưu tập không được để trống');
    }
    return this.foldersService.generateFolderWithFlashcards(request.user.id, folderName.trim());
  }
}
