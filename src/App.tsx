import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuthStore } from './stores/useAuthStore';
import CheckInButton from './components/CheckInButton';
import Calendar from './components/Calendar';
import Settings from './components/Settings';
import AuthForm from './components/AuthForm';
import Onboarding from './components/Onboarding';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const settings = useAuthStore((s) => s.settings);
  const checkIns = useAuthStore((s) => s.checkIns);
  const todayCheckIns = useAuthStore((s) => s.todayCheckIns);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const fetchSettings = useAuthStore((s) => s.fetchSettings);
  const fetchTodayCheckIns = useAuthStore((s) => s.fetchTodayCheckIns);
  const fetchCheckInsByMonth = useAuthStore((s) => s.fetchCheckInsByMonth);

  // 앱 시작 시 사용자 정보 로드
  useEffect(() => {
    const init = async () => {
      if (accessToken) {
        await fetchMe();
        await fetchSettings();
        // 오늘 출근 기록 가져오기 (별도 관리)
        await fetchTodayCheckIns();
        // 이번 달 전체 출근 기록 가져오기 (캘린더용)
        const now = new Date();
        await fetchCheckInsByMonth(now.getFullYear(), now.getMonth() + 1);
      }
      setInitializing(false);
    };
    init();
  }, [accessToken, fetchMe, fetchSettings, fetchTodayCheckIns, fetchCheckInsByMonth]);

  // 로딩 중
  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // 로그인 필요
  if (!accessToken || !user) {
    return <AuthForm />;
  }

  // 온보딩 필요 (설정이 없는 경우)
  const needsOnboarding = !settings?.morning_location_name || !settings?.afternoon_location_name;
  if (needsOnboarding) {
    return <Onboarding onComplete={() => fetchSettings()} />;
  }

  const today = new Date();
  const workDays = settings?.work_days || [1, 2, 3, 4, 5];
  const isWorkDay = workDays.includes(today.getDay());

  const morningCheckIn = todayCheckIns.find((c) => c.period === 'morning') || null;
  const afternoonCheckIn = todayCheckIns.find((c) => c.period === 'afternoon') || null;

  // 오후 출근 가능 조건: 오전 출근 안 했거나, 오전 퇴근 완료
  const canAfternoonCheckIn = !morningCheckIn || !!morningCheckIn.checked_out_at;

  // 이번 달 통계
  const monthCheckIns = checkIns.filter((c) =>
    c.date.substring(0, 7) === format(today, 'yyyy-MM')
  );
  // 완전 출근: 오전/오후 모두 퇴근까지 완료
  const completeDays = new Set(
    monthCheckIns
      .filter((c) => c.period === 'morning' && c.checked_out_at)
      .map((c) => c.date.substring(0, 10))
      .filter((date) =>
        monthCheckIns.some((c) => c.date.substring(0, 10) === date && c.period === 'afternoon' && c.checked_out_at)
      )
  ).size;
  // 총 업무시간 (분)
  const totalWorkMinutes = monthCheckIns.reduce((sum, c) => sum + (c.work_minutes || 0), 0);
  const totalWorkHours = Math.floor(totalWorkMinutes / 60);
  const totalWorkMins = totalWorkMinutes % 60;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">프리랜서 출근</h1>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              🎫 연차 {user?.extra_days ?? 0}일
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              설정
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Today */}
        <div className="text-center">
          <div className="text-2xl font-bold mb-1">
            {format(today, 'M월 d일 EEEE', { locale: ko })}
          </div>
          {isWorkDay ? (
            <div className="text-green-600 font-medium">출근일</div>
          ) : (
            <div className="text-gray-400">휴무일</div>
          )}
        </div>

        {/* Check-in Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <CheckInButton
            period="morning"
            location={
              settings?.morning_location_name && settings?.morning_lat && settings?.morning_lng
                ? {
                    name: settings.morning_location_name,
                    lat: settings.morning_lat,
                    lng: settings.morning_lng,
                    radius: 200,
                  }
                : null
            }
            disabled={false}
            checkIn={morningCheckIn}
            canCheckIn={true}
            isExtraDay={!isWorkDay}
          />
          <CheckInButton
            period="afternoon"
            location={
              settings?.afternoon_location_name && settings?.afternoon_lat && settings?.afternoon_lng
                ? {
                    name: settings.afternoon_location_name,
                    lat: settings.afternoon_lat,
                    lng: settings.afternoon_lng,
                    radius: 200,
                  }
                : null
            }
            disabled={false}
            checkIn={afternoonCheckIn}
            canCheckIn={canAfternoonCheckIn}
            isExtraDay={!isWorkDay}
          />
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-3">이번 달 통계</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {completeDays}
              </div>
              <div className="text-sm text-gray-500">완전 출근일</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {totalWorkHours}시간 {totalWorkMins}분
              </div>
              <div className="text-sm text-gray-500">총 업무시간</div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <Calendar />
      </main>

      {/* Settings Modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
