import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  /** Callback khi scroll đến cuối */
  onLoadMore: () => void;
  /** Còn data để load không */
  hasMore: boolean;
  /** Đang loading không */
  isLoading: boolean;
  /** Threshold để trigger (0-1), mặc định 0.1 */
  threshold?: number;
  /** Root margin, mặc định '0px' */
  rootMargin?: string;
}

/**
 * Hook để implement infinite scroll với Intersection Observer
 * @returns ref để gắn vào element trigger load more
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.1,
  rootMargin = '0px',
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });

    // Observe the load more element
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, threshold, rootMargin]);

  return loadMoreRef;
}
