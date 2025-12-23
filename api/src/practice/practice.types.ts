export interface FlashcardResponse {
  id: string;
  name: string;
  meaning: string;
  folder_id: string | null;
  review_count: number;
  audio_url: string | null;
  usage: any;
  status: string;
  interval: number;
  nextReview: Date | null;
  easeFactor: number;
  lapseCount: number;
  tags: string[];
  [key: string]: any;
}

export interface Question {
  flashcardId: string;
  question: string;
  answer: string;
  flashcard: FlashcardResponse;
  options?: string[];
}

export interface Answer {
  questionIndex: number;
  userAnswer: string;
  isCorrect: boolean;
  answeredAt: number;
}

export interface PracticeSession {
  id: string;
  userId: string;
  folderId: string;
  questions: Question[];
  currentIndex: number;
  answers: Answer[];
  startTime: number;
  correctCount: number;
  incorrectCount: number;
}

export interface CreateSessionResponse {
  sessionId: string;
  questions: Question[];
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  correctAnswer: string;
  flashcard: FlashcardResponse;
}

export interface FinishSessionResponse {
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
  duration: number;
  accuracy: number;
}


