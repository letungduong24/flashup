'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileQuestion, Pencil, FileText, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import SelectFolderDialog from '@/components/flashcard/select-folder-dialog';
import { useRouter } from 'next/navigation';

type PracticeMode = 'multiple-choice' | 'fill-in-the-blank' | 'write-sentence' | 'write-paragraph' | null;

export default function PracticePage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<PracticeMode>(null);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);

  const practiceModes = [
    {
      mode: 'multiple-choice' as PracticeMode,
      label: 'Trắc nghiệm',
      description: 'Chọn đáp án đúng từ các lựa chọn',
      icon: <FileQuestion className="h-8 w-8 text-primary" />,
      available: true,
    },
    {
      mode: 'fill-in-the-blank' as PracticeMode,
      label: 'Điền từ',
      description: 'Điền từ tiếng Anh vào chỗ trống',
      icon: <Pencil className="h-8 w-8 text-primary" />,
      available: true,
    },
    {
      mode: 'write-sentence' as PracticeMode,
      label: 'Viết câu',
      description: 'Viết câu hoàn chỉnh từ các từ trong Flashbook',
      icon: <FileText className="h-8 w-8 text-primary" />,
      available: true,
    },
    {
      mode: 'write-paragraph' as PracticeMode,
      label: 'Viết đoạn văn ngắn',
      description: 'Viết đoạn văn ngắn từ các từ trong Flashbook',
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      available: false,
    },
  ];

  const handleSelectMode = (mode: PracticeMode) => {
    if (!mode) return;

    const modeConfig = practiceModes.find(m => m.mode === mode);
    if (!modeConfig?.available) return;

    setSelectedMode(mode);
    setIsFolderDialogOpen(true);
  };

  const handleSelectFolder = (folderId: string) => {
    if (!selectedMode) return;

    if (selectedMode === 'fill-in-the-blank') {
      router.push(`/dashboard/flashcard/folder/${folderId}/practice/fill-in-the-blank`);
    } else if (selectedMode === 'multiple-choice') {
      router.push(`/dashboard/flashcard/folder/${folderId}/practice/multiple-choice`);
    } else if (selectedMode === 'write-sentence') {
      router.push(`/dashboard/flashcard/folder/${folderId}/practice/sentence`);
    }
    // write-paragraph is not available yet
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Luyện tập</h1>
        <p className="text-muted-foreground">
          Chọn chế độ luyện tập để bắt đầu cải thiện kỹ năng tiếng Anh của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {practiceModes.map((item) => (
          <motion.div
            key={item.mode}
            whileHover={item.available ? { scale: 1.02, y: -4 } : {}}
            whileTap={item.available ? { scale: 0.98 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Button
              variant="outline"
              className="w-full h-auto p-6 flex flex-col items-start gap-4 hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleSelectMode(item.mode)}
              disabled={!item.available}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-lg flex items-center gap-2 mb-1">
                    {item.label}
                    {!item.available && (
                      <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                        Đang phát triển
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground font-normal">
                    {item.description}
                  </div>
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Select Folder Dialog */}
      <SelectFolderDialog
        open={isFolderDialogOpen}
        onOpenChange={setIsFolderDialogOpen}
        onSelect={handleSelectFolder}
      />
    </div>
  );
}

