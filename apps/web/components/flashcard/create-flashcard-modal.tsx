'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FlashcardRequest, flashcardRequestSchema } from '@repo/types';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '../ui/dialog';
import { PiStarFour } from "react-icons/pi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import useFlashcardStore from '@/store/flashcard.store';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { BackgroundGradient } from '../ui/shadcn-io/background-gradient';
import { motion } from 'framer-motion';

interface CreateFlashcardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId?: string;
  onSuccess?: () => void;
}

const CreateFlashcardModal: React.FC<CreateFlashcardModalProps> = ({
  open,
  onOpenChange,
  folderId,
  onSuccess,
}) => {
  const { createFlashcard, createLoading, checkAudio } = useFlashcardStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<FlashcardRequest>({
    resolver: zodResolver(flashcardRequestSchema) as any,
    defaultValues: {
      name: '',
      meaning: '',
      folder_id: folderId || undefined,
      usage: [],
      tags: [] as string[],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'usage',
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [audioCheck, setAudioCheck] = useState<{
    checking: boolean;
    hasAudio: boolean | null;
    wordExists: boolean | null;
  }>({ checking: false, hasAudio: null, wordExists: null });
  const [generating, setGenerating] = useState(false);

  const wordValue = watch('name');

  // Debounce check audio
  useEffect(() => {
    if (!wordValue || wordValue.trim().length < 2) {
      setAudioCheck({ checking: false, hasAudio: null, wordExists: null });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setAudioCheck({ checking: true, hasAudio: null, wordExists: null });
      try {
        const result = await checkAudio(wordValue.trim());
        setAudioCheck({ 
          checking: false, 
          hasAudio: result.hasAudio,
          wordExists: result.wordExists,
        });
      } catch (error) {
        setAudioCheck({ checking: false, hasAudio: false, wordExists: false });
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [wordValue]);

  const onSubmit = async (data: FlashcardRequest) => {
    try {
      await createFlashcard({
        ...data,
        folder_id: folderId || data.folder_id || undefined,
        tags: tags,
      });
      reset();
      setTags([]);
      setTagInput('');
      onOpenChange(false);
      // Chỉ gọi onSuccess khi tạo thành công
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error đã được xử lý trong store
    }
  };

  const handleClose = () => {
    reset();
    setTags([]);
    setTagInput('');
    setAudioCheck({ checking: false, hasAudio: null, wordExists: null });
    onOpenChange(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleGenerate = async () => {
    const word = wordValue?.trim();
    if (!word || word.length < 2) {
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/flashcards/generate', {
        word: word,
        folder_id: folderId,
      });

      const generated = response.data;

      // Fill form with generated data
      setValue('name', generated.name);
      setValue('meaning', generated.meaning);
      setValue('usage', generated.usage || []);
      setTags(generated.tags || []);

      // Check audio for the word
      if (generated.audio_url) {
        setAudioCheck({ checking: false, hasAudio: true, wordExists: true });
      } else {
        // Check audio availability
        try {
          const result = await checkAudio(word);
          setAudioCheck({
            checking: false,
            hasAudio: result.hasAudio,
            wordExists: result.wordExists,
          });
        } catch (error) {
          setAudioCheck({ checking: false, hasAudio: false, wordExists: false });
        }
      }
    } catch (error: any) {
      console.error('Error generating flashcard:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tạo flashcard tự động. Vui lòng thử lại.');
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-transparent border-0 max-h-[90vh]">
        <DialogTitle className="sr-only">Tạo flashcard mới</DialogTitle>
        <BackgroundGradient className='w-full bg-gray-100 rounded-3xl dark:bg-zinc-800 flex flex-col max-h-[85vh]' show={generating}>
          <Card className="w-full border-0 shadow-none bg-transparent flex flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0">
            <CardTitle>Tạo flashcard mới</CardTitle>
            <CardDescription>
              Tạo một flashcard mới để học từ vựng.
            </CardDescription>
          </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="name">Từ *</Label>
                    {wordValue && wordValue.trim().length >= 2 && (
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={handleGenerate}
                          disabled={generating || createLoading}
                          className="group/ai text-xs bg-gradient-to-br font-bold text-white hover:text-white from-orange-400 to-orange-600 border-0"
                        >
                          {generating ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Đang tạo...
                            </>
                          ) : (
                            <>
                              <motion.div
                                whileHover={{ scale: 1.2, rotate: 180 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              >
                                <PiStarFour className="h-3 w-3 mr-1" />
                              </motion.div>
                              Tự động tạo từ AI
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="name"
                      placeholder="Nhập từ"
                      {...register('name')}
                      aria-invalid={errors.name ? 'true' : 'false'}
                      required
                    />
                    {wordValue && wordValue.trim().length >= 2 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {audioCheck.checking ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : audioCheck.hasAudio === true ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : audioCheck.hasAudio === false ? (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {wordValue && wordValue.trim().length >= 2 && audioCheck.hasAudio !== null && (
                    <p className={`text-xs ${audioCheck.hasAudio ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {audioCheck.hasAudio 
                        ? 'Có thể lấy audio từ Cambridge Dictionary' 
                        : audioCheck.wordExists === false
                        ? 'Từ không tồn tại trong Cambridge Dictionary'
                        : 'Không có audio cho từ này'}
                    </p>
                  )}
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="meaning">Nghĩa *</Label>
                  <Textarea
                    id="meaning"
                    placeholder="Nhập nghĩa"
                    rows={3}
                    {...register('meaning')}
                    aria-invalid={errors.meaning ? 'true' : 'false'}
                    required
                  />
                  {errors.meaning && (
                    <p className="text-sm text-destructive">
                      {errors.meaning.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Cách dùng</Label>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col gap-2 p-3 border rounded-md">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm">Ví dụ {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                      <Input
                        placeholder="Note (tùy chọn)"
                        {...register(`usage.${index}.note`)}
                      />
                      <Textarea
                        placeholder="Example"
                        rows={2}
                        {...register(`usage.${index}.example`)}
                      />
                      <Input
                        placeholder="Translation (tùy chọn)"
                        {...register(`usage.${index}.translate`)}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ note: '', example: '', translate: '' })}
                  >
                    <FaPlus />
                    Thêm cách dùng
                  </Button>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Nhập tag và nhấn Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      <FaPlus />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
            <CardFooter className="flex-col gap-2 flex-shrink-0">
            <Button
              type="submit"
              className="w-full"
              onClick={handleSubmit(onSubmit)}
              disabled={createLoading}
            >
              {createLoading ? 'Đang tạo...' : 'Tạo flashcard'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleClose}
              disabled={createLoading}
            >
              Hủy
            </Button>
          </CardFooter>
        </Card>
        </BackgroundGradient>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFlashcardModal;

