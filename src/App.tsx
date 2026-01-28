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
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const fetchSettings = useAuthStore((s) => s.fetchSettings);
  const fetchCheckIns = useAuthStore((s) => s.fetchCheckIns);

  // 앱 시작 시 사용자 정보 로드
  useEffect(() => {
    const init = async () => {
      if (accessToken) {
        await fetchMe();
        await fetchSettings();
        await fetchCheckIns(format(new Date(), 'yyyy-MM-dd'));
      }
      setInitializing(false);
    };
    init();
  }, [accessToken, fetchMe, fetchSettings, fetchCheckIns]);

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
  const todayStr = format(today, 'yyyy-MM-dd');
  const workDays = settings?.work_days || [1, 2, 3, 4, 5];
  const isWorkDay = workDays.includes(today.getDay());

  const todayCheckIns = checkIns.filter((c) => c.date === todayStr);
  const hasMorning = todayCheckIns.some((c) => c.period === 'morning');
  const hasAfternoon = todayCheckIns.some((c) => c.period === 'afternoon');

  // 이번 달 통계
  const monthCheckIns = checkIns.filter((c) =>
    c.date.startsWith(format(today, 'yyyy-MM'))
  );
  const completeDays = new Set(
    monthCheckIns
      .filter((c) => c.period === 'morning')
      .map((c) => c.date)
      .filter((date) =>
        monthCheckIns.some((c) => c.date === date && c.period === 'afternoon')
      )
  ).size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">프리랜서 출근</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            설정
          </button>
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
                    radius: settings.morning_radius || 100,
                  }
                : null
            }
            disabled={!isWorkDay}
            alreadyCheckedIn={hasMorning}
          />
          <CheckInButton
            period="afternoon"
            location={
              settings?.afternoon_location_name && settings?.afternoon_lat && settings?.afternoon_lng
                ? {
                    name: settings.afternoon_location_name,
                    lat: settings.afternoon_lat,
                    lng: settings.afternoon_lng,
                    radius: settings.afternoon_radius || 100,
                  }
                : null
            }
            disabled={!isWorkDay}
            alreadyCheckedIn={hasAfternoon}
          />
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-3">이번 달 통계</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {completeDays}
              </div>
              <div className="text-sm text-gray-500">완전 출근</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {
                  new Set(
                    monthCheckIns
                      .filter(
                        (c) =>
                          !monthCheckIns.some(
                            (other) =>
                              other.date === c.date && other.period !== c.period
                          )
                      )
                      .map((c) => c.date)
                  ).size
                }
              </div>
              <div className="text-sm text-gray-500">부분 출근</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-400">
                {monthCheckIns.length}
              </div>
              <div className="text-sm text-gray-500">총 도장</div>
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
