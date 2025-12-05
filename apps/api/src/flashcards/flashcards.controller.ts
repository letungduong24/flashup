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
  Query,
} from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';
import { createZodDto } from 'nestjs-zod';
import { flashcardRequestSchema } from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

class FlashcardRequestDto extends createZodDto(flashcardRequestSchema) {}

@Controller('flashcards')
@UseGuards(JwtAuthGuard)
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() request,
    @Body() flashcardRequestDto: FlashcardRequestDto,
  ) {
    return this.flashcardsService.create(
      request.user.id,
      flashcardRequestDto.folder_id || null,
      flashcardRequestDto,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Request() request, @Query('folder_id') folderId?: string) {
    return this.flashcardsService.findAll(request.user.id, folderId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Request() request, @Param('id') id: string) {
    return this.flashcardsService.findOne(request.user.id, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Request() request,
    @Param('id') id: string,
    @Body() flashcardRequestDto: FlashcardRequestDto,
  ) {
    return this.flashcardsService.update(request.user.id, id, flashcardRequestDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Request() request, @Param('id') id: string) {
    return this.flashcardsService.remove(request.user.id, id);
  }

  @Get('check-audio/:word')
  @HttpCode(HttpStatus.OK)
  checkAudio(@Param('word') word: string) {
    return this.flashcardsService.checkAudioAvailability(word);
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  generate(
    @Request() request,
    @Body() body: { word: string; folder_id?: string },
  ) {
    return this.flashcardsService.generateFlashcard(body.word, body.folder_id);
  }
}
