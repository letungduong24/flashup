import { create } from 'zustand';
import { toast } from 'sonner';
import { z } from 'zod';
import api from '@/lib/axios';
import {
  FolderResponse,
  FolderRequest,
  FolderWithFlashcards,
  folderRequestSchema,
  folderResponseSchema,
  folderWithFlashcardsSchema,
  Pagination,
} from '@/types/folder';

interface FolderFilters {
  search?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface PublicFolderFilters {
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'saves';
  sortOrder?: 'asc' | 'desc';
}

interface FolderState {
  folders: FolderResponse[];
  currentFolder: FolderWithFlashcards | null;
  pagination: Pagination | null;
  filters: FolderFilters;
  loading: boolean;
  loadingMore: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  generateLoading: boolean;
  savingLoading: boolean;

  // Public folders state
  publicFolders: FolderResponse[];
  publicPagination: Pagination | null;
  publicFilters: PublicFolderFilters;
  publicLoading: boolean;
  publicLoadingMore: boolean;

  // Actions
  fetchFolders: (resetFilters?: boolean) => Promise<void>;
  loadMoreFolders: () => Promise<void>;
  setFilters: (filters: FolderFilters) => void;
  getFolder: (id: string) => Promise<void>;
  createFolder: (folderRequest: FolderRequest) => Promise<void>;
  updateFolder: (id: string, folderRequest: FolderRequest) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  generateFolderWithFlashcards: (folderName: string) => Promise<void>;
  togglePublic: (id: string) => Promise<void>;
  getPublicFolder: (id: string) => Promise<void>;
  savePublicFolder: (id: string) => Promise<void>;
  setCurrentFolder: (folder: FolderResponse | null) => void;
  removeFlashcardFromCurrentFolder: (flashcardId: string) => void;
  clearFolders: () => void;

  // Public folders actions
  fetchPublicFolders: (resetFilters?: boolean) => Promise<void>;
  loadMorePublicFolders: () => Promise<void>;
  setPublicFilters: (filters: PublicFolderFilters) => void;
  clearPublicFolders: () => void;
}

const useFolderStore = create<FolderState>((set, get) => ({
  folders: [],
  currentFolder: null,
  pagination: null,
  filters: {},
  loading: false,
  loadingMore: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  generateLoading: false,
  savingLoading: false,

  // Public folders state
  publicFolders: [],
  publicPagination: null,
  publicFilters: {
    sortBy: 'saves',
    sortOrder: 'desc',
  },
  publicLoading: false,
  publicLoadingMore: false,

  // Set filters
  setFilters: (filters: FolderFilters) => {
    set({ filters });
  },

  // Fetch all folders
  fetchFolders: async (resetFilters = false) => {
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
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.sortBy && { sort_by: currentFilters.sortBy }),
        ...(currentFilters.sortOrder && { sort_order: currentFilters.sortOrder }),
      };

      const response = await api.get('/folders', { params });
      const folders = z.array(folderResponseSchema).parse(response.data.data);
      const pagination = response.data.pagination as Pagination;

      set({ folders, pagination });
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải danh sách folder');
        console.error(error);
      }
      set({ folders: [], pagination: null });
    } finally {
      set({ loading: false });
    }
  },

  // Load more folders (infinite scroll)
  loadMoreFolders: async () => {
    const { pagination, folders, filters, loadingMore } = get();

    if (!pagination || !pagination.hasMore || loadingMore) return;

    set({ loadingMore: true });
    try {
      const params: Record<string, any> = {
        page: pagination.page + 1,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.sortBy && { sort_by: filters.sortBy }),
        ...(filters.sortOrder && { sort_order: filters.sortOrder }),
      };

      const response = await api.get('/folders', { params });
      const newFolders = z.array(folderResponseSchema).parse(response.data.data);
      const newPagination = response.data.pagination as Pagination;

      set({
        folders: [...folders, ...newFolders],
        pagination: newPagination
      });
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải thêm folder');
        console.error(error);
      }
    } finally {
      set({ loadingMore: false });
    }
  },

  // Get single folder
  getFolder: async (id: string) => {
    set({ loading: true });
    try {
      const response = await api.get(`/folders/${id}`);
      // Parse with flashcards if included
      const folder = folderWithFlashcardsSchema.parse(response.data);
      set({ currentFolder: folder });

      // Update in folders list if exists
      const folders = get().folders;
      const index = folders.findIndex(f => f.id === id);
      if (index !== -1) {
        folders[index] = folder;
        set({ folders });
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải folder');
        console.error(error);
      }
      set({ currentFolder: null });
    } finally {
      set({ loading: false });
    }
  },

  // Create folder
  createFolder: async (folderRequest: FolderRequest) => {
    set({ createLoading: true });
    try {
      const validatedRequest = folderRequestSchema.parse(folderRequest);
      const response = await api.post('/folders', validatedRequest);
      const folder = folderResponseSchema.parse(response.data);

      set((state) => ({
        folders: [folder, ...state.folders]
      }));

      toast.success('Tạo folder thành công!');
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.errors) {
        toast.error('Dữ liệu không hợp lệ');
      } else {
        toast.error('Tạo folder thất bại');
        console.error(error);
      }
    } finally {
      set({ createLoading: false });
    }
  },

  // Update folder
  updateFolder: async (id: string, folderRequest: FolderRequest) => {
    set({ updateLoading: true });
    try {
      const validatedRequest = folderRequestSchema.parse(folderRequest);
      const response = await api.patch(`/folders/${id}`, validatedRequest);
      const folder = folderResponseSchema.parse(response.data);

      set((state) => ({
        folders: state.folders.map(f => f.id === id ? folder : f),
        currentFolder: state.currentFolder?.id === id ? folder : state.currentFolder
      }));

      toast.success('Cập nhật folder thành công!');
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.errors) {
        toast.error('Dữ liệu không hợp lệ');
      } else {
        toast.error('Cập nhật folder thất bại');
        console.error(error);
      }
    } finally {
      set({ updateLoading: false });
    }
  },

  // Delete folder
  deleteFolder: async (id: string) => {
    set({ deleteLoading: true });
    try {
      await api.delete(`/folders/${id}`);

      set((state) => ({
        folders: state.folders.filter(f => f.id !== id),
        currentFolder: state.currentFolder?.id === id ? null : state.currentFolder
      }));

      toast.success('Xóa folder thành công!');
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Xóa folder thất bại');
        console.error(error);
      }
    } finally {
      set({ deleteLoading: false });
    }
  },

  // Generate folder with flashcards using AI
  generateFolderWithFlashcards: async (folderName: string) => {
    set({ generateLoading: true });
    try {
      const response = await api.post('/folders/generate-ai', { folderName });
      const folder = folderWithFlashcardsSchema.parse(response.data);

      set((state) => ({
        folders: [folder, ...state.folders]
      }));

      toast.success(`Đã tạo bộ sưu tập "${folder.name}" với ${folder.flashcards?.length || 0} flashcard!`);
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Tạo bộ sưu tập với AI thất bại');
        console.error(error);
      }
      throw error;
    } finally {
      set({ generateLoading: false });
    }
  },

  // Toggle public status
  togglePublic: async (id: string) => {
    try {
      const response = await api.patch(`/folders/${id}/toggle-public`);
      const folder = folderResponseSchema.parse(response.data);

      set((state) => ({
        folders: state.folders.map(f => f.id === id ? folder : f),
        currentFolder: state.currentFolder?.id === id
          ? { ...state.currentFolder, ...folder }
          : state.currentFolder
      }));

      toast.success(folder.isPublic ? 'Đã chia sẻ flashbook thành công!' : 'Đã hủy chia sẻ flashbook!');
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Thay đổi trạng thái chia sẻ thất bại');
        console.error(error);
      }
      throw error;
    }
  },

  // Get public folder
  getPublicFolder: async (id: string) => {
    set({ loading: true });
    try {
      const response = await api.get(`/folders/public/${id}`);
      const folder = folderWithFlashcardsSchema.parse(response.data);
      set({ currentFolder: folder });
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải flashbook công khai');
        console.error(error);
      }
      set({ currentFolder: null });
    } finally {
      set({ loading: false });
    }
  },

  // Save public folder to user's folders
  savePublicFolder: async (id: string) => {
    set({ savingLoading: true });
    try {
      const response = await api.post(`/folders/public/${id}/save`);
      const folder = folderResponseSchema.parse(response.data);

      set((state) => ({
        folders: [folder, ...state.folders]
      }));

      toast.success('Lưu Flashbook thành công');
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Lưu flashbook thất bại');
        console.error(error);
      }
      throw error;
    } finally {
      set({ savingLoading: false });
    }
  },

  // Set current folder
  setCurrentFolder: (folder: FolderResponse | null) => {
    set({ currentFolder: folder });
  },

  // Remove flashcard from current folder
  removeFlashcardFromCurrentFolder: (flashcardId: string) => {
    set((state) => {
      if (!state.currentFolder) return state;

      return {
        currentFolder: {
          ...state.currentFolder,
          flashcards: (state.currentFolder.flashcards || []).filter(
            (f) => f.id !== flashcardId
          ),
        },
      };
    });
  },

  // Clear folders
  clearFolders: () => {
    set({ folders: [], currentFolder: null });
  },

  // Set public filters
  setPublicFilters: (filters: PublicFolderFilters) => {
    set({ publicFilters: filters });
  },

  // Fetch public folders
  fetchPublicFolders: async (resetFilters = false) => {
    const { publicFilters } = get();
    const currentFilters = resetFilters
      ? { sortBy: 'saves' as const, sortOrder: 'desc' as const }
      : publicFilters;

    if (resetFilters) {
      set({ publicFilters: { sortBy: 'saves', sortOrder: 'desc' } });
    }

    set({ publicLoading: true });
    try {
      const params: Record<string, any> = {
        page: 1,
        limit: 12,
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.sortBy && { sort_by: currentFilters.sortBy }),
        ...(currentFilters.sortOrder && { sort_order: currentFilters.sortOrder }),
      };

      const response = await api.get('/folders/public/explore', { params });
      const folders = z.array(folderResponseSchema).parse(response.data.data);
      const pagination = response.data.pagination as Pagination;

      set({ publicFolders: folders, publicPagination: pagination });
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải danh sách flashbook công khai');
        console.error(error);
      }
      set({ publicFolders: [], publicPagination: null });
    } finally {
      set({ publicLoading: false });
    }
  },

  // Load more public folders (infinite scroll)
  loadMorePublicFolders: async () => {
    const { publicPagination, publicFolders, publicFilters, publicLoadingMore } = get();

    if (!publicPagination || !publicPagination.hasMore || publicLoadingMore) return;

    set({ publicLoadingMore: true });
    try {
      const params: Record<string, any> = {
        page: publicPagination.page + 1,
        limit: publicPagination.limit,
        ...(publicFilters.search && { search: publicFilters.search }),
        ...(publicFilters.sortBy && { sort_by: publicFilters.sortBy }),
        ...(publicFilters.sortOrder && { sort_order: publicFilters.sortOrder }),
      };

      const response = await api.get('/folders/public/explore', { params });
      const newFolders = z.array(folderResponseSchema).parse(response.data.data);
      const newPagination = response.data.pagination as Pagination;

      set({
        publicFolders: [...publicFolders, ...newFolders],
        publicPagination: newPagination
      });
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải thêm flashbook công khai');
        console.error(error);
      }
    } finally {
      set({ publicLoadingMore: false });
    }
  },

  // Clear public folders
  clearPublicFolders: () => {
    set({
      publicFolders: [],
      publicPagination: null,
      publicFilters: { sortBy: 'saves', sortOrder: 'desc' }
    });
  },
}));

export default useFolderStore;

