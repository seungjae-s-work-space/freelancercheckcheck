import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import PlaceSearch from './PlaceSearch';

interface Props {
  onClose: () => void;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function Settings({ onClose }: Props) {
  const settings = useAuthStore((s) => s.settings);
  const updateSettings = useAuthStore((s) => s.updateSettings);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [saving, setSaving] = useState(false);

  const workDays = settings?.work_days || [1, 2, 3, 4, 5];

  const handleToggleWorkDay = async (day: number) => {
    setSaving(true);
    const newDays = workDays.includes(day)
      ? workDays.filter((d) => d !== day)
      : [...workDays, day].sort();
    await updateSettings({ work_days: newDays });
    setSaving(false);
  };

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

          {/* 출근 요일 */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">출근 요일</h3>
            <div className="flex gap-2">
              {DAY_NAMES.map((name, idx) => (
                <button
                  key={idx}
                  onClick={() => handleToggleWorkDay(idx)}
                  disabled={saving}
                  className={`w-10 h-10 rounded-full font-medium transition-all ${
                    workDays.includes(idx)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                  } ${saving ? 'opacity-50' : ''}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* 오전 위치 */}
          <LocationSetting
            label="오전 출근 위치"
            locationName={settings?.morning_location_name || ''}
            lat={settings?.morning_lat}
            lng={settings?.morning_lng}
            radius={settings?.morning_radius || 100}
            onSave={async (loc) => {
              await updateSettings({
                morning_location_name: loc.name,
                morning_lat: loc.lat,
                morning_lng: loc.lng,
                morning_radius: loc.radius,
              });
            }}
          />

          {/* 오후 위치 */}
          <LocationSetting
            label="오후 출근 위치"
            locationName={settings?.afternoon_location_name || ''}
            lat={settings?.afternoon_lat}
            lng={settings?.afternoon_lng}
            radius={settings?.afternoon_radius || 100}
            onSave={async (loc) => {
              await updateSettings({
                afternoon_location_name: loc.name,
                afternoon_lat: loc.lat,
                afternoon_lng: loc.lng,
                afternoon_radius: loc.radius,
              });
            }}
          />

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

function LocationSetting({
  label,
  locationName,
  lat,
  lng,
  radius,
  onSave,
}: {
  label: string;
  locationName: string;
  lat?: number;
  lng?: number;
  radius: number;
  onSave: (loc: { name: string; lat: number; lng: number; radius: number }) => Promise<void>;
}) {
  const hasLocation = locationName && lat !== undefined && lng !== undefined;
  const [editing, setEditing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [name, setName] = useState(locationName);
  const [latNum, setLatNum] = useState(lat);
  const [lngNum, setLngNum] = useState(lng);
  const [radiusStr, setRadiusStr] = useState(radius.toString());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(locationName);
    setLatNum(lat);
    setLngNum(lng);
    setRadiusStr(radius.toString());
  }, [locationName, lat, lng, radius]);

  const handlePlaceSelect = (place: { name: string; lat: number; lng: number }) => {
    setName(place.name);
    setLatNum(place.lat);
    setLngNum(place.lng);
    setShowSearch(false);
  };

  const handleSave = async () => {
    if (!name || latNum === undefined || lngNum === undefined) {
      alert('장소를 선택해주세요');
      return;
    }

    setSaving(true);
    await onSave({
      name,
      lat: latNum,
      lng: lngNum,
      radius: parseInt(radiusStr) || 100,
    });
    setSaving(false);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="mb-6">
        <h3 className="font-semibold mb-3">{label}</h3>
        {hasLocation ? (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{locationName}</div>
                <div className="text-sm text-gray-500">
                  반경 {radius}m
                </div>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="text-blue-500 text-sm font-medium"
              >
                수정
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500"
          >
            + 위치 추가
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-3">{label}</h3>
      <div className="space-y-3">
        {/* 선택된 장소 표시 또는 검색 버튼 */}
        {name && latNum !== undefined ? (
          <div className="p-3 bg-blue-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-blue-800">{name}</div>
                <div className="text-xs text-blue-600">
                  {latNum.toFixed(6)}, {lngNum?.toFixed(6)}
                </div>
              </div>
              <button
                onClick={() => setShowSearch(true)}
                className="text-blue-600 text-sm font-medium"
              >
                변경
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100"
          >
            장소 검색하기
          </button>
        )}

        {/* 반경 설정 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">인식 반경:</span>
          <input
            type="number"
            value={radiusStr}
            onChange={(e) => setRadiusStr(e.target.value)}
            className="w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">미터</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setEditing(false)}
            className="flex-1 py-3 bg-gray-100 rounded-xl font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name}
            className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* 장소 검색 모달 */}
      {showSearch && (
        <PlaceSearch
          onSelect={handlePlaceSelect}
          onCancel={() => setShowSearch(false)}
          initialQuery={name}
        />
      )}
    </div>
  );
}
