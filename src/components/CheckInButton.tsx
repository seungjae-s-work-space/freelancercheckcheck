import { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { getCurrentPosition, isWithinRadius } from '../utils/geo';
import { format } from 'date-fns';

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
  alreadyCheckedIn: boolean;
}

export default function CheckInButton({
  period,
  location,
  disabled,
  alreadyCheckedIn,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createCheckIn = useAuthStore((s) => s.createCheckIn);

  const handleCheckIn = async () => {
    if (!location) {
      setError('위치가 설정되지 않았습니다');
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

      // 서버에 출근 도장!
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

  const label = period === 'morning' ? '오전 출근' : '오후 출근';

  if (alreadyCheckedIn) {
    return (
      <div className="p-6 bg-green-50 rounded-2xl border-2 border-green-200">
        <div className="text-center">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-green-700 font-semibold">{label} 완료!</div>
          <div className="text-sm text-green-600 mt-1">{location?.name}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
      <div className="text-center mb-4">
        <div className="text-2xl mb-1">{period === 'morning' ? '🌅' : '🌆'}</div>
        <div className="font-semibold text-gray-800">{label}</div>
        {location && (
          <div className="text-sm text-gray-500 mt-1">{location.name}</div>
        )}
      </div>

      <button
        onClick={handleCheckIn}
        disabled={disabled || loading || !location}
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
          disabled || !location
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : loading
            ? 'bg-blue-100 text-blue-400'
            : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
        }`}
      >
        {loading ? '확인 중...' : !location ? '위치 설정 필요' : '출근 도장 찍기'}
      </button>

      {error && (
        <div className="mt-3 text-sm text-red-500 text-center">{error}</div>
      )}
    </div>
  );
}
