import { create } from 'zustand';
import { toast } from 'sonner';
import { z } from 'zod';
import api from '@/lib/axios';
import { 
  FlashcardResponse, 
  FlashcardRequest,
  flashcardRequestSchema,
  flashcardResponseSchema,
  FlashcardFilters,
} from '@/types/flashcard';
import { Pagination } from '@/types/pagination';

type StudyAction = 
  | 'new_forgot'
  | 'new_good'
  | 'review_forgot'
  | 'review_hard'
  | 'review_normal'
  | 'review_easy';

interface StudyStatistics {
  reviewCount: number;
  newCount: number;
}

interface FlashcardState {
  flashcards: FlashcardResponse[];
  currentFlashcard: FlashcardResponse | null;
  pagination: Pagination | null;
  filters: FlashcardFilters;
  loading: boolean;
  loadingMore: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  studyLoading: boolean;
  studyStatistics: StudyStatistics | null;
  
  // Actions
  fetchFlashcards: (folderId?: string, resetFilters?: boolean) => Promise<void>;
  loadMoreFlashcards: (folderId?: string) => Promise<void>;
  setFilters: (filters: FlashcardFilters) => void;
  getFlashcard: (id: string) => Promise<void>;
  createFlashcard: (flashcardRequest: FlashcardRequest) => Promise<void>;
  updateFlashcard: (id: string, flashcardRequest: FlashcardRequest) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  checkAudio: (word: string) => Promise<{ hasAudio: boolean; wordExists: boolean; audioUrl: string | null }>;
  setCurrentFlashcard: (flashcard: FlashcardResponse | null) => void;
  clearFlashcards: () => void;
  
  // Study actions
  getNextFlashcardToStudy: (folderId?: string) => Promise<FlashcardResponse | null>;
  handleStudyAction: (flashcardId: string, action: StudyAction) => Promise<FlashcardResponse>;
}

const useFlashcardStore = create<FlashcardState>((set, get) => ({
  flashcards: [],
  currentFlashcard: null,
  pagination: null,
  filters: {},
  loading: false,
  loadingMore: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  studyLoading: false,
  studyStatistics: null,

  // Set filters
  setFilters: (filters: FlashcardFilters) => {
    set({ filters });
  },

  // Fetch all flashcards (optionally filtered by folder)
  fetchFlashcards: async (folderId?: string, resetFilters = false) => {
    const { filters } = get();
    const currentFilters = resetFilters ? {} : filters;
    
    if (resetFilters) {
      set({ filters: {} });
    }
    
    set({ loading: true });
    try {
      const params: Record<string, any> = {
        page: 1,
        limit: 12,
        ...(folderId && { folder_id: folderId }),
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.isRemembered !== undefined && { is_remembered: currentFilters.isRemembered }),
        ...(currentFilters.sortBy && { sort_by: currentFilters.sortBy }),
        ...(currentFilters.sortOrder && { sort_order: currentFilters.sortOrder }),
      };
      
      const response = await api.get('/flashcards', { params });
      const flashcards = z.array(flashcardResponseSchema).parse(response.data.data);
      const pagination = response.data.pagination as Pagination;
      
      set({ flashcards, pagination });
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải danh sách flashcard');
        console.error(error);
      }
      set({ flashcards: [], pagination: null });
    } finally {
      set({ loading: false });
    }
  },

  // Load more flashcards (infinite scroll)
  loadMoreFlashcards: async (folderId?: string) => {
    const { pagination, flashcards, filters, loadingMore } = get();
    
    if (!pagination || !pagination.hasMore || loadingMore) return;
    
    set({ loadingMore: true });
    try {
      const params: Record<string, any> = {
        page: pagination.page + 1,
        limit: pagination.limit,
        ...(folderId && { folder_id: folderId }),
        ...(filters.search && { search: filters.search }),
        ...(filters.isRemembered !== undefined && { is_remembered: filters.isRemembered }),
        ...(filters.sortBy && { sort_by: filters.sortBy }),
        ...(filters.sortOrder && { sort_order: filters.sortOrder }),
      };
      
      const response = await api.get('/flashcards', { params });
      const newFlashcards = z.array(flashcardResponseSchema).parse(response.data.data);
      const newPagination = response.data.pagination as Pagination;
      
      set({ 
        flashcards: [...flashcards, ...newFlashcards], 
        pagination: newPagination 
      });
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải thêm flashcard');
        console.error(error);
      }
    } finally {
      set({ loadingMore: false });
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

  // Get next flashcard to study
  getNextFlashcardToStudy: async (folderId?: string) => {
    set({ studyLoading: true });
    try {
      const params: Record<string, any> = {};
      if (folderId) {
        params.folderId = folderId;
      }
      
      const response = await api.get('/study/flashcards/next', { params });
      
      // Response format: { flashcard: Flashcard | null, statistics: { reviewCount: number, newCount: number } }
      const result = response.data;
      
      // Update statistics
      if (result?.statistics) {
        set({ studyStatistics: result.statistics });
      }
      
      // Nếu flashcard là null, không có flashcard nào cần học
      if (!result?.flashcard) {
        return null;
      }
      
      const flashcard = flashcardResponseSchema.parse(result.flashcard);
      return flashcard;
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải flashcard cần học');
        console.error(error);
      }
      throw error;
    } finally {
      set({ studyLoading: false });
    }
  },

  // Handle study action
  handleStudyAction: async (flashcardId: string, action: StudyAction) => {
    set({ studyLoading: true });
    try {
      const response = await api.post(`/study/flashcards/${flashcardId}/answer`, {
        action,
      });
      const updatedFlashcard = flashcardResponseSchema.parse(response.data);
      
      // Update in flashcards list if exists
      const flashcards = get().flashcards;
      const index = flashcards.findIndex(f => f.id === flashcardId);
      if (index !== -1) {
        flashcards[index] = updatedFlashcard;
        set({ flashcards });
      }
      
      // Update current flashcard if it's the same
      const currentFlashcard = get().currentFlashcard;
      if (currentFlashcard?.id === flashcardId) {
        set({ currentFlashcard: updatedFlashcard });
      }
      
      return updatedFlashcard;
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể xử lý hành động học');
        console.error(error);
      }
      throw error;
    } finally {
      set({ studyLoading: false });
    }
  },
}));

export default useFlashcardStore;

