'use client';
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ui/shadcn-io/ai/prompt-input';
import { MicIcon, PaperclipIcon } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';
import { useDemoStore } from '../store/demo-store';
import { tokens } from '../store/demo-tokens'; 

const defaultPrompt = 'Giải thích cho tôi về Flashcard này';
const PromptInputDemo = () => {
  const store = useDemoStore();
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    store.setPrompt(defaultPrompt);
    store.setResponse('');
    store.setStatus('streaming');
    let i = 0;
    const interval = setInterval(() => {
      if (i < tokens.length) {
        store.addToken(tokens[i]);
        i++;
      } else {
        clearInterval(interval);
        store.setStatus('done');
      }
    }, 40);
  };
  return (
    <div className='w-full'>
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          value={defaultPrompt}
          readOnly
          placeholder='Nhập câu hỏi của bạn hoặc nhấn gửi để xem giải thích mẫu...'
          className='text-foreground/70'
        />
        <PromptInputToolbar className='flex justify-between items-end p-2'>
          <p className='text-sm text-foreground/70'>Gemini</p>
          <PromptInputSubmit status={'ready'} />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
};
export default PromptInputDemo;