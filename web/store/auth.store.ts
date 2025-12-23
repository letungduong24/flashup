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
} from '@/types/auth';

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
            const validatedCredentials = signInRequestSchema.parse(credentials);
            const response = await api.post('/auth/login', validatedCredentials)
            const user = userResponseSchema.parse(response.data);
            set({ user });
            toast.success('Đăng nhập thành công!')
        } catch (error: any) {
            set({ user: null });
            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
                throw new Error(error.response.data.message)
            } else if (error.errors) {
                toast.error('Dữ liệu không hợp lệ')
            } else {
                toast.error('Đăng nhập thất bại')
                console.error(error);
            }
        } finally{
            set({signInLoading: false})
        }
    },

    // Sign up
    signup: async (credentials: SignUpRequest) => {
        set({signUpLoading: true})
        try {
            const validatedCredentials = signUpRequestSchema.parse(credentials);
            const response = await api.post('/auth/signup', validatedCredentials)
            const user = userResponseSchema.parse(response.data);
            set({ user });
            toast.success('Đăng ký thành công!')
        } catch (error: any) {
            set({ user: null });
            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else if (error.errors) {
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