import { Module } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  controllers: [FoldersController],
  providers: [FoldersService],
  imports: [PrismaModule, GeminiModule],
  exports: [FoldersService],
})
export class FoldersModule {}
