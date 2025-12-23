'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/auth.store';
import useFolderStore from '@/store/folder.store';
import useSummaryStore from '@/store/summary.store';
import Folder from '@/components/flashcard/folder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import CreateFolderModal from '@/components/flashcard/create-folder-modal';
import AIAssistantModal from '@/components/flashcard/ai-assistant-modal';
import AttendanceCalendar from '@/components/attendance/attendance-calendar';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Play,
  Pause,
  RefreshCw,
  Loader2,
  PartyPopper
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BsFolder } from "react-icons/bs";
import { PiStarFour } from "react-icons/pi";
import { FaPlus } from "react-icons/fa";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { folders, fetchFolders, loading } = useFolderStore();
  const { 
    summaryStats, 
    loading: loadingSummary, 
    fetchSummaryStats,
    nearestReviewFolder,
    folderMode,
    loadingNearestReview,
    fetchNearestReviewFolder,
    dailyStats,
    loadingDailyStats,
    fetchDailyStats,
  } = useSummaryStore();
  const router = useRouter();
  const [timeTracker, setTimeTracker] = useState({ isRunning: false, time: 0 });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  useEffect(() => {
    fetchFolders(true);
    fetchDailyStats();
    fetchSummaryStats();
    fetchNearestReviewFolder();
  }, []);


  // Time tracker logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timeTracker.isRunning) {
      interval = setInterval(() => {
        setTimeTracker(prev => ({ ...prev, time: prev.time + 1 }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeTracker.isRunning]);

  // Use summary stats from API
  const { totalFlashbooks, totalFlashcards, newWordsCount: totalNewWords, reviewWordsCount: totalReviewWords } = summaryStats;
  const hasNoFlashcards = totalFlashcards === 0;
  const totalStudied = folders.reduce((sum, folder) => {
    // Mock: assume each folder has some studied words
    return sum + Math.floor((folder.newCount || 0) * 0.3);
  }, 0);

  // Calculate progress percentages (mock data for now)
  const studyProgress = totalFlashcards > 0 ? Math.round((totalStudied / totalFlashcards) * 100) : 0;
  const reviewProgress = totalFlashcards > 0 ? Math.round((totalReviewWords / totalFlashcards) * 100) : 0;

  // Convert daily stats to weekly chart data
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const chartData = dailyStats.map((stat, index) => {
    const date = new Date(stat.date);
    const dayIndex = date.getDay();
    return {
      day: dayNames[dayIndex] || `Day ${index + 1}`,
      count: stat.count,
      date: stat.date,
    };
  });
  const totalWeeklyCount = chartData.reduce((sum, d) => sum + d.count, 0);

  const chartConfig = {
    count: {
      label: 'Số từ',
      color: '#f97316', // Orange-500 color
    },
  } as const;

  // Mock calendar events
  const upcomingEvents = [
    { title: 'Ôn tập Flashbook: Từ vựng TOEIC', time: '8:00', date: '24/09' },
    { title: 'Học từ mới: Business English', time: '10:00', date: '25/09' },
  ];


  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Chào mừng, {user?.name || 'Người dùng'}!</h1>
        <p className="text-muted-foreground mb-6">Theo dõi tiến độ học tập của bạn</p>
      </motion.div>

      {/* Main Content - Grid with equal cells */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:grid-rows-3 xl:[grid-auto-rows:1fr]">
        {/* Key Metrics - Row 1, Col 1 */}
        <motion.div
          className="xl:col-start-1 xl:row-start-1 xl:row-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 w-full">
                <div className="flex flex-col items-center gap-1">
                  {loadingSummary ? (
                    <div className="h-10 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    <p className="text-5xl font-bold">{totalFlashbooks}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Flashbook</p>
                </div>

                <div className="flex flex-col items-center gap-1">
                  {loadingSummary ? (
                    <div className="h-10 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    <p className="text-5xl font-bold">{totalFlashcards}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Flashcard</p>
                </div>

                <div className="flex flex-col items-center gap-1">
                  {loadingSummary ? (
                    <div className="h-10 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    <p className="text-5xl font-bold">{totalNewWords}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Từ mới</p>
                </div>

                <div className="flex flex-col items-center gap-1">
                  {loadingSummary ? (
                    <div className="h-10 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    <p className="text-5xl font-bold">{totalReviewWords}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Cần review</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Học từ mới - Row 2-3, Col 1 */}
        <motion.div
          className="xl:col-start-1 xl:row-start-2 xl:row-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="h-full">
            {loadingNearestReview ? (
              <Card className="h-full flex flex-col">
                <CardContent className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : hasNoFlashcards ? (
              <Card className="h-full flex flex-col">
                <CardContent className="flex-1 flex items-center justify-center">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <BsFolder className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>Chưa có Flashbook nào</EmptyTitle>
                      <EmptyDescription>
                        Bắt đầu tạo Flashbook đầu tiên của bạn để bắt đầu học từ vựng
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Button 
                          onClick={() => setIsCreateModalOpen(true)}
                          className="flex-1"
                        >
                          <FaPlus className="mr-2 h-4 w-4" />
                          Tạo thủ công
                        </Button>
                        <Button 
                          onClick={() => setIsAIModalOpen(true)}
                          variant="outline"
                          className="flex-1"
                        >
                          <PiStarFour className="mr-2 h-4 w-4" />
                          Trợ lý AI
                        </Button>
                      </div>
                    </EmptyContent>
                  </Empty>
                </CardContent>
              </Card>
            ) : nearestReviewFolder ? (
              <div className="h-full">
                <Folder folder={nearestReviewFolder} isSummaryMode mode={folderMode || undefined} />
              </div>
            ) : (
              <Card className="h-full flex flex-col">
                <CardContent className="flex-1 flex flex-col items-center justify-center gap-4">
                  <PartyPopper className="h-12 w-12 text-orange-500" />
                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold">Không có từ mới để học</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Progress Chart - Row 1-3, Col 2 */}
        <motion.div
          className="xl:col-start-2 xl:row-start-1 xl:row-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Tiến độ học tập</CardTitle>
              <CardDescription>{totalWeeklyCount} từ đã học tuần này</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center">
              {loadingDailyStats ? (
                <div className="flex items-center justify-center w-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-xs"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-xs"
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar
                      dataKey="count"
                      fill="#f97316"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center w-full text-sm text-muted-foreground">
                  Chưa có dữ liệu học tập
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Calendar - Row 1-3, Col 3 */}
        <motion.div
          className="xl:col-start-3 xl:row-start-1 xl:row-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="h-full">
            <AttendanceCalendar />
          </div>
        </motion.div>
      </div>

      <CreateFolderModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          fetchSummaryStats();
          fetchNearestReviewFolder();
        }}
      />
      <AIAssistantModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
        onSuccess={() => {
          fetchSummaryStats();
          fetchNearestReviewFolder();
        }}
      />
    </div>
  );
}
