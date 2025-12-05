import { create } from 'zustand';
import { toast } from 'sonner';
import { z } from 'zod';
import api from '@/lib/axios';
import { 
  FlashcardResponse, 
  FlashcardRequest,
  flashcardRequestSchema,
  flashcardResponseSchema,
} from '@repo/types';

interface FlashcardState {
  flashcards: FlashcardResponse[];
  currentFlashcard: FlashcardResponse | null;
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  
  // Actions
  fetchFlashcards: (folderId?: string) => Promise<void>;
  getFlashcard: (id: string) => Promise<void>;
  createFlashcard: (flashcardRequest: FlashcardRequest) => Promise<void>;
  updateFlashcard: (id: string, flashcardRequest: FlashcardRequest) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  checkAudio: (word: string) => Promise<{ hasAudio: boolean; wordExists: boolean; audioUrl: string | null }>;
  setCurrentFlashcard: (flashcard: FlashcardResponse | null) => void;
  clearFlashcards: () => void;
}

const useFlashcardStore = create<FlashcardState>((set, get) => ({
  flashcards: [],
  currentFlashcard: null,
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,

  // Fetch all flashcards (optionally filtered by folder)
  fetchFlashcards: async (folderId?: string) => {
    set({ loading: true });
    try {
      const params = folderId ? { folder_id: folderId } : {};
      const response = await api.get('/flashcards', { params });
      const flashcards = z.array(flashcardResponseSchema).parse(response.data);
      set({ flashcards });
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải danh sách flashcard');
        console.error(error);
      }
      set({ flashcards: [] });
    } finally {
      set({ loading: false });
    }
  },

  // Get single flashcard
  getFlashcard: async (id: string) => {
    set({ loading: true });
    try {
      const response = await api.get(`/flashcards/${id}`);
      const flashcard = flashcardResponseSchema.parse(response.data);
      set({ currentFlashcard: flashcard });
      
      // Update in flashcards list if exists
      const flashcards = get().flashcards;
      const index = flashcards.findIndex(f => f.id === id);
      if (index !== -1) {
        flashcards[index] = flashcard;
        set({ flashcards });
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải flashcard');
        console.error(error);
      }
      set({ currentFlashcard: null });
    } finally {
      set({ loading: false });
    }
  },

  // Create flashcard
  createFlashcard: async (flashcardRequest: FlashcardRequest) => {
    set({ createLoading: true });
    try {
      const validatedRequest = flashcardRequestSchema.parse(flashcardRequest);
      const response = await api.post('/flashcards', validatedRequest);
      const flashcard = flashcardResponseSchema.parse(response.data);
      
      set((state) => ({
        flashcards: [flashcard, ...state.flashcards]
      }));
      
      toast.success('Tạo flashcard thành công!');
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.errors) {
        toast.error('Dữ liệu không hợp lệ');
      } else {
        toast.error('Tạo flashcard thất bại');
        console.error(error);
      }
      throw error;
    } finally {
      set({ createLoading: false });
    }
  },

  // Update flashcard
  updateFlashcard: async (id: string, flashcardRequest: FlashcardRequest) => {
    set({ updateLoading: true });
    try {
      const validatedRequest = flashcardRequestSchema.parse(flashcardRequest);
      const response = await api.patch(`/flashcards/${id}`, validatedRequest);
      const flashcard = flashcardResponseSchema.parse(response.data);
      
      set((state) => ({
        flashcards: state.flashcards.map(f => f.id === id ? flashcard : f),
        currentFlashcard: state.currentFlashcard?.id === id ? flashcard : state.currentFlashcard
      }));
      
      toast.success('Cập nhật flashcard thành công!');
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.errors) {
        toast.error('Dữ liệu không hợp lệ');
      } else {
        toast.error('Cập nhật flashcard thất bại');
        console.error(error);
      }
    } finally {
      set({ updateLoading: false });
    }
  },

  // Delete flashcard
  deleteFlashcard: async (id: string) => {
    set({ deleteLoading: true });
    try {
      await api.delete(`/flashcards/${id}`);
      
      set((state) => ({
        flashcards: state.flashcards.filter(f => f.id !== id),
        currentFlashcard: state.currentFlashcard?.id === id ? null : state.currentFlashcard
      }));
      
      toast.success('Xóa flashcard thành công!');
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Xóa flashcard thất bại');
        console.error(error);
      }
    } finally {
      set({ deleteLoading: false });
    }
  },

  // Check audio availability
  checkAudio: async (word: string) => {
    try {
      const response = await api.get(`/flashcards/check-audio/${encodeURIComponent(word.trim())}`);
      return {
        hasAudio: response.data.hasAudio,
        wordExists: response.data.wordExists,
        audioUrl: response.data.audioUrl || null,
      };
    } catch (error: any) {
      console.error('Error checking audio:', error);
      return {
        hasAudio: false,
        wordExists: false,
        audioUrl: null,
      };
    }
  },

  // Set current flashcard
  setCurrentFlashcard: (flashcard: FlashcardResponse | null) => {
    set({ currentFlashcard: flashcard });
  },

  // Clear flashcards
  clearFlashcards: () => {
    set({ flashcards: [], currentFlashcard: null });
  },
}));

export default useFlashcardStore;

