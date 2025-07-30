import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router';

// Simulate getting user role (replace with your actual user context/store)

interface ProtectedSuperAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedSuperAdminRoute: React.FC<ProtectedSuperAdminRouteProps> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) {
          setIsAuthenticated(false);
          setIsSuperAdmin(false);
        } else {
          const data = await res.json();
          setIsAuthenticated(!!data.authenticated);
          setIsSuperAdmin(!!(data.user && data.user.isSuperAdmin));
        }
      } catch {
        setIsAuthenticated(false);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }
  if (!isAuthenticated || !isSuperAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedSuperAdminRoute;
