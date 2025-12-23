'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FolderRequest, folderRequestSchema } from '@/types/folder';
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
import useFolderStore from '@/store/folder.store';

interface CreateFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { createFolder, createLoading } = useFolderStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FolderRequest>({
    resolver: zodResolver(folderRequestSchema),
    defaultValues: {
      name: '',
      description: undefined,
    },
  });

  const onSubmit = async (data: FolderRequest) => {
    try {
      await createFolder(data);
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error đã được xử lý trong store
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogTitle className="sr-only">Tạo Flashbook mới</DialogTitle>
        <Card className="w-full border-0 shadow-none">
          <CardHeader>
            <CardTitle>Tạo Flashbook mới</CardTitle>
            <CardDescription>
              Tạo một Flashbook mới để bắt đầu học.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên Flashbook *</Label>
                  <Input
                    id="name"
                    placeholder="Nhập tên Flashbook"
                    {...register('name')}
                    aria-invalid={errors.name ? 'true' : 'false'}
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    placeholder="Nhập mô tả (tùy chọn)"
                    rows={4}
                    {...register('description')}
                    aria-invalid={errors.description ? 'true' : 'false'}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
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
              disabled={createLoading}
            >
              {createLoading ? 'Đang tạo...' : 'Tạo Flashbook'}
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
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderModal;

