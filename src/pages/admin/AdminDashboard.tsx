import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuthStore } from '../../stores/useAuthStore';
import { adminApi, type User, type CheckIn, type UserStats } from '../../api/client';
import { Link } from 'react-router-dom';
import UserCalendarModal from '../../components/UserCalendarModal';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [todayCheckIns, setTodayCheckIns] = useState<CheckIn[]>([]);
  const [stats, setStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'users' | 'stats'>('today');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'stats') {
      loadStats();
    }
  }, [activeTab, selectedYear, selectedMonth]);

  useEffect(() => {
    if (activeTab === 'today') {
      loadTodayCheckIns();
    }
  }, [selectedDate, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, checkInsRes] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getAllCheckIns({ date: selectedDate }),
      ]);

      if (usersRes.data) setUsers(usersRes.data.users);
      if (checkInsRes.data) setTodayCheckIns(checkInsRes.data.check_ins);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayCheckIns = async () => {
    const res = await adminApi.getAllCheckIns({ date: selectedDate });
    if (res.data) setTodayCheckIns(res.data.check_ins);
  };

  const loadStats = async () => {
    const res = await adminApi.getUserStats(selectedYear, selectedMonth);
    if (res.data) setStats(res.data.stats);
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    const res = await adminApi.updateUserRole(userId, newRole);
    if (res.data) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

  const handleCheckIn = async (userId: string, period: 'morning' | 'afternoon') => {
    const res = await adminApi.createCheckIn({
      user_id: userId,
      date: selectedDate,
      period,
      location_name: '관리자 처리',
    });
    if (res.data) {
      loadTodayCheckIns();
    }
  };

  const handleCheckOut = async (userId: string, period: 'morning' | 'afternoon') => {
    const res = await adminApi.createCheckOut({
      user_id: userId,
      date: selectedDate,
      period,
    });
    if (res.data) {
      loadTodayCheckIns();
    }
  };

  const handleDeleteCheckIn = async (checkInId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await adminApi.deleteCheckIn(checkInId);
    if (res.data) {
      loadTodayCheckIns();
    }
  };

  const getUserCheckIn = (userId: string, period: 'morning' | 'afternoon') => {
    return todayCheckIns.find(c => c.user_id === userId && c.period === period);
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">관리자 대시보드</h1>
            <span className="bg-indigo-500 px-2 py-1 rounded text-sm">{user?.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/app" className="text-indigo-200 hover:text-white text-sm">
              내 출퇴근
            </Link>
            <button onClick={logout} className="text-indigo-200 hover:text-white text-sm">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { key: 'today', label: '오늘 현황' },
              { key: 'users', label: '사용자 관리' },
              { key: 'stats', label: '월별 통계' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'today' | 'users' | 'stats')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Today Tab */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            {/* Date Selector */}
            <div className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-4">
              <label className="font-medium">날짜 선택:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded px-3 py-2"
              />
              <span className="text-gray-500">
                {format(new Date(selectedDate), 'M월 d일 EEEE', { locale: ko })}
              </span>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-indigo-600">{users.length}</div>
                <div className="text-gray-500 text-sm">전체 사용자</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-green-600">
                  {new Set(todayCheckIns.filter(c => c.period === 'morning').map(c => c.user_id)).size}
                </div>
                <div className="text-gray-500 text-sm">오전 출근</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-blue-600">
                  {new Set(todayCheckIns.filter(c => c.period === 'afternoon').map(c => c.user_id)).size}
                </div>
                <div className="text-gray-500 text-sm">오후 출근</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-orange-600">
                  {todayCheckIns.filter(c => c.checked_out_at).length}
                </div>
                <div className="text-gray-500 text-sm">퇴근 완료</div>
              </div>
            </div>

            {/* User Status Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">사용자</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">오전</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">오후</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => {
                    const morning = getUserCheckIn(u.id, 'morning');
                    const afternoon = getUserCheckIn(u.id, 'afternoon');
                    return (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium">{u.name}</div>
                              <div className="text-sm text-gray-500">{u.email}</div>
                            </div>
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
                              title="달력으로 보기"
                            >
                              📅
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {morning ? (
                            <div className="space-y-1">
                              <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                morning.checked_out_at ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {morning.checked_out_at ? '퇴근완료' : '근무중'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(morning.checked_at), 'HH:mm')}
                                {morning.checked_out_at && ` - ${format(new Date(morning.checked_out_at), 'HH:mm')}`}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">미출근</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {afternoon ? (
                            <div className="space-y-1">
                              <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                afternoon.checked_out_at ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {afternoon.checked_out_at ? '퇴근완료' : '근무중'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(afternoon.checked_at), 'HH:mm')}
                                {afternoon.checked_out_at && ` - ${format(new Date(afternoon.checked_out_at), 'HH:mm')}`}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">미출근</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {!morning && (
                              <button
                                onClick={() => handleCheckIn(u.id, 'morning')}
                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                              >
                                오전출근
                              </button>
                            )}
                            {morning && !morning.checked_out_at && (
                              <button
                                onClick={() => handleCheckOut(u.id, 'morning')}
                                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                              >
                                오전퇴근
                              </button>
                            )}
                            {!afternoon && (
                              <button
                                onClick={() => handleCheckIn(u.id, 'afternoon')}
                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                              >
                                오후출근
                              </button>
                            )}
                            {afternoon && !afternoon.checked_out_at && (
                              <button
                                onClick={() => handleCheckOut(u.id, 'afternoon')}
                                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                              >
                                오후퇴근
                              </button>
                            )}
                            {(morning || afternoon) && (
                              <button
                                onClick={() => {
                                  if (morning) handleDeleteCheckIn(morning.id);
                                  if (afternoon) handleDeleteCheckIn(afternoon.id);
                                }}
                                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">이름</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">이메일</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">역할</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">연차</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">가입일</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{u.name}</span>
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
                          title="달력으로 보기"
                        >
                          📅
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role === 'admin' ? '관리자' : '일반'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{u.extra_days}일</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                      {format(new Date(u.created_at), 'yyyy.MM.dd')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleRoleChange(u.id, u.role === 'admin' ? 'user' : 'admin')}
                          className={`text-xs px-2 py-1 rounded ${
                            u.role === 'admin'
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-purple-500 text-white hover:bg-purple-600'
                          }`}
                        >
                          {u.role === 'admin' ? '관리자 해제' : '관리자 지정'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Month Selector */}
            <div className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-4">
              <label className="font-medium">월 선택:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border rounded px-3 py-2"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border rounded px-3 py-2"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}월</option>
                ))}
              </select>
            </div>

            {/* Stats Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">사용자</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">출근일수</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">총 근무시간</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">잔여 연차</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium">{s.name}</div>
                            <div className="text-sm text-gray-500">{s.email}</div>
                          </div>
                          <button
                            onClick={() => {
                              const userObj = users.find(u => u.id === s.id);
                              if (userObj) setSelectedUser(userObj);
                            }}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
                            title="달력으로 보기"
                          >
                            📅
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium">{s.total_days}일</td>
                      <td className="px-4 py-3 text-center font-medium">{formatMinutes(s.total_minutes)}</td>
                      <td className="px-4 py-3 text-center">{s.extra_days}일</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* User Calendar Modal */}
      {selectedUser && (
        <UserCalendarModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
