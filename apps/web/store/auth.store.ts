import { create } from 'zustand';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { 
  UserResponse, 
  SignInRequest, 
  SignUpRequest,
  signInRequestSchema,
  signUpRequestSchema,
  userResponseSchema 
} from '@repo/types';

interface AuthState {
    user: UserResponse | null
    loading: boolean
    signInLoading: boolean
    signUpLoading: boolean
    signOutLoading: boolean
    checkAuth: () => Promise<void>
    signout: () => Promise<void>
    signin: (credentials: SignInRequest) => Promise<void>
    signup: (credentials: SignUpRequest) => Promise<void>
}

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    signInLoading: false,
    signUpLoading: false,
    signOutLoading: false,

    checkAuth: async () => {
        try {
            const response = await api.get('/auth/me');
            // Validate response với userResponseSchema (không có password)
            // Đảm bảo data từ API đúng format và TypeScript biết chính xác type
            const user = userResponseSchema.parse(response.data);
            set({ user });
        } catch (error: any) {
            if(error.response?.data?.user){
                try {
                    const user = userResponseSchema.parse(error.response.data.user);
                    set({ user });
                } catch {
                    set({ user: null });
                }
            } else {
                set({ user: null });
            }
        } finally {
            set({ loading: false });
        }
    },

    // Sign in
    signin: async (credentials: SignInRequest) => {
        set({signInLoading: true})
        try {
            // Validate input trước khi gửi API
            const validatedCredentials = signInRequestSchema.parse(credentials);
            const response = await api.post('/auth/login', validatedCredentials)
            // Validate response với userResponseSchema (không có password)
            // Đảm bảo data từ API đúng format và TypeScript biết chính xác type
            const user = userResponseSchema.parse(response.data);
            set({ user });
            toast.success('Đăng nhập thành công!')
        } catch (error: any) {
            set({ user: null });
            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else if (error.errors) {
                // Zod validation errors
                toast.error('Dữ liệu không hợp lệ')
            } else {
                toast.error('Đăng nhập thất bại')
            }
        } finally{
            set({signInLoading: false})
        }
    },

    // Sign up
    signup: async (credentials: SignUpRequest) => {
        set({signUpLoading: true})
        try {
            // Validate input trước khi gửi API
            const validatedCredentials = signUpRequestSchema.parse(credentials);
            const response = await api.post('/auth/register', validatedCredentials)
            // Validate response với userResponseSchema (không có password)
            // Đảm bảo data từ API đúng format và TypeScript biết chính xác type
            const user = userResponseSchema.parse(response.data);
            set({ user });
            toast.success('Đăng ký thành công!')
        } catch (error: any) {
            set({ user: null });
            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else if (error.errors) {
                // Zod validation errors
                toast.error('Dữ liệu không hợp lệ')
            } else {
                toast.error('Đăng ký thất bại')
            }
        } finally{
            set({signUpLoading: false})
        }
    },

    // Sign out
    signout: async () => {
        set({ signOutLoading: true })
        try {
            await api.post('/auth/logout');
            set({ user: null});
            toast.success('Đăng xuất thành công!')
        } catch (error: any) {
            toast.error(error.response.data.message)
        } finally {
            set({ signOutLoading: false })
        }
    },
}));

export default useAuthStore; 