'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileQuestion, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';

type PracticeMode = 'multiple-choice' | 'fill-in-the-blank' | null;

interface PracticeModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMode: (mode: PracticeMode) => void;
}

export default function PracticeModeDialog({
  open,
  onOpenChange,
  onSelectMode,
}: PracticeModeDialogProps) {
  const handleSelectMode = (mode: PracticeMode) => {
    onSelectMode(mode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chọn chế độ luyện tập</DialogTitle>
          <DialogDescription>
            Chọn một trong các chế độ luyện tập để bắt đầu
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 py-4">
          {/* Multiple Choice Mode */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Button
              variant="outline"
              className="w-full h-auto p-6 flex flex-col items-start gap-3 hover:bg-accent"
              onClick={() => handleSelectMode('multiple-choice')}
            >
              <div className="flex items-center gap-3 w-full">
                <FileQuestion className="h-6 w-6 text-primary" />
                <div className="flex-1 text-left">
                  <div className="font-semibold">Trắc nghiệm</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    Chọn đáp án đúng từ các lựa chọn
                  </div>
                </div>
              </div>
            </Button>
          </motion.div>

          {/* Fill in the Blank Mode */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Button
              variant="outline"
              className="w-full h-auto p-6 flex flex-col items-start gap-3 hover:bg-accent"
              onClick={() => handleSelectMode('fill-in-the-blank')}
            >
              <div className="flex items-center gap-3 w-full">
                <Pencil className="h-6 w-6 text-primary" />
                <div className="flex-1 text-left">
                  <div className="font-semibold">Điền từ</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    Điền từ tiếng Anh vào chỗ trống
                  </div>
                </div>
              </div>
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

