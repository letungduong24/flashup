'use client';

import Folder from '@/components/flashcard/folder';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { BsFolder } from "react-icons/bs";
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce, useInfiniteScroll } from '@/hooks';
import { motion } from 'framer-motion';
import useFolderStore from '@/store/folder.store';

export default function ExplorePage() {
  const { 
    publicFolders, 
    publicPagination,
    publicFilters,
    publicLoading, 
    publicLoadingMore,
    fetchPublicFolders, 
    loadMorePublicFolders,
    setPublicFilters 
  } = useFolderStore();
  const [searchInput, setSearchInput] = useState('');
  
  const debouncedSearch = useDebounce(searchInput, 500);

  // Infinite scroll
  const loadMoreRef = useInfiniteScroll({
    onLoadMore: () => loadMorePublicFolders(),
    hasMore: publicPagination?.hasMore ?? false,
    isLoading: publicLoadingMore,
  });

  // Fetch initial data
  useEffect(() => {
    fetchPublicFolders(true);
  }, []);

  // Apply debounced search
  useEffect(() => {
    if (debouncedSearch !== (publicFilters.search || '')) {
      setPublicFilters({ ...publicFilters, search: debouncedSearch || undefined });
      fetchPublicFolders();
    }
  }, [debouncedSearch]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...publicFilters, [key]: value };
    setPublicFilters(newFilters);
    fetchPublicFolders();
  };

  const clearFilters = () => {
    setSearchInput('');
    setPublicFilters({
      sortBy: 'saves',
      sortOrder: 'desc',
    });
    fetchPublicFolders(true);
  };

  const hasActiveFilters = !!(
    publicFilters.search || 
    (publicFilters.sortBy && publicFilters.sortBy !== 'saves') ||
    (publicFilters.sortOrder && publicFilters.sortOrder !== 'desc')
  );

  return (
    <div className="flex flex-col flex-1 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Khám phá</h1>
      </div>

      {/* Main content with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Sidebar - 1/4 */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
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
                  value={publicFilters.sortBy || 'saves'}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="w-auto">
                    <SelectValue placeholder="Lượt lưu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saves">Lượt lưu</SelectItem>
                    <SelectItem value="createdAt">Mới nhất</SelectItem>
                    <SelectItem value="name">Tên A-Z</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort order */}
                <Select
                  value={publicFilters.sortOrder || 'desc'}
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
          {publicLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : publicFolders.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {publicFolders.map((folder) => (
                  <Folder
                    key={folder.id}
                    folder={folder}
                    isExplore={true}
                  />
                ))}
              </div>

              {/* Load more trigger */}
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {publicLoadingMore && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang tải thêm...</span>
                  </div>
                )}
                {!publicPagination?.hasMore && publicFolders.length > 0 && (
                  <p className="text-sm text-muted-foreground">Đã hiển thị tất cả flashbook</p>
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
                    {hasActiveFilters ? 'Không tìm thấy kết quả' : 'Chưa có flashbook công khai'}
                  </EmptyTitle>
                  <EmptyDescription>
                    {hasActiveFilters 
                      ? 'Thử thay đổi từ khóa tìm kiếm.'
                      : 'Hiện chưa có flashbook nào được chia sẻ công khai.'}
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
