import { Module } from '@nestjs/common';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { FlashcardsModule } from '../flashcards/flashcards.module';

import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [PrismaModule, RedisModule, FlashcardsModule, GeminiModule],
  controllers: [PracticeController],
  providers: [PracticeService],
  exports: [PracticeService],
})
export class PracticeModule { }

