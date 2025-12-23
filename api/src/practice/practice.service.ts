import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { FlashcardsService } from '../flashcards/flashcards.service';
import { 
  Question, 
  PracticeSession, 
  Answer,
  CreateSessionResponse,
  SubmitAnswerResponse,
  FinishSessionResponse,
  FlashcardResponse,
} from './practice.types';
import { randomBytes } from 'crypto';

@Injectable()
export class PracticeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly flashcardsService: FlashcardsService,
  ) {}

  async createSession(userId: string, folderId: string, mode: 'fill-in-the-blank' | 'multiple-choice' = 'fill-in-the-blank'): Promise<CreateSessionResponse> {
    // Verify folder ownership
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      throw new NotFoundException('Folder không tồn tại');
    }

    if (folder.user_id !== userId && !folder.isPublic) {
      throw new ForbiddenException('Bạn không có quyền truy cập folder này');
    }

    // Fetch all flashcards from folder
    const flashcards = await this.prisma.flashcard.findMany({
      where: { folder_id: folderId },
    });

    if (flashcards.length === 0) {
      throw new NotFoundException('Folder này chưa có flashcard nào');
    }

    // Create questions array
    const questions: Question[] = flashcards.map((flashcard) => {
      const question: Question = {
        flashcardId: flashcard.id,
        question: flashcard.meaning,
        answer: flashcard.name.toLowerCase().trim(),
        flashcard: flashcard as FlashcardResponse,
      };

      // For multiple choice mode, generate 4 options (1 correct + 3 random)
      if (mode === 'multiple-choice') {
        const correctAnswer = flashcard.name;
        const otherFlashcards = flashcards.filter(f => f.id !== flashcard.id);
        
        // Get 3 random wrong answers
        const wrongAnswers = otherFlashcards
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(f => f.name);
        
        // Combine and shuffle
        const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
        question.options = allOptions;
      }

      return question;
    });

    // Shuffle questions
    const shuffled = questions.sort(() => Math.random() - 0.5);

    // Create session
    const sessionId = randomBytes(16).toString('hex');
    const session: PracticeSession = {
      id: sessionId,
      userId,
      folderId,
      questions: shuffled,
      currentIndex: 0,
      answers: [],
      startTime: Date.now(),
      correctCount: 0,
      incorrectCount: 0,
    };

    // Store in Redis with 1 hour TTL
    await this.redis.set(`practice:session:${sessionId}`, session, 3600);

    return {
      sessionId,
      questions: shuffled.map((q) => ({
        flashcardId: q.flashcardId,
        question: q.question,
        answer: q.answer,
        flashcard: q.flashcard,
        options: q.options,
      })),
    };
  }

  async getSession(sessionId: string, userId: string): Promise<PracticeSession> {
    const session = await this.redis.get<PracticeSession>(`practice:session:${sessionId}`);

    if (!session) {
      throw new NotFoundException('Session không tồn tại hoặc đã hết hạn');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập session này');
    }

    return session;
  }

  async submitAnswer(
    sessionId: string,
    userId: string,
    userAnswer: string,
  ): Promise<SubmitAnswerResponse> {
    const session = await this.getSession(sessionId, userId);

    if (session.currentIndex >= session.questions.length) {
      throw new ForbiddenException('Session đã hoàn thành');
    }

    const currentQuestion = session.questions[session.currentIndex];
    if (!currentQuestion) {
      throw new ForbiddenException('Không tìm thấy câu hỏi hiện tại');
    }

    const normalizedUserAnswer = userAnswer.toLowerCase().trim();
    const normalizedCorrectAnswer = currentQuestion.answer.toLowerCase().trim();
    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

    // Record answer
    const answer: Answer = {
      questionIndex: session.currentIndex,
      userAnswer,
      isCorrect,
      answeredAt: Date.now(),
    };

    session.answers.push(answer);
    session.currentIndex += 1;

    if (isCorrect) {
      session.correctCount += 1;
    } else {
      session.incorrectCount += 1;
    }

    // Update session in Redis
    await this.redis.set(`practice:session:${sessionId}`, session, 3600);

    return {
      isCorrect,
      correctAnswer: currentQuestion.flashcard.name,
      flashcard: currentQuestion.flashcard,
    };
  }

  async finishSession(sessionId: string, userId: string): Promise<FinishSessionResponse> {
    const session = await this.getSession(sessionId, userId);

    const duration = Math.floor((Date.now() - session.startTime) / 1000);
    const totalCount = session.questions.length;
    const accuracy = totalCount > 0 ? (session.correctCount / totalCount) * 100 : 0;

    // Delete session from Redis
    await this.redis.del(`practice:session:${sessionId}`);

    return {
      correctCount: session.correctCount,
      incorrectCount: session.incorrectCount,
      totalCount,
      duration,
      accuracy: Math.round(accuracy * 100) / 100,
    };
  }
}

