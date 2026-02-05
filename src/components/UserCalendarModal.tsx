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
import { adminApi, type User, type CheckIn } from '../api/client';

interface UserCalendarModalProps {
  user: User;
  onClose: () => void;
}

export default function UserCalendarModal({ user, onClose }: UserCalendarModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  // 월별 데이터 로드
  useEffect(() => {
    const loadCheckIns = async () => {
      setLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const res = await adminApi.getAllCheckIns({ year, month });
      if (res.data) {
        // 해당 사용자의 체크인만 필터링
        setCheckIns(res.data.check_ins.filter(c => c.user_id === user.id));
      }
      setLoading(false);
    };
    loadCheckIns();
  }, [currentMonth, user.id]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  // 월별 통계 계산
  const monthCheckIns = checkIns.filter(c =>
    c.date.substring(0, 7) === format(currentMonth, 'yyyy-MM')
  );
  const completeDays = new Set(
    monthCheckIns
      .filter(c => c.period === 'morning' && c.checked_out_at)
      .map(c => c.date.substring(0, 10))
      .filter(date =>
        monthCheckIns.some(c => c.date.substring(0, 10) === date && c.period === 'afternoon' && c.checked_out_at)
      )
  ).size;
  const totalWorkMinutes = monthCheckIns.reduce((sum, c) => sum + (c.work_minutes || 0), 0);
  const totalWorkHours = Math.floor(totalWorkMinutes / 60);
  const totalWorkMins = totalWorkMinutes % 60;

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayCheckIns = checkIns.filter(c => c.date.substring(0, 10) === dateStr);

      days.push(
        <DayCell
          key={dateStr}
          date={day}
          isCurrentMonth={isSameMonth(day, monthStart)}
          isTodayDate={isToday(day)}
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 월 통계 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{completeDays}</div>
              <div className="text-sm text-blue-600/70">완전 출근일</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {totalWorkHours}시간 {totalWorkMins}분
              </div>
              <div className="text-sm text-green-600/70">총 업무시간</div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-gray-50 rounded-xl p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-white rounded-lg"
              >
                ◀
              </button>
              <h3 className="text-lg font-bold">
                {format(currentMonth, 'yyyy년 M월', { locale: ko })}
              </h3>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-white rounded-lg"
              >
                ▶
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">로딩 중...</div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>완료 (오전+오후)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span>부분</span>
            </div>
          </div>

          {/* Recent check-ins list */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">이번 달 출퇴근 기록</h4>
            {monthCheckIns.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">출퇴근 기록이 없습니다.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {monthCheckIns
                  .sort((a, b) => b.date.localeCompare(a.date) || (a.period === 'morning' ? -1 : 1))
                  .map(checkIn => (
                    <div
                      key={checkIn.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {format(new Date(checkIn.date), 'M/d(E)', { locale: ko })}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          checkIn.period === 'morning'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {checkIn.period === 'morning' ? '오전' : '오후'}
                        </span>
                      </div>
                      <div className="text-gray-500">
                        {format(new Date(checkIn.checked_at), 'HH:mm')}
                        {checkIn.checked_out_at && (
                          <>
                            <span className="mx-1">→</span>
                            {format(new Date(checkIn.checked_out_at), 'HH:mm')}
                            <span className="text-green-600 ml-2">
                              ({Math.floor(checkIn.work_minutes / 60)}시간 {checkIn.work_minutes % 60}분)
                            </span>
                          </>
                        )}
                        {!checkIn.checked_out_at && (
                          <span className="text-yellow-600 ml-2">근무중</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DayCell({
  date,
  isCurrentMonth,
  isTodayDate,
  checkIns,
}: {
  date: Date;
  isCurrentMonth: boolean;
  isTodayDate: boolean;
  checkIns: CheckIn[];
}) {
  const morning = checkIns.find(c => c.period === 'morning');
  const afternoon = checkIns.find(c => c.period === 'afternoon');
  const hasMorning = !!morning;
  const hasAfternoon = !!afternoon;
  const isComplete = hasMorning && morning?.checked_out_at && hasAfternoon && afternoon?.checked_out_at;
  const isPartial = (hasMorning || hasAfternoon) && !isComplete;

  return (
    <div
      className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative ${
        !isCurrentMonth
          ? 'text-gray-300'
          : isTodayDate
          ? 'bg-blue-100 font-bold text-blue-600'
          : 'bg-white'
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
