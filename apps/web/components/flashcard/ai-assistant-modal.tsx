'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import useFolderStore from '@/store/folder.store';

const aiAssistantSchema = z.object({
  folderName: z.string().min(1, 'Tên bộ sưu tập không được để trống').max(100, 'Tên bộ sưu tập quá dài'),
});

type AIAssistantFormData = z.infer<typeof aiAssistantSchema>;

interface AIAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AIAssistantModal({ open, onOpenChange }: AIAssistantModalProps) {
  const { generateFolderWithFlashcards, generateLoading } = useFolderStore();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AIAssistantFormData>({
    resolver: zodResolver(aiAssistantSchema),
    defaultValues: { folderName: '' },
  });

  const onSubmit = async (data: AIAssistantFormData) => {
    try {
      await generateFolderWithFlashcards(data.folderName);
      reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled in store
    }
  };

  const handleClose = () => {
    if (!generateLoading) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogTitle className="sr-only">Tạo bộ sưu tập với AI</DialogTitle>
        <Card className="w-full border-0 shadow-none">
          <CardHeader>
            <CardTitle>Tạo bộ sưu tập với AI</CardTitle>
            <CardDescription>
              Nhập tên chủ đề bộ sưu tập, AI sẽ tự động tạo folder với các flashcard liên quan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="folderName">Tên chủ đề bộ sưu tập *</Label>
                  <Input
                    id="folderName"
                    placeholder="Ví dụ: Từ vựng về công nghệ, Từ vựng về du lịch..."
                    {...register('folderName')}
                    aria-invalid={errors.folderName ? 'true' : 'false'}
                    required
                    disabled={generateLoading}
                  />
                  {errors.folderName && (
                    <p className="text-sm text-destructive">{errors.folderName.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    AI sẽ tạo 10-15 flashcard liên quan đến chủ đề này
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              onClick={handleSubmit(onSubmit)}
              disabled={generateLoading}
            >
              {generateLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo với AI...
                </>
              ) : (
                'Tạo với AI'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleClose}
              disabled={generateLoading}
            >
              Hủy
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

