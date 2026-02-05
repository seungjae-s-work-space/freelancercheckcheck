import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  // 로그인 안 되어 있으면 로그인 페이지로
  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  // 관리자가 아니면 일반 앱으로
  if (user.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
