import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">📍 프리랜서 출퇴근</h1>
          <Link
            to="/login"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition"
          >
            시작하기
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          프리랜서를 위한<br />
          <span className="text-blue-500">스마트 출퇴근 관리</span>
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          위치 기반으로 자동 출퇴근을 기록하고, 월별 근무 통계를 한눈에 확인하세요.
          프리랜서, 재택근무자, 자영업자를 위한 최적의 근태관리 솔루션입니다.
        </p>
        <Link
          to="/login"
          className="inline-block bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30"
        >
          무료로 시작하기
        </Link>
      </section>

      {/* Features Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold text-center mb-12">주요 기능</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">📍</div>
            <h4 className="text-lg font-semibold mb-2">위치 기반 출퇴근</h4>
            <p className="text-gray-600">
              설정한 장소에서만 출퇴근 기록이 가능합니다.
              GPS를 활용해 정확한 근무지 확인이 가능합니다.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">📊</div>
            <h4 className="text-lg font-semibold mb-2">월별 통계</h4>
            <p className="text-gray-600">
              한 달 동안의 근무일수, 총 근무시간을
              자동으로 계산해 보여드립니다.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">📅</div>
            <h4 className="text-lg font-semibold mb-2">캘린더 뷰</h4>
            <p className="text-gray-600">
              달력 형태로 출퇴근 기록을 확인하세요.
              오전/오후 근무를 색상으로 구분해 표시합니다.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-12">이용 방법</h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-lg">회원가입</h4>
                <p className="text-gray-600">이메일과 비밀번호로 간단하게 가입하세요.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-lg">근무지 설정</h4>
                <p className="text-gray-600">오전/오후 근무지를 검색해서 등록합니다.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-lg">출퇴근 기록</h4>
                <p className="text-gray-600">근무지에서 버튼 한 번으로 출퇴근을 기록하세요.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold text-center mb-12">이런 분들께 추천합니다</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl">
            <h4 className="font-semibold mb-2">💼 프리랜서</h4>
            <p className="text-gray-600">여러 클라이언트의 근무지를 오가며 일하는 프리랜서</p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl">
            <h4 className="font-semibold mb-2">🏠 재택근무자</h4>
            <p className="text-gray-600">집과 카페를 오가며 유연하게 일하는 재택근무자</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl">
            <h4 className="font-semibold mb-2">🏪 자영업자</h4>
            <p className="text-gray-600">매장 운영 시간을 체계적으로 관리하고 싶은 자영업자</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-xl">
            <h4 className="font-semibold mb-2">📚 스터디</h4>
            <p className="text-gray-600">독서실, 카페에서 공부 시간을 기록하고 싶은 학생</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-500 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            지금 바로 시작하세요
          </h3>
          <p className="text-blue-100 mb-8">
            무료로 사용할 수 있습니다. 복잡한 설정 없이 바로 시작하세요.
          </p>
          <Link
            to="/login"
            className="inline-block bg-white text-blue-500 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h4 className="text-white font-bold text-lg mb-2">📍 프리랜서 출퇴근</h4>
              <p className="text-sm">프리랜서를 위한 스마트 출퇴근 관리 서비스</p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/terms" className="hover:text-white transition">이용약관</Link>
              <Link to="/privacy" className="hover:text-white transition">개인정보처리방침</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © 2025 프리랜서 출퇴근. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
