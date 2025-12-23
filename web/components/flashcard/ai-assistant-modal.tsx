'use client';

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
import { BackgroundGradient } from '../ui/shadcn-io/background-gradient';

const aiAssistantSchema = z.object({
  folderName: z.string().min(1, 'Tên Flashbook không được để trống').max(100, 'Tên Flashbook quá dài'),
});

type AIAssistantFormData = z.infer<typeof aiAssistantSchema>;

interface AIAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AIAssistantModal({ open, onOpenChange, onSuccess }: AIAssistantModalProps) {
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
      onSuccess?.();
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
      <DialogContent className="sm:max-w-[500px] p-0 bg-transparent border-0">
        <DialogTitle className="sr-only">Tạo Flashbook với AI</DialogTitle>
        <BackgroundGradient className='w-full bg-gray-100 p-4 rounded-3xl dark:bg-zinc-800' show={generateLoading}>
          <Card className="w-full border-0 shadow-none bg-transparent">
            <CardHeader>
              <CardTitle>Tạo Flashbook với AI</CardTitle>
              <CardDescription>
                Nhập tên chủ đề Flashbook, AI sẽ tự động tạo Flashbook với các flashcard liên quan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="folderName">Tên chủ đề Flashbook *</Label>
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
        </BackgroundGradient>
      </DialogContent>
    </Dialog>
  );
}

