import { z } from 'zod';
import { flashcardResponseSchema } from '../flashcard/flashcard.schema';

// Question schema
export const questionSchema = z.object({
  flashcardId: z.string(),
  question: z.string(), // meaning
  answer: z.string(), // name (English word)
  flashcard: flashcardResponseSchema,
  options: z.array(z.string()).optional(), // For multiple choice mode: 4 options
});

export type Question = z.infer<typeof questionSchema>;

// Answer schema
export const answerSchema = z.object({
  questionIndex: z.number(),
  userAnswer: z.string(),
  isCorrect: z.boolean(),
  answeredAt: z.number(),
});

export type Answer = z.infer<typeof answerSchema>;

// Practice Session schema
export const practiceSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  folderId: z.string(),
  questions: z.array(questionSchema),
  currentIndex: z.number(),
  answers: z.array(answerSchema),
  startTime: z.number(),
  correctCount: z.number(),
  incorrectCount: z.number(),
});

export type PracticeSession = z.infer<typeof practiceSessionSchema>;

// Create session response schema
export const createSessionResponseSchema = z.object({
  sessionId: z.string(),
  questions: z.array(questionSchema),
});

export type CreateSessionResponse = z.infer<typeof createSessionResponseSchema>;

// Submit answer response schema
export const submitAnswerResponseSchema = z.object({
  isCorrect: z.boolean(),
  correctAnswer: z.string(),
  flashcard: flashcardResponseSchema,
});

export type SubmitAnswerResponse = z.infer<typeof submitAnswerResponseSchema>;

// Finish session response schema
export const finishSessionResponseSchema = z.object({
  correctCount: z.number(),
  incorrectCount: z.number(),
  totalCount: z.number(),
  duration: z.number(), // in seconds
  accuracy: z.number(), // percentage
});

export type FinishSessionResponse = z.infer<typeof finishSessionResponseSchema>;

