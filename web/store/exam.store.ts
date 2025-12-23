import { create } from 'zustand';
import { toast } from 'sonner';
import api from '@/lib/axios';
import {
  ExamResponse,
  ExamRequest,
  examRequestSchema,
  examResponseSchema,
} from '@/types/exam';
import { z } from 'zod';

interface ExamState {
  exams: ExamResponse[];
  currentExam: ExamResponse | null;
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;

  // Actions
  fetchExams: (isActive?: boolean) => Promise<void>;
  getExam: (id: string) => Promise<void>;
  createExam: (examRequest: ExamRequest) => Promise<ExamResponse>;
  updateExam: (id: string, examRequest: ExamRequest) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  setCurrentExam: (exam: ExamResponse | null) => void;
  clearExams: () => void;
}

const useExamStore = create<ExamState>((set, get) => ({
  exams: [],
  currentExam: null,
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,

  // Fetch all exams
  fetchExams: async (isActive?: boolean) => {
    set({ loading: true });
    try {
      const params: Record<string, any> = {};
      if (isActive !== undefined) {
        params.isActive = isActive;
      }
      
      const response = await api.get('/exams', { params });
      const exams = z.array(examResponseSchema).parse(response.data);
      set({ exams });
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải danh sách đề thi');
        console.error(error);
      }
      set({ exams: [] });
    } finally {
      set({ loading: false });
    }
  },

  // Get single exam
  getExam: async (id: string) => {
    set({ loading: true });
    try {
      const response = await api.get(`/exams/${id}`);
      const exam = examResponseSchema.parse(response.data);
      set({ currentExam: exam });
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải đề thi');
        console.error(error);
      }
      set({ currentExam: null });
    } finally {
      set({ loading: false });
    }
  },

  // Create exam
  createExam: async (examRequest: ExamRequest) => {
    set({ createLoading: true });
    try {
      const validatedRequest = examRequestSchema.parse(examRequest);
      const response = await api.post('/exams', validatedRequest);
      const exam = examResponseSchema.parse(response.data);
      
      set((state) => ({
        exams: [exam, ...state.exams]
      }));
      
      toast.success('Tạo đề thi thành công!');
      return exam;
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.errors) {
        toast.error('Dữ liệu không hợp lệ');
      } else {
        toast.error('Tạo đề thi thất bại');
        console.error(error);
      }
      throw error;
    } finally {
      set({ createLoading: false });
    }
  },

  // Update exam
  updateExam: async (id: string, examRequest: ExamRequest) => {
    set({ updateLoading: true });
    try {
      const validatedRequest = examRequestSchema.parse(examRequest);
      const response = await api.patch(`/exams/${id}`, validatedRequest);
      const exam = examResponseSchema.parse(response.data);
      
      set((state) => ({
        exams: state.exams.map(e => e.id === id ? exam : e),
        currentExam: state.currentExam?.id === id ? exam : state.currentExam
      }));
      
      toast.success('Cập nhật đề thi thành công!');
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.errors) {
        toast.error('Dữ liệu không hợp lệ');
      } else {
        toast.error('Cập nhật đề thi thất bại');
        console.error(error);
      }
      throw error;
    } finally {
      set({ updateLoading: false });
    }
  },

  // Delete exam
  deleteExam: async (id: string) => {
    set({ deleteLoading: true });
    try {
      await api.delete(`/exams/${id}`);
      
      set((state) => ({
        exams: state.exams.filter(e => e.id !== id),
        currentExam: state.currentExam?.id === id ? null : state.currentExam
      }));
      
      toast.success('Xóa đề thi thành công!');
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Xóa đề thi thất bại');
        console.error(error);
      }
      throw error;
    } finally {
      set({ deleteLoading: false });
    }
  },

  // Set current exam
  setCurrentExam: (exam: ExamResponse | null) => {
    set({ currentExam: exam });
  },

  // Clear exams
  clearExams: () => {
    set({ exams: [], currentExam: null });
  },
}));

export default useExamStore;

