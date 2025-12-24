'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import useFolderStore from '@/store/folder.store';
import { ArrowLeft, Search, Loader2, X, BookOpen } from 'lucide-react';
import { BsCardText } from 'react-icons/bs';
import MiniFlashcard from '@/components/flashcard/mini-flashcard';
import { FaPlus } from 'react-icons/fa';
import { ButtonGroup } from '@/components/ui/button-group';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import CreateFlashcardModal from '@/components/flashcard/create-flashcard-modal';
import EditFolderModal from '@/components/flashcard/edit-folder-modal';
import useFlashcardStore from '@/store/flashcard.store';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce, useInfiniteScroll } from '@/hooks';
import { GiBlackBook } from "react-icons/gi";
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PracticeModeDialog from '@/components/flashcard/practice-mode-dialog';

export default function FolderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.id as string;
  const {
    currentFolder,
    loading: folderLoading,
    getFolder,
    removeFlashcardFromCurrentFolder,
    updateFolder,
    deleteFolder,
    togglePublic,
    updateLoading,
    deleteLoading
  } = useFolderStore();
  const {
    flashcards,
    pagination,
    filters,
    loading,
    loadingMore,
    fetchFlashcards,
    loadMoreFlashcards,
    setFilters
  } = useFlashcardStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isUnshareDialogOpen, setIsUnshareDialogOpen] = useState(false);
  const [pendingPublicState, setPendingPublicState] = useState<boolean | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [isPracticeModeDialogOpen, setIsPracticeModeDialogOpen] = useState(false);

  // Debounced search value
  const debouncedSearch = useDebounce(searchInput, 500);

  // Infinite scroll
  const loadMoreRef = useInfiniteScroll({
    onLoadMore: () => loadMoreFlashcards(folderId),
    hasMore: pagination?.hasMore ?? false,
    isLoading: loadingMore,
  });

  // Fetch initial data
  useEffect(() => {
    if (folderId) {
      getFolder(folderId);
      fetchFlashcards(folderId, true);
    }
  }, [folderId]);

  // Apply debounced search
  useEffect(() => {
    if (debouncedSearch !== (filters.search || '')) {
      setFilters({ ...filters, search: debouncedSearch || undefined });
      fetchFlashcards(folderId);
    }
  }, [debouncedSearch]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchFlashcards(folderId);
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({});
    fetchFlashcards(folderId, true);
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.isRemembered !== undefined ||
    (filters.sortBy && filters.sortBy !== 'createdAt') ||
    (filters.sortOrder && filters.sortOrder !== 'desc')
  );

  const handleEditFolder = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteFolder = async () => {
    if (!folderId) return;
    try {
      await deleteFolder(folderId);
      setIsDeleteDialogOpen(false);
      router.push('/dashboard/flashcard');
    } catch (error) {
      // Error đã được xử lý trong store
    }
  };

  const handleUpdateSuccess = () => {
    if (folderId) {
      getFolder(folderId);
    }
  };

  const handleShare = async () => {
    if (!folderId) return;
    try {
      await togglePublic(folderId);
      setIsShareDialogOpen(false);
      setPendingPublicState(null);
      if (folderId) {
        getFolder(folderId);
      }
    } catch (error) {
      // Error đã được xử lý trong store
      setPendingPublicState(null);
      if (folderId) {
        getFolder(folderId);
      }
    }
  };

  const handleUnshare = async () => {
    if (!folderId) return;
    try {
      await togglePublic(folderId);
      setIsUnshareDialogOpen(false);
      setPendingPublicState(null);
      if (folderId) {
        getFolder(folderId);
      }
    } catch (error) {
      // Error đã được xử lý trong store
      setPendingPublicState(null);
      if (folderId) {
        getFolder(folderId);
      }
    }
  };

  const handleToggleChange = (checked: boolean) => {
    setPendingPublicState(checked);
    if (checked) {
      setIsShareDialogOpen(true);
    } else {
      setIsUnshareDialogOpen(true);
    }
  };

  if (folderLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-64" />
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentFolder) {
    return (
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/flashcard')}
          className="w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <div className="flex justify-center items-center py-12">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BsCardText />
              </EmptyMedia>
              <EmptyTitle>Không tìm thấy folder</EmptyTitle>
              <EmptyDescription>Folder không tồn tại hoặc bạn không có quyền truy cập.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => router.push('/dashboard/flashcard')}>
                Quay lại danh sách
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.push('/dashboard/flashcard')}
          className="w-fit"
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold truncate min-w-0">{currentFolder.name}</h1>
      </div>

      {/* Main content with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - 1/4 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
            <motion.div
              className="group cursor-pointer bg-gradient-to-br w-full from-orange-300 to-orange-500 p-4 rounded-2xl flex flex-col justify-center items-start"
              onClick={() => router.push(`/dashboard/flashcard/folder/${folderId}/study`)}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.1,
              }}
              whileHover={{
                scale: 1.05,
                y: -4,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <GiBlackBook className='group-hover:scale-150 group-hover:rotate-180 transition-all duration-300 text-xl font-bold text-white' />
              </motion.div>
              <motion.div
                className="flex flex-col items-end w-full"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                <h1 className='font-bold text-white text-xl'>Học Flashbook</h1>
              </motion.div>
            </motion.div>

            {/* Practice Button */}
            <motion.div
              className={`group cursor-pointer p-4 rounded-2xl flex flex-col justify-center items-start ${(pagination?.total || 0) === 0
                  ? 'bg-gray-400 dark:bg-gray-600'
                  : 'bg-gradient-to-br from-blue-300 to-blue-500'
                }`}
              onClick={() => {
                if ((pagination?.total || 0) > 0) {
                  setIsPracticeModeDialogOpen(true);
                }
              }}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.12,
              }}
              whileHover={(pagination?.total || 0) > 0 ? {
                scale: 1.05,
                y: -4,
                transition: { duration: 0.3 }
              } : {}}
              whileTap={(pagination?.total || 0) > 0 ? { scale: 0.98 } : {}}
              style={{
                opacity: (pagination?.total || 0) === 0 ? 0.5 : 1,
                cursor: (pagination?.total || 0) === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22, duration: 0.4 }}
              >
                <BookOpen className='group-hover:scale-150 group-hover:rotate-12 transition-all duration-300 text-xl font-bold text-white' />
              </motion.div>
              <motion.div
                className="flex flex-col items-end w-full"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.27, duration: 0.4 }}
              >
                <h1 className='font-bold text-white text-xl'>Luyện tập</h1>
              </motion.div>
            </motion.div>
          </div>
          <motion.div
            className="sticky top-20 p-4 h-fit border border-zinc-300 dark:border-zinc-700 rounded-2xl space-y-4"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
              delay: 0.15,
            }}
          >
            {/* Study Button */}
            {/* Folder info & actions */}
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                {pagination?.total || 0} flashcard{(pagination?.total || 0) !== 1 ? 's' : ''}
                {currentFolder?.saves !== undefined && (
                  <span className="ml-2">• {currentFolder.saves} lượt lưu</span>
                )}
              </p>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button className="w-full cursor-pointer group/btn" onClick={() => setIsCreateModalOpen(true)}>
                  <FaPlus />
                  Tạo Flashcard
                </Button>
              </motion.div>

              <div className="flex items-center gap-2 flex-wrap">
                <ButtonGroup className='flex-1'>
                  <Button
                    className='w-1/2'
                    variant={'outline'}
                    size="sm"
                    onClick={handleEditFolder}
                    disabled={updateLoading}
                  >
                    <FaEdit />Sửa
                  </Button>
                  <Button
                    className='w-1/2'
                    variant={'outline'}
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={deleteLoading}
                  >
                    <MdDelete />Xóa
                  </Button>
                </ButtonGroup>

              </div>
            </div>

            {currentFolder && (
              <div className="flex items-center justify-between gap-2 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-md px-3 py-2 h-9">
                <Label htmlFor="share-toggle" className="text-sm font-medium cursor-pointer whitespace-nowrap">
                  Chia sẻ
                </Label>
                <Switch
                  id="share-toggle"
                  checked={pendingPublicState !== null ? pendingPublicState : currentFolder.isPublic}
                  onCheckedChange={handleToggleChange}
                />
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-zinc-200 dark:border-zinc-700" />

            {/* Search header */}
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Tìm kiếm & Lọc</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm từ hoặc nghĩa..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Status filter */}
              <Select
                value={filters.isRemembered === undefined ? 'all' : filters.isRemembered ? 'remembered' : 'not-remembered'}
                onValueChange={(value) => {
                  const isRemembered = value === 'all' ? undefined : value === 'remembered';
                  handleFilterChange('isRemembered', isRemembered);
                }}
              >
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="remembered">Đã nhớ</SelectItem>
                  <SelectItem value="not-remembered">Chưa nhớ</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select
                value={filters.sortBy || 'createdAt'}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder="Mới nhất" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Mới nhất</SelectItem>
                  <SelectItem value="name">Tên A-Z</SelectItem>
                  <SelectItem value="review_count">Số lần học</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort order */}
              <Select
                value={filters.sortOrder || 'desc'}
                onValueChange={(value) => handleFilterChange('sortOrder', value)}
              >
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder="Giảm dần" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Giảm dần</SelectItem>
                  <SelectItem value="asc">Tăng dần</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>

        {/* Cards grid - 3/4 */}
        <div className="lg:col-span-3">

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : flashcards.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {flashcards.map((flashcard) => (
                  <MiniFlashcard
                    key={flashcard.id}
                    flashcard={flashcard}
                    onDelete={() => {
                      removeFlashcardFromCurrentFolder(flashcard.id);
                    }}
                    onEdit={() => {
                      if (folderId) {
                        getFolder(folderId);
                        fetchFlashcards(folderId);
                      }
                    }}
                  />
                ))}
              </div>

              {/* Load more trigger */}
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang tải thêm...</span>
                  </div>
                )}
                {!pagination?.hasMore && flashcards.length > 0 && (
                  <p className="text-sm text-muted-foreground">Đã hiển thị tất cả flashcard</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center py-12">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BsCardText />
                  </EmptyMedia>
                  <EmptyTitle>
                    {hasActiveFilters ? 'Không tìm thấy kết quả' : 'Chưa có flashcard'}
                  </EmptyTitle>
                  <EmptyDescription>
                    {hasActiveFilters
                      ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                      : 'Folder này chưa có flashcard nào. Hãy thêm flashcard để bắt đầu học.'}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  {hasActiveFilters ? (
                    <Button variant="outline" onClick={clearFilters}>Xóa bộ lọc</Button>
                  ) : (
                    <Button onClick={() => setIsCreateModalOpen(true)}>Thêm flashcard</Button>
                  )}
                </EmptyContent>
              </Empty>
            </div>
          )}
        </div>
      </div>

      <CreateFlashcardModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        folderId={folderId}
        onSuccess={() => {
          if (folderId) {
            getFolder(folderId);
            fetchFlashcards(folderId);
          }
        }}
      />

      <EditFolderModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        folder={currentFolder}
        onSuccess={handleUpdateSuccess}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa Flashbook</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa flashbook "{currentFolder?.name}"?
              Hành động này không thể hoàn tác và sẽ xóa tất cả flashcard trong flashbook này.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFolder}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isShareDialogOpen}
        onOpenChange={(open) => {
          setIsShareDialogOpen(open);
          // Nếu đóng dialog mà chưa xác nhận, revert switch về trạng thái ban đầu
          if (!open) {
            setPendingPublicState(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chia sẻ Flashbook</DialogTitle>
            <DialogDescription>
              Bạn có muốn chia sẻ Flashbook này? Mọi người sẽ có thể lưu Flashbook này về và học tập cùng bạn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsShareDialogOpen(false);
                setPendingPublicState(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleShare}
            >
              Chia sẻ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isUnshareDialogOpen}
        onOpenChange={(open) => {
          setIsUnshareDialogOpen(open);
          // Nếu đóng dialog mà chưa xác nhận, revert switch về trạng thái ban đầu
          if (!open) {
            setPendingPublicState(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hủy chia sẻ Flashbook</DialogTitle>
            <DialogDescription>
              Bạn có muốn Hủy chia sẻ? Mọi người sẽ không thể thấy Flashbook này của bạn nữa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsUnshareDialogOpen(false);
                setPendingPublicState(null);
              }}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnshare}
            >
              Hủy chia sẻ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Practice Mode Dialog */}
      <PracticeModeDialog
        open={isPracticeModeDialogOpen}
        onOpenChange={setIsPracticeModeDialogOpen}
        onSelectMode={(mode) => {
          if (mode === 'fill-in-the-blank') {
            router.push(`/dashboard/flashcard/folder/${folderId}/practice/fill-in-the-blank`);
          } else if (mode === 'multiple-choice') {
            router.push(`/dashboard/flashcard/folder/${folderId}/practice/multiple-choice`);
          } else if (mode === 'sentence') {
            router.push(`/dashboard/flashcard/folder/${folderId}/practice/sentence`);
          }
        }}
      />
    </div>
  );
}
