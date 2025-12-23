import { create } from 'zustand';

interface DemoStoreState {
  prompt: string;
  response: string;
  status: 'idle' | 'streaming' | 'done';
  setPrompt: (prompt: string) => void;
  setStatus: (status: 'idle' | 'streaming' | 'done') => void;
  setResponse: (response: string) => void;
  addToken: (token: string) => void;
  clear: () => void;
}

export const useDemoStore = create<DemoStoreState>((set) => ({
  prompt: '',
  response: '',
  status: 'idle',
  setPrompt: (prompt) => set({ prompt }),
  setStatus: (status) => set({ status }),
  setResponse: (response) => set({ response }),
  addToken: (token) => set((state) => ({ response: state.response + token })),
  clear: () => set({ prompt: '', response: '', status: 'idle' }),
}));
