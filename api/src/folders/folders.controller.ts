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
  Query,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FolderRequestDto } from './dto/folder-request.dto';

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() request, @Body() folderRequestDto: FolderRequestDto) {
    return this.foldersService.create(request.user.id, folderRequestDto);
  }

  @Get('public/explore')
  @HttpCode(HttpStatus.OK)
  findPublic(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sort_by') sortBy?: string,
    @Query('sort_order') sortOrder?: string,
  ) {
    return this.foldersService.findPublic({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
      search,
      sortBy: sortBy as 'name' | 'createdAt' | 'saves' | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    });
  }

  @Get('public/:id')
  @HttpCode(HttpStatus.OK)
  findOnePublic(@Param('id') id: string) {
    return this.foldersService.findOnePublic(id);
  }

  @Post('public/:id/save')
  @HttpCode(HttpStatus.CREATED)
  savePublicFolder(@Request() request, @Param('id') id: string) {
    return this.foldersService.savePublicFolder(request.user.id, id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Request() request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sort_by') sortBy?: string,
    @Query('sort_order') sortOrder?: string,
  ) {
    return this.foldersService.findAll(request.user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
      search,
      sortBy: sortBy as 'name' | 'createdAt' | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    });
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

  @Patch(':id/toggle-public')
  @HttpCode(HttpStatus.OK)
  togglePublic(@Request() request, @Param('id') id: string) {
    return this.foldersService.togglePublic(request.user.id, id);
  }
}
