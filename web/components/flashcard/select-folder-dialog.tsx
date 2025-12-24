'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Loader2, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import useFolderStore from '@/store/folder.store';
import { FolderResponse } from '@/types/folder';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { BsFolder } from 'react-icons/bs';
import { PiStarFour } from 'react-icons/pi';
import { FaPlus } from 'react-icons/fa';
import CreateFlashbookModal from '@/components/flashcard/create-flashbook-modal';
import { useDebounce, useInfiniteScroll } from '@/hooks';

interface SelectFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (folderId: string) => void;
}

export default function SelectFolderDialog({
  open,
  onOpenChange,
  onSelect,
}: SelectFolderDialogProps) {
  const { folders, pagination, filters, loading, loadingMore, fetchFolders, loadMoreFolders, setFilters } = useFolderStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'ai' | 'manual'>('ai');
  const [searchInput, setSearchInput] = useState('');

  const debouncedSearch = useDebounce(searchInput, 500);

  // Infinite scroll
  const loadMoreRef = useInfiniteScroll({
    onLoadMore: () => loadMoreFolders(),
    hasMore: pagination?.hasMore ?? false,
    isLoading: loadingMore,
  });

  useEffect(() => {
    if (open) {
      setSearchInput('');
      setFilters({ search: undefined });
      fetchFolders(false); // Don't reset filters, just fetch with current (empty) filters
    }
  }, [open]);

  // Apply debounced search
  useEffect(() => {
    if (!open) return;

    setFilters({ search: debouncedSearch || undefined });
    fetchFolders(false);
  }, [debouncedSearch]);

  const hasFlashcards = (folder: FolderResponse) => {
    const total = (folder.newCount ?? 0) + (folder.reviewCount ?? 0);
    return total > 0;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Chọn Flashbook để luyện tập</DialogTitle>
            <DialogDescription>
              Chọn một flashbook để bắt đầu luyện tập
            </DialogDescription>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm flashbook..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : folders.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia>
                    <BsFolder className="h-12 w-12 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>Chưa có Flashbook nào</EmptyTitle>
                  <EmptyDescription>
                    {searchInput ? 'Không tìm thấy flashbook nào' : 'Tạo flashbook đầu tiên của bạn để bắt đầu'}
                  </EmptyDescription>
                </EmptyHeader>
                {!searchInput && (
                  <EmptyContent>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <Button
                        onClick={() => {
                          setDefaultTab('manual');
                          setIsCreateModalOpen(true);
                        }}
                        className="flex-1"
                      >
                        <FaPlus className="mr-2 h-4 w-4" />
                        Tạo thủ công
                      </Button>
                      <Button
                        onClick={() => {
                          setDefaultTab('ai');
                          setIsCreateModalOpen(true);
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        <PiStarFour className="mr-2 h-4 w-4" />
                        Trợ lý AI
                      </Button>
                    </div>
                  </EmptyContent>
                )}
              </Empty>
            ) : (
              <div className="space-y-2 overflow-hidden p-1">
                {folders.map((folder) => {
                  const canPractice = hasFlashcards(folder);
                  return (
                    <motion.div
                      key={folder.id}
                      whileHover={canPractice ? { y: -2 } : {}}
                      whileTap={canPractice ? { scale: 0.98 } : {}}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto p-4 flex items-center gap-3 hover:bg-accent text-left justify-start disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          if (canPractice) {
                            onSelect(folder.id);
                            onOpenChange(false);
                          }
                        }}
                        disabled={!canPractice}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{folder.name}</div>
                          <div className="text-sm text-muted-foreground font-normal">
                            {(folder.newCount ?? 0) + (folder.reviewCount ?? 0)} từ vựng
                            {!canPractice && <span className="text-orange-500 ml-2">(Chưa có flashcard)</span>}
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  );
                })}

                {/* Load more trigger */}
                {pagination?.hasMore && (
                  <div ref={loadMoreRef} className="py-4 flex justify-center">
                    {loadingMore && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CreateFlashbookModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          fetchFolders(true);
        }}
        defaultTab={defaultTab}
      />
    </>
  );
}
