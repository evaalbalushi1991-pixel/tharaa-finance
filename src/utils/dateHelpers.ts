import { startOfDay, endOfDay, isBefore, isAfter, addMonths } from 'date-fns';
import type { FinancialCycle } from '../types';

export const getCurrentCycle = (cycleStartDay: number = 23): FinancialCycle => {
  const today = new Date();
  const currentDay = today.getDate();
  
  let cycleStart: Date;
  let cycleEnd: Date;
  
  if (currentDay < cycleStartDay) {
    // نحن في الشهر السابق
    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, cycleStartDay);
    cycleStart = startOfDay(prevMonth);
    cycleEnd = endOfDay(new Date(today.getFullYear(), today.getMonth(), cycleStartDay - 1));
  } else {
    // نحن في الشهر الحالي
    cycleStart = startOfDay(new Date(today.getFullYear(), today.getMonth(), cycleStartDay));
    const nextMonth = addMonths(cycleStart, 1);
    cycleEnd = endOfDay(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), cycleStartDay - 1));
  }
  
  return {
    id: `${cycleStart.getFullYear()}-${cycleStart.getMonth() + 1}`,
    startDate: cycleStart,
    endDate: cycleEnd,
  };
};

export const isInCurrentCycle = (date: string | Date, cycleStartDay: number = 23): boolean => {
  const cycle = getCurrentCycle(cycleStartDay);
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  
  return !isBefore(checkDate, cycle.startDate) && !isAfter(checkDate, cycle.endDate);
};

export const formatCycleDisplay = (cycle: FinancialCycle): string => {
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  
  const startMonth = months[cycle.startDate.getMonth()];
  const endMonth = months[cycle.endDate.getMonth()];
  const startDay = cycle.startDate.getDate();
  const endDay = cycle.endDate.getDate();
  
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'اليوم';
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  
  return d.toLocaleDateString('ar-SA', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};
