import { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { getCurrentPosition, isWithinRadius } from '../utils/geo';
import { format } from 'date-fns';
import type { CheckIn } from '../api/client';

interface Location {
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

interface Props {
  period: 'morning' | 'afternoon';
  location: Location | null;
  disabled: boolean;
  checkIn: CheckIn | null; // 해당 period의 출퇴근 기록
  canCheckIn: boolean; // 출근 가능 여부 (오전 퇴근 안했으면 오후 출근 불가)
}

function formatWorkTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}시간 ${mins}분`;
  }
  return `${mins}분`;
}

export default function CheckInButton({
  period,
  location,
  disabled,
  checkIn,
  canCheckIn,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createCheckIn = useAuthStore((s) => s.createCheckIn);
  const checkOutAction = useAuthStore((s) => s.checkOut);

  const handleCheckIn = async () => {
    if (!location) {
      setError('위치가 설정되지 않았습니다');
      return;
    }

    if (!canCheckIn) {
      setError('오전 퇴근을 먼저 해주세요');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const withinRadius = isWithinRadius(
        latitude,
        longitude,
        location.lat,
        location.lng,
        location.radius
      );

      if (!withinRadius) {
        setError(`${location.name} 근처가 아닙니다`);
        setLoading(false);
        return;
      }

      const success = await createCheckIn({
        date: format(new Date(), 'yyyy-MM-dd'),
        period,
        location_name: location.name,
        lat: latitude,
        lng: longitude,
      });

      if (!success) {
        setError('출근 기록에 실패했습니다');
      }
    } catch {
      setError('위치를 가져올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError(null);

    try {
      const success = await checkOutAction(format(new Date(), 'yyyy-MM-dd'), period);
      if (!success) {
        setError('퇴근 기록에 실패했습니다');
      }
    } catch {
      setError('퇴근 처리 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const periodLabel = period === 'morning' ? '오전' : '오후';
  const periodIcon = period === 'morning' ? '🌅' : '🌆';

  // 퇴근 완료 상태
  if (checkIn?.checked_out_at) {
    return (
      <div className="p-6 bg-green-50 rounded-2xl border-2 border-green-200">
        <div className="text-center">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-green-700 font-semibold">{periodLabel} 완료</div>
          <div className="text-sm text-green-600 mt-1">{location?.name}</div>
          <div className="text-xs text-green-500 mt-2">
            업무시간: {formatWorkTime(checkIn.work_minutes)}
          </div>
        </div>
      </div>
    );
  }

  // 출근 완료, 퇴근 대기 상태
  if (checkIn && !checkIn.checked_out_at) {
    return (
      <div className="p-6 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
        <div className="text-center mb-4">
          <div className="text-2xl mb-1">⏰</div>
          <div className="font-semibold text-yellow-800">{periodLabel} 출근 중</div>
          <div className="text-sm text-yellow-600 mt-1">{location?.name}</div>
          <div className="text-xs text-yellow-500 mt-1">
            출근: {format(new Date(checkIn.checked_at), 'HH:mm')}
          </div>
        </div>

        <button
          onClick={handleCheckOut}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
            loading
              ? 'bg-yellow-100 text-yellow-400'
              : 'bg-yellow-500 text-white hover:bg-yellow-600 active:scale-95'
          }`}
        >
          {loading ? '처리 중...' : '퇴근하기'}
        </button>

        {error && (
          <div className="mt-3 text-sm text-red-500 text-center">{error}</div>
        )}
      </div>
    );
  }

  // 출근 전 상태
  return (
    <div className="p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
      <div className="text-center mb-4">
        <div className="text-2xl mb-1">{periodIcon}</div>
        <div className="font-semibold text-gray-800">{periodLabel} 출근</div>
        {location && (
          <div className="text-sm text-gray-500 mt-1">{location.name}</div>
        )}
      </div>

      <button
        onClick={handleCheckIn}
        disabled={disabled || loading || !location || !canCheckIn}
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
          disabled || !location || !canCheckIn
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : loading
            ? 'bg-blue-100 text-blue-400'
            : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
        }`}
      >
        {loading
          ? '확인 중...'
          : !location
          ? '위치 설정 필요'
          : !canCheckIn
          ? '오전 퇴근 필요'
          : '출근 도장 찍기'}
      </button>

      {error && (
        <div className="mt-3 text-sm text-red-500 text-center">{error}</div>
      )}
    </div>
  );
}
