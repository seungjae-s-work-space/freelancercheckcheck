import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">📍 프리랜서 출퇴근</Link>
          <Link
            to="/login"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition"
          >
            시작하기
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. 개인정보의 수집 및 이용 목적</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              프리랜서 출퇴근 서비스(이하 "서비스")는 다음의 목적을 위하여 개인정보를 수집 및 이용합니다.
            </p>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 회원자격 유지·관리</li>
              <li>서비스 제공: 출퇴근 기록, 근무 통계 제공 등 서비스 이용에 필요한 기능 제공</li>
              <li>서비스 개선: 서비스 이용 현황 분석 및 서비스 개선</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. 수집하는 개인정보 항목</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li><strong>필수항목:</strong> 이메일 주소, 비밀번호</li>
              <li><strong>서비스 이용 시 수집:</strong> 위치 정보(출퇴근 기록 시), 출퇴근 시간, 근무지 정보</li>
              <li><strong>자동 수집:</strong> 서비스 이용 기록, 접속 로그, 기기 정보</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              이용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용 목적이 달성되면 지체 없이 파기합니다.
            </p>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>회원 탈퇴 시: 즉시 파기</li>
              <li>관계 법령에 따른 보존: 계약 또는 청약철회 등에 관한 기록(5년), 소비자 불만 또는 분쟁처리에 관한 기록(3년)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. 위치정보의 수집 및 이용</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              서비스는 출퇴근 기록을 위해 위치정보를 수집합니다.
            </p>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li><strong>수집 시점:</strong> 출근 또는 퇴근 버튼 클릭 시에만 일회성으로 수집</li>
              <li><strong>이용 목적:</strong> 설정된 근무지와 현재 위치 비교를 통한 출퇴근 확인</li>
              <li><strong>보관:</strong> 위치정보는 출퇴근 기록의 일부로 저장되며, 회원 탈퇴 시 삭제</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              위치정보는 이용자의 명시적 동의 하에 수집되며, 출퇴근 버튼 클릭 시에만 수집됩니다.
              백그라운드에서 위치를 추적하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. 개인정보의 제3자 제공</h2>
            <p className="text-gray-600 leading-relaxed">
              서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
              다만, 다음의 경우에는 예외로 합니다:
            </p>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside mt-4">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. 개인정보의 파기 절차 및 방법</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li><strong>파기 절차:</strong> 이용자가 회원 탈퇴를 요청하면 지체 없이 파기합니다.</li>
              <li><strong>파기 방법:</strong> 전자적 파일 형태의 정보는 복구 불가능한 방법으로 영구 삭제합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. 이용자의 권리와 행사 방법</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:
            </p>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리 정지 요구</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              위 권리 행사는 서비스 내 설정 메뉴를 통해 직접 하거나, 고객센터를 통해 요청할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. 개인정보 보호를 위한 기술적·관리적 대책</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>비밀번호 암호화 저장</li>
              <li>SSL/TLS를 통한 데이터 전송 암호화</li>
              <li>접근 권한 관리 및 접근 통제</li>
              <li>개인정보 취급 직원의 최소화</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. 쿠키의 사용</h2>
            <p className="text-gray-600 leading-relaxed">
              서비스는 로그인 상태 유지를 위해 쿠키 또는 로컬 스토리지를 사용합니다.
              이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나,
              이 경우 서비스 이용에 어려움이 있을 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. 개인정보처리방침의 변경</h2>
            <p className="text-gray-600 leading-relaxed">
              본 개인정보처리방침은 법령, 정책 또는 서비스의 변경에 따라 수정될 수 있습니다.
              변경 시 서비스 내 공지사항을 통해 안내드립니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">부칙</h2>
            <p className="text-gray-600 leading-relaxed">
              본 개인정보처리방침은 2025년 1월 1일부터 시행됩니다.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <div className="flex justify-center gap-6 mb-4">
            <Link to="/terms" className="hover:text-white transition">이용약관</Link>
            <Link to="/privacy" className="hover:text-white transition">개인정보처리방침</Link>
          </div>
          <p>© 2025 프리랜서 출퇴근. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
