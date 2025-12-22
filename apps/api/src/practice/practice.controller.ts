import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PracticeService } from './practice.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { 
  Question, 
  PracticeSession,
  CreateSessionResponse,
  SubmitAnswerResponse,
  FinishSessionResponse,
} from '@repo/types';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('practice')
@UseGuards(JwtAuthGuard)
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  /**
   * Create a new practice session
   * POST /practice/sessions
   * Body: { folderId: string }
   * Returns: { sessionId: string, questions: Question[] }
   */
  @Post('sessions')
  async createSession(
    @Req() req: AuthenticatedRequest,
    @Body('folderId') folderId: string,
    @Body('mode') mode?: 'fill-in-the-blank' | 'multiple-choice',
  ): Promise<CreateSessionResponse> {
    const userId = req.user.id;
    return this.practiceService.createSession(userId, folderId, mode || 'fill-in-the-blank');
  }

  /**
   * Get session information
   * GET /practice/sessions/:sessionId
   * Returns: PracticeSession
   */
  @Get('sessions/:sessionId')
  async getSession(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ): Promise<PracticeSession> {
    const userId = req.user.id;
    return this.practiceService.getSession(sessionId, userId);
  }

  /**
   * Submit an answer
   * POST /practice/sessions/:sessionId/answer
   * Body: { answer: string }
   * Returns: { isCorrect: boolean, correctAnswer: string, flashcard: FlashcardResponse }
   */
  @Post('sessions/:sessionId/answer')
  async submitAnswer(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
    @Body('answer') answer: string,
  ): Promise<SubmitAnswerResponse> {
    const userId = req.user.id;
    return this.practiceService.submitAnswer(sessionId, userId, answer);
  }

  /**
   * Finish a practice session
   * POST /practice/sessions/:sessionId/finish
   * Returns: { correctCount, incorrectCount, totalCount, duration, accuracy }
   */
  @Post('sessions/:sessionId/finish')
  async finishSession(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ): Promise<FinishSessionResponse> {
    const userId = req.user.id;
    return this.practiceService.finishSession(sessionId, userId);
  }
}

