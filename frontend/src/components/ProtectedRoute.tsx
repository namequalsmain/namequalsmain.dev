import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '@/lib/auth';

/** Wrap admin routes — kicks to /admin/login if no token. */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
