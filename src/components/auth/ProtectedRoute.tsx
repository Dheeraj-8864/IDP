import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
  requiredRole?: string[];
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/auth',
  requiredRole 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Prevent back button navigation to login page when authenticated
  useEffect(() => {
    if (user) {
      window.history.pushState(null, '', window.location.pathname);
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.pathname);
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [user]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access if required
  if (requiredRole && requiredRole.length > 0) {
    if (!user.role || !requiredRole.includes(user.role)) {
      // Redirect to appropriate dashboard based on user role
      const roleRedirects = {
        'user': '/user-dashboard',
        'admin': '/admin-dashboard',
        'superadmin': '/superadmin-dashboard'
      };
      
      const defaultRedirect = roleRedirects[user.role as keyof typeof roleRedirects] || '/dashboard';
      return <Navigate to={defaultRedirect} replace />;
    }
  }

  // Render children if provided, otherwise use Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
}

// Convenience components for specific roles
export function AdminRoute({ children }: { children?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={['admin', 'superadmin']}>
      {children}
    </ProtectedRoute>
  );
}

export function SuperAdminRoute({ children }: { children?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={['superadmin']}>
      {children}
    </ProtectedRoute>
  );
}

export function UserRoute({ children }: { children?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={['user', 'admin', 'superadmin']}>
      {children}
    </ProtectedRoute>
  );
}