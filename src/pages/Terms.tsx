import { Link } from 'react-router-dom';

export default function Terms() {
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
        <h1 className="text-3xl font-bold mb-8">이용약관</h1>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">제1조 (목적)</h2>
            <p className="text-gray-600 leading-relaxed">
              이 약관은 프리랜서 출퇴근 서비스(이하 "서비스")를 이용함에 있어 서비스 제공자와
              이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제2조 (정의)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>"서비스"란 프리랜서 출퇴근 앱을 통해 제공되는 출퇴근 기록 및 관리 서비스를 말합니다.</li>
              <li>"이용자"란 본 약관에 따라 서비스를 이용하는 회원을 말합니다.</li>
              <li>"회원"이란 서비스에 가입하여 이용자 아이디를 부여받은 자를 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제3조 (약관의 효력 및 변경)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>본 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.</li>
              <li>서비스 제공자는 관련 법령에 위배되지 않는 범위 내에서 본 약관을 변경할 수 있습니다.</li>
              <li>변경된 약관은 서비스 내 공지사항을 통해 공지되며, 공지 후 7일이 경과하면 효력이 발생합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제4조 (서비스의 제공)</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              서비스는 다음과 같은 기능을 제공합니다:
            </p>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>위치 기반 출퇴근 기록</li>
              <li>근무 시간 자동 계산</li>
              <li>월별 근무 통계 제공</li>
              <li>캘린더 형태의 기록 조회</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제5조 (이용자의 의무)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>이용자는 서비스 이용 시 관계 법령, 본 약관, 이용안내 등을 준수해야 합니다.</li>
              <li>이용자는 타인의 정보를 도용하거나 허위 정보를 등록해서는 안 됩니다.</li>
              <li>이용자는 서비스의 안정적 운영을 방해하는 행위를 해서는 안 됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제6조 (개인정보 보호)</h2>
            <p className="text-gray-600 leading-relaxed">
              서비스 제공자는 이용자의 개인정보를 보호하기 위해 노력하며,
              개인정보의 수집, 이용, 제공에 관한 사항은 별도의 개인정보처리방침에 따릅니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제7조 (서비스 이용의 제한)</h2>
            <p className="text-gray-600 leading-relaxed">
              서비스 제공자는 이용자가 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을
              방해한 경우, 서비스 이용을 제한하거나 회원 자격을 상실시킬 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제8조 (면책조항)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>서비스 제공자는 천재지변, 전쟁, 기간통신사업자의 서비스 중단 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
              <li>서비스 제공자는 이용자의 귀책사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</li>
              <li>GPS 위치 정보의 오차로 인한 출퇴근 기록 오류에 대해서는 책임을 지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제9조 (분쟁해결)</h2>
            <p className="text-gray-600 leading-relaxed">
              서비스 이용과 관련하여 분쟁이 발생한 경우, 양 당사자는 분쟁의 해결을 위해 성실히 협의합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">부칙</h2>
            <p className="text-gray-600 leading-relaxed">
              본 약관은 2025년 1월 1일부터 시행됩니다.
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
