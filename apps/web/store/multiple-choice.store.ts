import { create } from 'zustand';
import api from '@/lib/axios';
import {
  Question,
  PracticeSession,
  CreateSessionResponse,
  SubmitAnswerResponse,
  FinishSessionResponse,
} from '@repo/types';

interface MultipleChoiceState {
  // Session data
  sessionId: string | null;
  questions: Question[];
  currentIndex: number;
  
  // Answer state
  isAnswered: boolean;
  isCorrect: boolean;
  selectedOption: string | null;
  
  // Stats
  correctCount: number;
  incorrectCount: number;
  
  // Status
  loading: boolean;
  submitting: boolean;
  isFinished: boolean;
  result: FinishSessionResponse | null;
  
  // Actions
  createSession: (folderId: string) => Promise<void>;
  restoreSession: (sessionId: string) => Promise<{ restored: boolean; isFinished: boolean }>;
  submitAnswer: (answer: string) => Promise<void>;
  nextQuestion: () => void;
  finishSession: () => Promise<void>;
  saveSessionId: (id: string, folderId: string) => void;
  clearSessionId: (folderId: string) => void;
  setSelectedOption: (option: string | null) => void;
  resetAnswerState: () => void;
  reset: () => void;
  restartSession: (folderId: string) => Promise<void>;
}

const useMultipleChoiceStore = create<MultipleChoiceState>((set, get) => ({
  // Initial state
  sessionId: null,
  questions: [],
  currentIndex: 0,
  isAnswered: false,
  isCorrect: false,
  selectedOption: null,
  correctCount: 0,
  incorrectCount: 0,
  loading: false,
  submitting: false,
  isFinished: false,
  result: null,

  // Save sessionId to localStorage and URL
  saveSessionId: (id: string, folderId: string) => {
    set({ sessionId: id });
    const key = `practice:multiple-choice:session:${folderId}`;
    localStorage.setItem(key, id);
    
    // Update URL
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('sessionId', id);
      window.history.replaceState({}, '', url.toString());
    }
  },

  // Clear sessionId from localStorage and URL
  clearSessionId: (folderId: string) => {
    const { sessionId } = get();
    if (sessionId) {
      localStorage.removeItem(`practice:multiple-choice:session:${sessionId}`);
    }
    localStorage.removeItem(`practice:multiple-choice:session:${folderId}`);
    
    // Update URL
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('sessionId');
      window.history.replaceState({}, '', url.toString());
    }
  },

  // Create new session
  createSession: async (folderId: string) => {
    set({ loading: true });
    try {
      // Reset all state before creating new session
      set({
        sessionId: null,
        questions: [],
        currentIndex: 0,
        isAnswered: false,
        isCorrect: false,
        selectedOption: null,
        correctCount: 0,
        incorrectCount: 0,
        isFinished: false,
        result: null,
      });

      const response = await api.post<CreateSessionResponse>('/practice/sessions', {
        folderId,
        mode: 'multiple-choice',
      });

      const { sessionId, questions } = response.data;

      set({
        sessionId,
        questions,
        currentIndex: 0,
        correctCount: 0,
        incorrectCount: 0,
        isFinished: false,
        result: null,
      });

      get().saveSessionId(sessionId, folderId);
    } catch (error: any) {
      console.error('Error creating session:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Restore session from Redis
  restoreSession: async (sessionId: string): Promise<{ restored: boolean; isFinished: boolean }> => {
    set({ loading: true });
    try {
      const response = await api.get<PracticeSession>(`/practice/sessions/${sessionId}`);
      const session = response.data;

      // Check if session is already completed
      if (session.currentIndex >= session.questions.length) {
        // Session is finished, don't restore it
        return { restored: false, isFinished: true };
      }

      // Check if this is a fill-in-the-blank session (no options)
      if (session.questions.length > 0 && !session.questions[0]?.options) {
        // This is a fill-in-the-blank session, don't restore it
        return { restored: false, isFinished: false };
      }

      // Session is not finished and is multiple-choice, restore it
      set({
        sessionId: session.id,
        questions: session.questions,
        currentIndex: session.currentIndex,
        correctCount: session.correctCount,
        incorrectCount: session.incorrectCount,
        isFinished: false,
        result: null,
      });

      return { restored: true, isFinished: false };
    } catch (error: any) {
      // Session doesn't exist or expired (404) - silently fail and create new session
      if (error.response?.status === 404) {
        console.log('Session not found or expired, will create new session');
      } else {
        console.error('Error restoring session:', error);
      }
      return { restored: false, isFinished: false };
    } finally {
      set({ loading: false });
    }
  },

  // Submit answer
  submitAnswer: async (answer: string) => {
    const { sessionId, submitting } = get();
    if (!sessionId || submitting || !answer.trim()) return;

    set({ submitting: true });
    try {
      const response = await api.post<SubmitAnswerResponse>(
        `/practice/sessions/${sessionId}/answer`,
        { answer }
      );

      const { isCorrect } = response.data;
      const { correctCount, incorrectCount } = get();

      set({
        isCorrect,
        isAnswered: true,
        correctCount: isCorrect ? correctCount + 1 : correctCount,
        incorrectCount: isCorrect ? incorrectCount : incorrectCount + 1,
      });
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      throw error;
    } finally {
      set({ submitting: false });
    }
  },

  // Move to next question
  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({
        currentIndex: currentIndex + 1,
        isAnswered: false,
        isCorrect: false,
        selectedOption: null,
      });
    }
  },

  // Finish session
  finishSession: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    try {
      const response = await api.post<FinishSessionResponse>(
        `/practice/sessions/${sessionId}/finish`
      );

      set({
        result: response.data,
        isFinished: true,
      });
    } catch (error: any) {
      console.error('Error finishing session:', error);
      throw error;
    }
  },

  // Set selected option
  setSelectedOption: (option: string | null) => {
    set({ selectedOption: option });
  },

  // Reset answer state (for next question)
  resetAnswerState: () => {
    set({
      isAnswered: false,
      isCorrect: false,
      selectedOption: null,
    });
  },

  // Reset all state
  reset: () => {
    set({
      sessionId: null,
      questions: [],
      currentIndex: 0,
      isAnswered: false,
      isCorrect: false,
      selectedOption: null,
      correctCount: 0,
      incorrectCount: 0,
      loading: false,
      submitting: false,
      isFinished: false,
      result: null,
    });
  },

  // Restart session - delete old session and create new one
  restartSession: async (folderId: string) => {
    const { sessionId } = get();
    
    // Delete old session from Redis if exists
    if (sessionId) {
      try {
        await api.post(`/practice/sessions/${sessionId}/finish`);
      } catch (error) {
        // Ignore errors (session might not exist)
        console.log('Session already deleted or not found');
      }
    }

    // Clear sessionId from localStorage and URL
    get().clearSessionId(folderId);

    // Reset state
    get().reset();

    // Create new session
    await get().createSession(folderId);
  },
}));

export default useMultipleChoiceStore;

