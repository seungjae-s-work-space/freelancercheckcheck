import { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuthStore } from '../stores/useAuthStore';
import type { CheckIn } from '../api/client';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const checkIns = useAuthStore((s) => s.checkIns);
  const settings = useAuthStore((s) => s.settings);
  const fetchCheckInsByMonth = useAuthStore((s) => s.fetchCheckInsByMonth);

  // 월이 변경될 때 체크인 데이터 로드
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    fetchCheckInsByMonth(year, month);
  }, [currentMonth, fetchCheckInsByMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const workDays = settings?.work_days || [1, 2, 3, 4, 5];

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayCheckIns = checkIns.filter((c) => c.date === dateStr);
      const isWorkDay = workDays.includes(day.getDay());

      days.push(
        <DayCell
          key={dateStr}
          date={day}
          isCurrentMonth={isSameMonth(day, monthStart)}
          isTodayDate={isToday(day)}
          isWorkDay={isWorkDay}
          checkIns={dayCheckIns}
        />
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day.toISOString()} className="grid grid-cols-7 gap-1">
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          ◀
        </button>
        <h2 className="text-lg font-bold">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          ▶
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <div
            key={d}
            className={`text-center text-sm font-medium py-1 ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">{rows}</div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>완료</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <span>부분</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-200"></div>
          <span>출근일</span>
        </div>
      </div>

      {/* 이번 달 출퇴근 기록 */}
      <CheckInList checkIns={checkIns} currentMonth={currentMonth} />
    </div>
  );
}

function CheckInList({ checkIns, currentMonth }: { checkIns: CheckIn[]; currentMonth: Date }) {
  const monthCheckIns = checkIns.filter(
    (c) => c.date.substring(0, 7) === format(currentMonth, 'yyyy-MM')
  );

  if (monthCheckIns.length === 0) {
    return (
      <div className="mt-4 pt-4 border-t">
        <h4 className="font-semibold mb-3 text-sm">이번 달 출퇴근 기록</h4>
        <p className="text-gray-400 text-sm text-center py-4">출퇴근 기록이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="font-semibold mb-3 text-sm">이번 달 출퇴근 기록</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {monthCheckIns
          .sort((a, b) => b.date.localeCompare(a.date) || (a.period === 'morning' ? -1 : 1))
          .map((checkIn) => (
            <div
              key={checkIn.id}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {format(new Date(checkIn.date), 'M/d(E)', { locale: ko })}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    checkIn.period === 'morning'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {checkIn.period === 'morning' ? '오전' : '오후'}
                </span>
              </div>
              <div className="text-gray-500 text-xs">
                {format(new Date(checkIn.checked_at), 'HH:mm')}
                {checkIn.checked_out_at && (
                  <>
                    <span className="mx-1">→</span>
                    {format(new Date(checkIn.checked_out_at), 'HH:mm')}
                    <span className="text-green-600 ml-1">
                      ({Math.floor(checkIn.work_minutes / 60)}h {checkIn.work_minutes % 60}m)
                    </span>
                  </>
                )}
                {!checkIn.checked_out_at && (
                  <span className="text-yellow-600 ml-1">근무중</span>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function DayCell({
  date,
  isCurrentMonth,
  isTodayDate,
  isWorkDay,
  checkIns,
}: {
  date: Date;
  isCurrentMonth: boolean;
  isTodayDate: boolean;
  isWorkDay: boolean;
  checkIns: CheckIn[];
}) {
  const hasMorning = checkIns.some((c) => c.period === 'morning');
  const hasAfternoon = checkIns.some((c) => c.period === 'afternoon');
  const isComplete = hasMorning && hasAfternoon;
  const isPartial = (hasMorning || hasAfternoon) && !isComplete;

  return (
    <div
      className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative ${
        !isCurrentMonth
          ? 'text-gray-300'
          : isTodayDate
          ? 'bg-blue-50 font-bold text-blue-600'
          : isWorkDay
          ? 'bg-gray-50'
          : ''
      }`}
    >
      <span>{format(date, 'd')}</span>
      {isCurrentMonth && (hasMorning || hasAfternoon) && (
        <div className="flex gap-0.5 mt-0.5">
          {isComplete ? (
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          ) : isPartial ? (
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          ) : null}
        </div>
      )}
    </div>
  );
}
