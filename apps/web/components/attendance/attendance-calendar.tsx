'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface CalendarDay {
  date: string;
  checked: boolean;
}

interface AttendanceStats {
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  thisMonth: number;
}

export default function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // Fetch calendar data
  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const [calendarRes, statsRes] = await Promise.all([
        api.get('/attendance/calendar', {
          params: { year, month },
        }),
        api.get('/attendance/statistics'),
      ]);

      setCalendarData(calendarRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [year, month]);

  // Handle check-in
  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await api.post('/attendance/check-in');
      toast.success('Điểm danh thành công!');
      await fetchCalendarData();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Bạn đã điểm danh hôm nay rồi!');
      } else {
        toast.error('Có lỗi xảy ra khi điểm danh');
      }
    } finally {
      setCheckingIn(false);
    }
  };

  // Check if today is already checked in
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const isTodayChecked = calendarData.find((d) => d.date === todayStr)?.checked || false;

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  // Get days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const monthNames = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];

  // Create calendar grid
  const calendarDays: (CalendarDay | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = calendarData.find((d) => d.date === dateStr);
    calendarDays.push({
      date: dateStr,
      checked: dayData?.checked || false,
    });
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Điểm danh
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousMonth}
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {monthNames[month - 1]} {year}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              disabled={loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold text-orange-500">{stats.totalDays}</p>
              <p className="text-xs text-muted-foreground">Tổng ngày</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Chuỗi hiện tại</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{stats.longestStreak}</p>
              <p className="text-xs text-muted-foreground">Chuỗi dài nhất</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{stats.thisMonth}</p>
              <p className="text-xs text-muted-foreground">Tháng này</p>
            </div>
          </div>
        )}

        {/* Check-in Button */}
        <Button
          onClick={handleCheckIn}
          disabled={checkingIn || isTodayChecked}
          className="w-full"
          size="lg"
        >
          {checkingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang điểm danh...
            </>
          ) : isTodayChecked ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Đã điểm danh hôm nay
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Điểm danh hôm nay
            </>
          )}
        </Button>

        {/* Calendar Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2">
            {/* Day names */}
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const isToday = day.date === todayStr;
                const isPast = new Date(day.date) < today;

                return (
                  <motion.div
                    key={day.date}
                    className={`
                      aspect-square rounded-md flex items-center justify-center text-sm
                      ${isToday ? 'ring-2 ring-primary' : ''}
                      ${day.checked ? 'bg-orange-500 text-white' : isPast ? 'bg-muted' : 'bg-muted/50'}
                      ${!isPast && !day.checked ? 'hover:bg-muted cursor-pointer' : ''}
                    `}
                    whileHover={!isPast && !day.checked ? { scale: 1.05 } : {}}
                    whileTap={!isPast && !day.checked ? { scale: 0.95 } : {}}
                  >
                    {day.checked ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className={isToday ? 'font-bold' : ''}>
                        {new Date(day.date).getDate()}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

