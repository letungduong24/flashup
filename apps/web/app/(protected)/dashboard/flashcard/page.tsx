'use client';

import Folder from '@/components/flashcard/folder';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import useFolderStore from '@/store/folder.store';
import { useEffect, useState } from 'react';
import { BsFolder } from "react-icons/bs";
import { PiStarFour } from "react-icons/pi";
import { FaPlus } from "react-icons/fa";
import { Search, X, Loader2 } from 'lucide-react';
import CreateFolderModal from '@/components/flashcard/create-folder-modal';
import AIAssistantModal from '@/components/flashcard/ai-assistant-modal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce, useInfiniteScroll } from '@/hooks';
import { MdElectricBolt } from "react-icons/md";
import { motion } from 'framer-motion';

export default function FlashcardPage() {
  const { 
    folders, 
    pagination,
    filters,
    loading, 
    loadingMore,
    fetchFolders, 
    loadMoreFolders,
    setFilters 
  } = useFolderStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  
  const debouncedSearch = useDebounce(searchInput, 500);

  // Infinite scroll
  const loadMoreRef = useInfiniteScroll({
    onLoadMore: () => loadMoreFolders(),
    hasMore: pagination?.hasMore ?? false,
    isLoading: loadingMore,
  });

  // Fetch initial data
  useEffect(() => {
    fetchFolders(true);
  }, []);

  // Apply debounced search
  useEffect(() => {
    if (debouncedSearch !== (filters.search || '')) {
      setFilters({ ...filters, search: debouncedSearch || undefined });
      fetchFolders();
    }
  }, [debouncedSearch]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchFolders();
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({});
    fetchFolders(true);
  };

  const hasActiveFilters = !!(filters.search || (filters.sortBy && filters.sortBy !== 'createdAt') || (filters.sortOrder && filters.sortOrder !== 'desc'));

  return (
    <div className="flex flex-col flex-1 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Flashbook</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <FaPlus />
          <span className='hidden sm:block'>Tạo Flashbook</span>
        </Button>
      </div>

      {/* Main content with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Sidebar - 1/4 */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <div className="grid grid-cols-2 gap-4">

              {/* AI Assistant */}
              <motion.div 
                className="group cursor-pointer bg-gradient-to-br w-full from-orange-300 to-orange-500 p-4 rounded-2xl flex flex-col justify-center items-start"
                onClick={() => setIsAIModalOpen(true)}
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
                  <PiStarFour className='group-hover:scale-150 group-hover:rotate-180 transition-all duration-300 text-xl font-bold text-white'/>
                </motion.div>
                <motion.div 
                  className="flex flex-col items-end w-full"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                >
                  <h1 className='font-bold text-white text-xl'>Trợ lý AI</h1>
                  <p className='text-xs text-white'>Tạo Flashbook với AI</p>
                </motion.div>
              </motion.div>

              {/* Explore */}
              <motion.div 
                className="group cursor-pointer border border-zinc-300 p-4 rounded-2xl flex flex-col justify-center items-start"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1],
                  delay: 0.15,
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
                  transition={{ delay: 0.25, duration: 0.4 }}
                >
                  <MdElectricBolt className='group-hover:scale-150 group-hover:rotate-180 transition-all duration-300 text-xl font-bold'/>
                </motion.div>
                <motion.div 
                  className="flex flex-col items-end w-full"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <h1 className='font-bold  text-xl'>Khám phá</h1>
                  <p className='text-xs'>Tải về các Flashbook</p>
                </motion.div>
              </motion.div>
            </div>

            {/* Search & Filter */}
            <motion.div 
              className="p-4 border border-zinc-300 dark:border-zinc-700 rounded-2xl space-y-4"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.2,
              }}
            >
              {/* Stats */}
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm">
                  Tìm kiếm & Lọc
                </p>
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
                  placeholder="Tìm Flashbook..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
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
        </div>

        {/* Folders grid - 3/4 */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : folders.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {folders.map((folder) => (
                  <Folder
                    key={folder.id}
                    folder={folder}
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
                {!pagination?.hasMore && folders.length > 0 && (
                  <p className="text-sm text-muted-foreground">Đã hiển thị tất cả bộ sưu tập</p>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex justify-center items-center py-12">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BsFolder />
                  </EmptyMedia>
                  <EmptyTitle>
                    {hasActiveFilters ? 'Không tìm thấy kết quả' : 'Chưa có bộ sưu tập'}
                  </EmptyTitle>
                  <EmptyDescription>
                    {hasActiveFilters 
                      ? 'Thử thay đổi từ khóa tìm kiếm.'
                      : 'Bạn chưa có bộ sưu tập Flashcard nào. Hãy tạo bộ sưu tập mới để bắt đầu học.'}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  {hasActiveFilters ? (
                    <Button variant="outline" onClick={clearFilters}>Xóa bộ lọc</Button>
                  ) : (
                    <Button onClick={() => setIsCreateModalOpen(true)}>Tạo bộ sưu tập mới</Button>
                  )}
                </EmptyContent>
              </Empty>
            </div>
          )}
        </div>
      </div>
      
      <CreateFolderModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <AIAssistantModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
      />
    </div>
  );
}
