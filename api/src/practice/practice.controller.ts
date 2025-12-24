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
  PracticeSession,
  CreateSessionResponse,
  SubmitAnswerResponse,
  FinishSessionResponse,
} from './practice.types';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('practice')
@UseGuards(JwtAuthGuard)
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) { }

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
   * Submit a sentence for evaluation
   * POST /practice/sessions/:sessionId/evaluate-sentence
   * Body: { sentence: string }
   */
  @Post('sessions/:sessionId/evaluate-sentence')
  async evaluateSentence(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
    @Body('sentence') sentence: string,
  ): Promise<any> {
    const userId = req.user.id;
    return this.practiceService.submitSentence(sessionId, userId, sentence);
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

  /**
   * Generate session summary
   * POST /practice/sessions/:sessionId/summary
   */
  @Post('sessions/:sessionId/summary')
  async getSessionSummary(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ): Promise<{ summary: string }> {
    const userId = req.user.id;
    return this.practiceService.generateSessionSummary(sessionId, userId);
  }
}

