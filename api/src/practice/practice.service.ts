import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FlashcardsService } from '../flashcards/flashcards.service';
import { GeminiService } from '../gemini/gemini.service';
import { Prisma } from '../generated/client';
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
    private readonly flashcardsService: FlashcardsService,
    private readonly geminiService: GeminiService,
  ) { }

  async submitSentence(
    sessionId: string,
    userId: string,
    sentence: string,
  ): Promise<any> {
    const session = await this.getSession(sessionId, userId);

    if (session.currentIndex >= session.questions.length) {
      throw new ForbiddenException('Session đã hoàn thành');
    }

    const currentQuestion = session.questions[session.currentIndex];
    if (!currentQuestion) {
      throw new ForbiddenException('Không tìm thấy câu hỏi hiện tại');
    }

    const targetWord = currentQuestion.flashcard.name;

    let evaluation;
    let evaluationFailed = false;

    try {
      evaluation = await this.geminiService.evaluateSentence(targetWord, sentence);
    } catch (error) {
      console.error('AI evaluation failed, returning error status:', error);
      evaluationFailed = true;
      // Return a special error status that frontend can handle
      evaluation = {
        status: 'evaluation-error' as any,
        suggestion: '',
        suggestionTranslation: '',
        explanation: 'Có vẻ câu trả lời của bạn không hợp lệ! Bạn có muốn thử lại không?',
        wordUsageExplanation: '',
        errorTag: null,
      };
    }

    // Save to DB regardless of evaluation success/failure
    // For evaluation errors, mark as incorrect
    const isCorrect = evaluationFailed ? false : (evaluation.status === 'correct' || evaluation.status === 'suggestion');

    // Save answer to DB
    await this.prisma.practiceSessionAnswer.create({
      data: {
        sessionId: session.id,
        questionId: typeof currentQuestion.id === 'string' ? currentQuestion.id : '',
        userAnswer: sentence,
        isCorrect,
        evaluation: evaluation as any,
        answeredAt: new Date(),
      }
    });

    // Update session progress
    await this.prisma.practiceSession.update({
      where: { id: sessionId },
      data: {
        currentIndex: session.currentIndex + 1,
        correctCount: isCorrect ? session.correctCount + 1 : session.correctCount,
        incorrectCount: !isCorrect ? session.incorrectCount + 1 : session.incorrectCount,
      }
    });

    // Map to response format
    const responseEvaluation = {
      status: evaluation.status,
      suggestion: evaluation.suggestion,
      suggestionTranslation: evaluation.suggestionTranslation,
      explanation: evaluation.explanation,
      wordUsageExplanation: evaluation.wordUsageExplanation,
      errorTag: evaluation.errorTag,
      correction: evaluation.suggestion,
      tip: evaluation.explanation
    };

    return {
      evaluation: responseEvaluation,
      flashcard: currentQuestion.flashcard,
      evaluationFailed, // Add flag to indicate error
    };
  }

  async createSession(userId: string, folderId: string, mode: 'fill-in-the-blank' | 'multiple-choice' | 'sentence' = 'fill-in-the-blank'): Promise<CreateSessionResponse> {
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

    // Check for existing IN_PROGRESS session
    const existingSession = await this.prisma.practiceSession.findFirst({
      where: {
        userId,
        folderId,
        mode,
        status: 'IN_PROGRESS',
      },
      include: {
        questions: {
          include: {
            flashcard: true,
          },
          orderBy: {
            order: 'asc',
          }
        },
        answers: true,
      }
    });

    if (existingSession) {
      // Check version mismatch
      const isOutdated = existingSession.folderVersion !== folder.version;

      // Map questions to PracticeSession format
      const questions: Question[] = existingSession.questions.map(q => ({
        flashcardId: q.flashcardId,
        question: q.question,
        answer: q.answer,
        flashcard: q.flashcard as unknown as FlashcardResponse,
        options: q.options as string[] || undefined,
        id: q.id, // Keep internal ID
      }));

      return {
        sessionId: existingSession.id,
        questions,
        isOutdated,
      };
    }

    // Create new session
    // Fetch all flashcards from folder
    const flashcards = await this.prisma.flashcard.findMany({
      where: { folder_id: folderId },
    });

    if (flashcards.length === 0) {
      throw new NotFoundException('Folder này chưa có flashcard nào');
    }

    // Create questions array (randomized)
    const shuffledFlashcards = [...flashcards].sort(() => Math.random() - 0.5);

    // Begin transaction to create session and questions
    const session = await this.prisma.$transaction(async (tx) => {
      const newSession = await tx.practiceSession.create({
        data: {
          userId,
          folderId,
          mode,
          folderVersion: folder.version,
          status: 'IN_PROGRESS',
        }
      });

      const questionsData = shuffledFlashcards.map((flashcard, index) => {
        let options: string[] | undefined;

        // For multiple choice mode, generate 4 options
        if (mode === 'multiple-choice') {
          const correctAnswer = flashcard.name;
          const otherFlashcards = flashcards.filter(f => f.id !== flashcard.id);
          const wrongAnswers = otherFlashcards
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(f => f.name);
          options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
        }

        return {
          sessionId: newSession.id,
          flashcardId: flashcard.id,
          question: flashcard.meaning,
          answer: flashcard.name.toLowerCase().trim(),
          options: options ? options : Prisma.JsonNull,
          order: index,
        };
      });

      await tx.practiceSessionQuestion.createMany({
        data: questionsData,
      });

      // Fetch created questions to return ID and structure
      const createdQuestions = await tx.practiceSessionQuestion.findMany({
        where: { sessionId: newSession.id },
        include: { flashcard: true },
        orderBy: { order: 'asc' },
      });

      return { ...newSession, questions: createdQuestions };
    });

    return {
      sessionId: session.id,
      questions: session.questions.map((q) => ({
        flashcardId: q.flashcardId,
        question: q.question,
        answer: q.answer,
        flashcard: q.flashcard as unknown as FlashcardResponse,
        options: q.options as string[] || undefined,
        id: q.id, // include DB ID
      })),
      isOutdated: false,
    };
  }

  async getSession(sessionId: string, userId: string): Promise<PracticeSession> {
    const session = await this.prisma.practiceSession.findUnique({
      where: { id: sessionId },
      include: {
        folder: true,
        questions: {
          include: { flashcard: true },
          orderBy: { order: 'asc' },
        },
        answers: {
          orderBy: { answeredAt: 'asc' },
        }
      }
    });

    if (!session) {
      throw new NotFoundException('Session không tồn tại');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập session này');
    }

    // Check version mismatch
    const isOutdated = session.folderVersion !== session.folder.version;

    // Map to PracticeSession type
    return {
      id: session.id,
      userId: session.userId,
      folderId: session.folderId,
      questions: session.questions.map(q => ({
        flashcardId: q.flashcardId,
        question: q.question,
        answer: q.answer,
        flashcard: q.flashcard as unknown as FlashcardResponse,
        options: q.options as string[] || undefined,
        id: q.id,
      })),
      currentIndex: session.currentIndex,
      answers: session.answers.map(a => ({
        questionIndex: session.questions.findIndex(q => q.id === a.questionId), // Find index based on ID link
        userAnswer: a.userAnswer,
        isCorrect: a.isCorrect,
        answeredAt: a.answeredAt.getTime(),
      })).sort((a, b) => a.questionIndex - b.questionIndex), // Sort by question index
      startTime: session.startTime.getTime(),
      correctCount: session.correctCount,
      incorrectCount: session.incorrectCount,
      isOutdated,
    };
  }

  async submitAnswer(
    sessionId: string,
    userId: string,
    userAnswer: string,
  ): Promise<SubmitAnswerResponse> {
    const session = await this.getSession(sessionId, userId); // This gets mapped session

    if (session.currentIndex >= session.questions.length) {
      throw new ForbiddenException('Session đã hoàn thành');
    }

    // Need raw session for DB updates, but we can just update by ID
    // getCurrent question from mapped session
    const currentQuestion = session.questions[session.currentIndex];

    // We need the DB question ID.
    // In our map above, we added 'id' to Question interface (we need to update types).
    // Or we fetch from DB again.
    // Let's assume we update Question type to include ID or we fetch it properly.

    // Re-fetch proper DB question ID
    const dbQuestion = await this.prisma.practiceSessionQuestion.findFirst({
      where: {
        sessionId: sessionId,
        order: session.currentIndex
      },
      include: { flashcard: true }
    });

    if (!dbQuestion) {
      throw new NotFoundException('Không tìm thấy câu hỏi hiện tại');
    }

    const normalizedUserAnswer = userAnswer.toLowerCase().trim();
    const normalizedCorrectAnswer = dbQuestion.answer.toLowerCase().trim();
    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

    // Save answer
    await this.prisma.practiceSessionAnswer.create({
      data: {
        sessionId,
        questionId: dbQuestion.id,
        userAnswer,
        isCorrect,
        answeredAt: new Date(),
      }
    });

    // Update session
    await this.prisma.practiceSession.update({
      where: { id: sessionId },
      data: {
        currentIndex: session.currentIndex + 1,
        correctCount: isCorrect ? session.correctCount + 1 : session.correctCount,
        incorrectCount: !isCorrect ? session.incorrectCount + 1 : session.incorrectCount,
      }
    });

    return {
      isCorrect,
      correctAnswer: dbQuestion.flashcard.name,
      flashcard: dbQuestion.flashcard as unknown as FlashcardResponse,
    };
  }

  async finishSession(sessionId: string, userId: string): Promise<FinishSessionResponse> {
    const sessionDoc = await this.prisma.practiceSession.findUnique({
      where: { id: sessionId }
    });

    if (!sessionDoc) throw new NotFoundException("Session not found");
    if (sessionDoc.userId !== userId) throw new ForbiddenException("Access denied");

    // Calculate stats
    const duration = Math.floor((Date.now() - sessionDoc.startTime.getTime()) / 1000);
    const totalCount = sessionDoc.correctCount + sessionDoc.incorrectCount; // accurate based on progress
    const accuracy = totalCount > 0 ? (sessionDoc.correctCount / totalCount) * 100 : 0;

    // Delete session from DB (Cascade delete will handle associated questions/answers)
    await this.prisma.practiceSession.delete({
      where: { id: sessionId },
    });

    return {
      correctCount: sessionDoc.correctCount,
      incorrectCount: sessionDoc.incorrectCount,
      totalCount,
      duration,
      accuracy: Math.round(accuracy * 100) / 100,
    };
  }

  async generateSessionSummary(sessionId: string, userId: string): Promise<{ summary: string }> {
    // Fetch full history from DB
    const answers = await this.prisma.practiceSessionAnswer.findMany({
      where: { sessionId },
      include: {
        question: {
          include: { flashcard: true }
        }
      },
      orderBy: { answeredAt: 'asc' }
    });

    // Filter questions that have answers
    const history = answers.map(answer => {
      return {
        word: answer.question.flashcard.name,
        userSentence: answer.userAnswer,
        evaluation: {
          status: answer.isCorrect ? 'correct' : 'wrong',
          // If we stored detailed evaluation in JSON, we could use it here:
          // ... (answer.evaluation as any)
        }
      };
    });

    const summary = await this.geminiService.summarizeSession(history);

    // Store summary in DB
    await this.prisma.practiceSession.update({
      where: { id: sessionId },
      data: { summary }
    });

    return { summary };
  }
}

