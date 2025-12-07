import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { StudyService, StudyAction } from './study.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('study')
@UseGuards(JwtAuthGuard)
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  /**
   * Get next flashcard that needs to be studied
   * GET /study/flashcards/next?folderId=xxx
   * Returns: { flashcard: Flashcard | null, statistics: { reviewCount: number, newCount: number } }
   */
  @Get('flashcards/next')
  async getNextFlashcardToStudy(
    @Req() req: AuthenticatedRequest,
    @Query('folderId') folderId?: string,
  ) {
    const userId = req.user.id;
    const result = await this.studyService.getNextFlashcardToStudy(userId, folderId);
    return result;
  }

  /**
   * Handle study action for a flashcard
   * POST /study/flashcards/:id/answer
   * Body: { action: 'new_forgot' | 'new_good' | 'review_forgot' | 'review_hard' | 'review_normal' | 'review_easy' }
   */
  @Post('flashcards/:id/answer')
  async handleStudyAction(
    @Req() req: AuthenticatedRequest,
    @Param('id') flashcardId: string,
    @Body('action') action: StudyAction,
  ) {
    const userId = req.user.id;
    return this.studyService.handleStudyAction(userId, flashcardId, action);
  }

  /**
   * Get summary statistics for dashboard
   * GET /study/statistics/summary
   * Returns: { totalFlashcards, totalFlashbooks, newWordsCount, reviewWordsCount }
   */
  @Get('statistics/summary')
  async getSummaryStatistics(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.studyService.getSummaryStatistics(userId);
  }

  /**
   * Get daily study statistics
   * GET /study/statistics/daily?days=7&folderId=xxx
   * Returns: Array of { date: string, count: number, newCount: number, reviewCount: number }
   */
  @Get('statistics/daily')
  async getDailyStudyStatistics(
    @Req() req: AuthenticatedRequest,
    @Query('days') days?: string,
    @Query('folderId') folderId?: string,
  ) {
    const userId = req.user.id;
    const daysCount = days ? parseInt(days, 10) : 7;
    return this.studyService.getDailyStudyStatistics(userId, daysCount, folderId);
  }

  /**
   * Get folder with flashcard that needs review soonest
   * GET /study/folder/nearest-review
   * Returns: Folder with nearest review date or null
   */
  @Get('folder/nearest-review')
  async getFolderWithNearestReview(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.studyService.getFolderWithNearestReview(userId);
  }
}

