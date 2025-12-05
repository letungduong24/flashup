import { create } from 'zustand';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { 
  FolderResponse, 
  FolderRequest,
  FolderWithFlashcards,
  folderRequestSchema,
  folderResponseSchema,
  folderWithFlashcardsSchema
} from '@repo/types';

interface FolderState {
  folders: FolderResponse[];
  currentFolder: FolderWithFlashcards | null;
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  generateLoading: boolean;
  
  // Actions
  fetchFolders: () => Promise<void>;
  getFolder: (id: string) => Promise<void>;
  createFolder: (folderRequest: FolderRequest) => Promise<void>;
  updateFolder: (id: string, folderRequest: FolderRequest) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  generateFolderWithFlashcards: (folderName: string) => Promise<void>;
  setCurrentFolder: (folder: FolderResponse | null) => void;
  removeFlashcardFromCurrentFolder: (flashcardId: string) => void;
  clearFolders: () => void;
}

const useFolderStore = create<FolderState>((set, get) => ({
  folders: [],
  currentFolder: null,
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  generateLoading: false,

  // Fetch all folders
  fetchFolders: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/folders');
      const folders = response.data.map((folder: any) => 
        folderResponseSchema.parse(folder)
      );
      set({ folders });
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tải danh sách folder');
        console.error(error);
      }
      set({ folders: [] });
    } finally {
      set({ loading: false });
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
}));

export default useFolderStore;

