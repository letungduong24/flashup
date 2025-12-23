'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ArrowLeft, Search, Loader2, X, Save } from 'lucide-react';
import { BsCardText } from 'react-icons/bs';
import MiniFlashcard from '@/components/flashcard/mini-flashcard';
import useFlashcardStore from '@/store/flashcard.store';
import useFolderStore from '@/store/folder.store';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce, useInfiniteScroll } from '@/hooks';
import { GiBlackBook } from "react-icons/gi";
import { motion } from 'framer-motion';

export default function PublicFolderPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.id as string;
  const { 
    currentFolder, 
    loading: folderLoading, 
    getPublicFolder,
    savePublicFolder,
    savingLoading
  } = useFolderStore();
  const { 
    flashcards, 
    pagination, 
    filters,
    loading: flashcardsLoading, 
    loadingMore,
    fetchFlashcards, 
    loadMoreFlashcards,
    setFilters 
  } = useFlashcardStore();
  const [searchInput, setSearchInput] = useState('');
  
  // Debounced search value
  const debouncedSearch = useDebounce(searchInput, 500);

  // Infinite scroll
  const loadMoreRef = useInfiniteScroll({
    onLoadMore: () => loadMoreFlashcards(folderId),
    hasMore: pagination?.hasMore ?? false,
    isLoading: loadingMore,
  });

  // Fetch folder data
  useEffect(() => {
    if (folderId) {
      getPublicFolder(folderId);
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

  const handleSave = async () => {
    if (!folderId) return;
    try {
      await savePublicFolder(folderId);
      router.push('/dashboard/flashcard');
    } catch (error) {
      // Error đã được xử lý trong store
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
          onClick={() => router.push('/dashboard/explore')}
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
              <EmptyTitle>Không tìm thấy flashbook</EmptyTitle>
              <EmptyDescription>Flashbook không tồn tại hoặc không được chia sẻ công khai.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => router.push('/dashboard/explore')}>
                Quay lại khám phá
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
          onClick={() => router.push('/dashboard/explore')}
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
          {/* Save Button */}
          <motion.div 
            className="group cursor-pointer bg-gradient-to-br w-full from-orange-300 to-orange-500 p-4 rounded-2xl flex flex-col justify-center items-start"
            onClick={handleSave}
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
              <Save className='group-hover:scale-150 group-hover:rotate-180 transition-all duration-300 text-xl font-bold text-white'/>
            </motion.div>
            <motion.div 
              className="flex flex-col items-end w-full"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <h1 className='font-bold text-white text-xl'>
                {savingLoading ? 'Đang lưu...' : 'Lưu flashbook'}
              </h1>
            </motion.div>
          </motion.div>
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
            {/* Folder info */}
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                {pagination?.total || 0} flashcard{(pagination?.total || 0) !== 1 ? 's' : ''}
                {currentFolder?.saves !== undefined && (
                  <span className="ml-2">• {currentFolder.saves} lượt lưu</span>
                )}
              </p>
            </div>

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

          {flashcardsLoading ? (
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
                    readOnly={true}
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
                      : 'Flashbook này chưa có flashcard nào.'}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>Xóa bộ lọc</Button>
                  )}
                </EmptyContent>
              </Empty>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

