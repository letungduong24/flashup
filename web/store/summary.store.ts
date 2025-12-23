import { create } from 'zustand';
import { toast } from 'sonner';
import { z } from 'zod';
import api from '@/lib/axios';
import { FolderResponse, folderResponseSchema } from '@/types/folder';

interface SummaryStats {
  totalFlashcards: number;
  totalFlashbooks: number;
  newWordsCount: number;
  reviewWordsCount: number;
}

export const dailyStudyStatsSchema = z.object({
  date: z.string(),
  count: z.number().int().nonnegative(),
  newCount: z.number().int().nonnegative(),
  reviewCount: z.number().int().nonnegative(),
});

export type DailyStudyStats = z.infer<typeof dailyStudyStatsSchema>;

interface SummaryState {
  summaryStats: SummaryStats;
  loading: boolean;
  nearestReviewFolder: FolderResponse | null;
  folderMode: 'review' | 'new' | null;
  loadingNearestReview: boolean;
  dailyStats: DailyStudyStats[];
  loadingDailyStats: boolean;
  fetchSummaryStats: () => Promise<void>;
  fetchNearestReviewFolder: () => Promise<void>;
  fetchDailyStats: (days?: number) => Promise<void>;
  clearSummaryStats: () => void;
  clearNearestReviewFolder: () => void;
}

const useSummaryStore = create<SummaryState>((set) => ({
  summaryStats: {
    totalFlashcards: 0,
    totalFlashbooks: 0,
    newWordsCount: 0,
    reviewWordsCount: 0,
  },
  loading: false,
  nearestReviewFolder: null,
  folderMode: null,
  loadingNearestReview: false,
  dailyStats: [],
  loadingDailyStats: false,

  fetchSummaryStats: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/study/statistics/summary');
      set({
        summaryStats: response.data || {
          totalFlashcards: 0,
          totalFlashbooks: 0,
          newWordsCount: 0,
          reviewWordsCount: 0,
        },
      });
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải thống kê tổng quan');
        console.error(error);
      }
      set({
        summaryStats: {
          totalFlashcards: 0,
          totalFlashbooks: 0,
          newWordsCount: 0,
          reviewWordsCount: 0,
        },
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchNearestReviewFolder: async () => {
    set({ loadingNearestReview: true });
    try {
      const response = await api.get('/study/folder/nearest-review');
      if (response.data) {
        // Map backend response to FolderResponse format
        const folder = folderResponseSchema.parse({
          id: response.data.id,
          name: response.data.name,
          description: response.data.description,
          user_id: response.data.user_id,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
          newCount: response.data.newCount || 0,
          reviewCount: response.data.reviewCount || 0,
        });
        const mode = response.data.isReviewMode ? 'review' : 'new';
        set({ 
          nearestReviewFolder: folder,
          folderMode: mode,
        });
      } else {
        set({ nearestReviewFolder: null, folderMode: null });
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải flashbook tới hạn review');
        console.error(error);
      }
      set({ nearestReviewFolder: null, folderMode: null });
    } finally {
      set({ loadingNearestReview: false });
    }
  },

  clearSummaryStats: () => {
    set({
      summaryStats: {
        totalFlashcards: 0,
        totalFlashbooks: 0,
        newWordsCount: 0,
        reviewWordsCount: 0,
      },
    });
  },

  clearNearestReviewFolder: () => {
    set({ nearestReviewFolder: null, folderMode: null });
  },

  fetchDailyStats: async (days: number = 7) => {
    set({ loadingDailyStats: true });
    try {
      const response = await api.get('/study/statistics/daily', {
        params: { days },
      });
      const dailyStats = z.array(dailyStudyStatsSchema).parse(response.data || []);
      set({ dailyStats });
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải thống kê hàng ngày');
        console.error(error);
      }
      set({ dailyStats: [] });
    } finally {
      set({ loadingDailyStats: false });
    }
  },
}));

export default useSummaryStore;

