'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FlashcardRequest, flashcardRequestSchema, FlashcardResponse } from '@repo/types';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '../ui/dialog';
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
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

interface EditFlashcardModalProps {
  flashcard: FlashcardResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EditFlashcardModal: React.FC<EditFlashcardModalProps> = ({
  flashcard,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { updateFlashcard, updateLoading } = useFlashcardStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<FlashcardRequest>({
    resolver: zodResolver(flashcardRequestSchema),
    defaultValues: {
      name: '',
      meaning: '',
      folder_id: undefined,
      usage: [],
      tags: [],
      is_remembered: false,
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

  const wordValue = watch('name');

  // Load flashcard data vào form khi mở modal
  useEffect(() => {
    if (flashcard && open) {
      reset({
        name: flashcard.name,
        meaning: flashcard.meaning,
        folder_id: flashcard.folder_id || undefined,
        usage: flashcard.usage || [],
        tags: flashcard.tags || [],
        is_remembered: flashcard.is_remembered,
      });
      setTags(flashcard.tags || []);
      setAudioCheck({ checking: false, hasAudio: null, wordExists: null });
    }
  }, [flashcard, open, reset]);

  // Debounce check audio
  useEffect(() => {
    if (!wordValue || wordValue.trim().length < 2) {
      setAudioCheck({ checking: false, hasAudio: null, wordExists: null });
      return;
    }

    // Không check nếu từ giống với từ ban đầu
    if (flashcard && wordValue.trim().toLowerCase() === flashcard.name.toLowerCase()) {
      setAudioCheck({ checking: false, hasAudio: !!flashcard.audio_url, wordExists: true });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setAudioCheck({ checking: true, hasAudio: null, wordExists: null });
      try {
        const response = await api.get(`/flashcards/check-audio/${encodeURIComponent(wordValue.trim())}`);
        setAudioCheck({ 
          checking: false, 
          hasAudio: response.data.hasAudio,
          wordExists: response.data.wordExists,
        });
      } catch (error) {
        setAudioCheck({ checking: false, hasAudio: false, wordExists: false });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [wordValue, flashcard]);

  const onSubmit = async (data: FlashcardRequest) => {
    if (!flashcard) return;
    
    try {
      // Nếu từ thay đổi và có audio mới, lấy audioUrl từ API check
      let audioUrl: string | undefined = undefined;
      if (data.name !== flashcard.name && audioCheck.hasAudio && audioCheck.wordExists) {
        try {
          const response = await api.get(`/flashcards/check-audio/${encodeURIComponent(data.name.trim())}`);
          if (response.data.hasAudio && response.data.audioUrl) {
            audioUrl = response.data.audioUrl;
          }
        } catch (error) {
          console.error('Error fetching audio URL:', error);
        }
      }
      
      await updateFlashcard(flashcard.id, {
        ...data,
        tags: tags,
        audio_url: audioUrl,
      });
      reset();
      setTags([]);
      setTagInput('');
      setAudioCheck({ checking: false, hasAudio: null, wordExists: null });
      onOpenChange(false);
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

  if (!flashcard) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Sửa flashcard</DialogTitle>
        <Card className="w-full border-0 shadow-none">
          <CardHeader>
            <CardTitle>Sửa flashcard</CardTitle>
            <CardDescription>
              Cập nhật thông tin flashcard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Từ *</Label>
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
          <CardFooter className="flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              onClick={handleSubmit(onSubmit)}
              disabled={updateLoading}
            >
              {updateLoading ? 'Đang cập nhật...' : 'Cập nhật flashcard'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleClose}
              disabled={updateLoading}
            >
              Hủy
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default EditFlashcardModal;

