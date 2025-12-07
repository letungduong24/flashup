'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FolderRequest, folderRequestSchema, FolderResponse } from '@repo/types';
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

interface EditFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: FolderResponse | null;
  onSuccess?: () => void;
}

const EditFolderModal: React.FC<EditFolderModalProps> = ({
  open,
  onOpenChange,
  folder,
  onSuccess,
}) => {
  const { updateFolder, updateLoading } = useFolderStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FolderRequest>({
    resolver: zodResolver(folderRequestSchema),
    defaultValues: {
      name: '',
      description: undefined,
    },
  });

  useEffect(() => {
    if (open && folder) {
      reset({
        name: folder.name,
        description: folder.description || undefined,
      });
    } else if (!open) {
      reset({
        name: '',
        description: undefined,
      });
    }
  }, [open, folder, reset]);

  const onSubmit = async (data: FolderRequest) => {
    if (!folder) return;
    try {
      await updateFolder(folder.id, data);
      reset();
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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogTitle className="sr-only">Sửa bộ sưu tập</DialogTitle>
        <Card className="w-full border-0 shadow-none">
          <CardHeader>
            <CardTitle>Sửa bộ sưu tập</CardTitle>
            <CardDescription>
              Cập nhật thông tin của bộ sưu tập flashcard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên bộ sưu tập *</Label>
                  <Input
                    id="name"
                    placeholder="Nhập tên bộ sưu tập"
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
              disabled={updateLoading}
            >
              {updateLoading ? 'Đang cập nhật...' : 'Cập nhật'}
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

export default EditFolderModal;

