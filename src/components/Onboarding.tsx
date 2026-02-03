import { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import PlaceSearch from './PlaceSearch';

interface Props {
  onComplete: () => void;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function Onboarding({ onComplete }: Props) {
  const updateSettings = useAuthStore((s) => s.updateSettings);
  const logout = useAuthStore((s) => s.logout);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // 설정 상태
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [morningPlace, setMorningPlace] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [afternoonPlace, setAfternoonPlace] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [showMorningSearch, setShowMorningSearch] = useState(false);
  const [showAfternoonSearch, setShowAfternoonSearch] = useState(false);

  const toggleWorkDay = (day: number) => {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleComplete = async () => {
    if (workDays.length === 0) {
      alert('출근 요일을 선택해주세요');
      return;
    }
    if (!morningPlace) {
      alert('오전 출근 장소를 선택해주세요');
      return;
    }
    if (!afternoonPlace) {
      alert('오후 출근 장소를 선택해주세요');
      return;
    }

    setSaving(true);
    const success = await updateSettings({
      work_days: workDays,
      morning_location_name: morningPlace.name,
      morning_lat: morningPlace.lat,
      morning_lng: morningPlace.lng,
      morning_radius: 100,
      afternoon_location_name: afternoonPlace.name,
      afternoon_lat: afternoonPlace.lat,
      afternoon_lng: afternoonPlace.lng,
      afternoon_radius: 100,
    });
    setSaving(false);

    if (success) {
      onComplete();
    } else {
      alert('설정 저장에 실패했습니다');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">
        {/* 로그아웃 버튼 */}
        <div className="flex justify-end mb-4">
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            로그아웃
          </button>
        </div>
        {/* Step 1: 출근 요일 */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-2">출근 요일 선택</h2>
            <p className="text-gray-500 text-sm mb-6">출근하는 요일을 선택하세요</p>

            <div className="flex gap-2 mb-8">
              {DAY_NAMES.map((name, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleWorkDay(idx)}
                  className={`w-10 h-10 rounded-full font-medium transition-all ${
                    workDays.includes(idx)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={workDays.length === 0}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium disabled:opacity-50"
            >
              다음
            </button>
          </>
        )}

        {/* Step 2: 오전 장소 */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold mb-2">오전 출근 장소</h2>
            <p className="text-gray-500 text-sm mb-6">오전에 출근 도장을 찍을 장소를 선택하세요</p>

            {morningPlace ? (
              <div className="p-4 bg-blue-50 rounded-xl mb-6">
                <div className="font-medium text-blue-800">{morningPlace.name}</div>
                <button
                  onClick={() => setShowMorningSearch(true)}
                  className="text-blue-600 text-sm mt-2"
                >
                  변경하기
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowMorningSearch(true)}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 mb-6"
              >
                + 장소 검색하기
              </button>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-medium"
              >
                이전
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!morningPlace}
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </>
        )}

        {/* Step 3: 오후 장소 */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-bold mb-2">오후 출근 장소</h2>
            <p className="text-gray-500 text-sm mb-6">오후에 출근 도장을 찍을 장소를 선택하세요</p>

            {afternoonPlace ? (
              <div className="p-4 bg-blue-50 rounded-xl mb-6">
                <div className="font-medium text-blue-800">{afternoonPlace.name}</div>
                <button
                  onClick={() => setShowAfternoonSearch(true)}
                  className="text-blue-600 text-sm mt-2"
                >
                  변경하기
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAfternoonSearch(true)}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 mb-6"
              >
                + 장소 검색하기
              </button>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-medium"
              >
                이전
              </button>
              <button
                onClick={handleComplete}
                disabled={!afternoonPlace || saving}
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {saving ? '저장 중...' : '완료'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* 장소 검색 모달 */}
      {showMorningSearch && (
        <PlaceSearch
          onSelect={(place) => {
            setMorningPlace(place);
            setShowMorningSearch(false);
          }}
          onCancel={() => setShowMorningSearch(false)}
        />
      )}
      {showAfternoonSearch && (
        <PlaceSearch
          onSelect={(place) => {
            setAfternoonPlace(place);
            setShowAfternoonSearch(false);
          }}
          onCancel={() => setShowAfternoonSearch(false)}
        />
      )}
    </div>
  );
}
