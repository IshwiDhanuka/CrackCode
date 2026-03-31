import { Navigate } from 'react-router-dom';
import { isTokenExpired } from '../../pages/Login';

/**
 * SECURITY V3 FIX: Check token expiry on every protected route render.
 * SECURITY V4 FIX: Never trust localStorage.user.role alone for access decisions —
 *   that check belongs on the backend. PrivateRoute only gates "is user logged in".
 *   Admin-specific pages use AdminRoute below.
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token || isTokenExpired(token)) {
    // Clear stale data on expiry
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * SECURITY V4 FIX: Separate AdminRoute — still client-side only,
 * but at least prevents accidental navigation. The real enforcement
 * must be on the backend via adminMiddleware on every admin API route.
 */
export const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // Client-side role check — decorative only. Backend adminMiddleware is the real gate.
  if (!user || user.role !== 'admin') {
    return <Navigate to="/problems" replace />;
  }

  return children;
};

export default PrivateRoute;