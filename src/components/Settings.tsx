import { useAuthStore } from '../stores/useAuthStore';

interface Props {
  onClose: () => void;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function Settings({ onClose }: Props) {
  const settings = useAuthStore((s) => s.settings);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const workDays = settings?.work_days || [];

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">설정</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* 사용자 정보 */}
          {user && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          )}

          {/* 출근 요일 (읽기 전용) */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">출근 요일</h3>
            <div className="flex gap-2">
              {DAY_NAMES.map((name, idx) => (
                <div
                  key={idx}
                  className={`w-10 h-10 rounded-full font-medium flex items-center justify-center ${
                    workDays.includes(idx)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>

          {/* 오전 출근 장소 (읽기 전용) */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">오전 출근 장소</h3>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="font-medium">
                {settings?.morning_location_name || '설정되지 않음'}
              </div>
            </div>
          </div>

          {/* 오후 출근 장소 (읽기 전용) */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">오후 출근 장소</h3>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="font-medium">
                {settings?.afternoon_location_name || '설정되지 않음'}
              </div>
            </div>
          </div>

          {/* 안내 문구 */}
          <div className="mb-6 p-3 bg-yellow-50 rounded-xl text-sm text-yellow-700">
            설정은 처음 가입 시에만 지정할 수 있습니다.
          </div>

          {/* 로그아웃 */}
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
