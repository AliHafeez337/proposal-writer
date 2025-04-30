import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  console.log('ProtectedRoute user:', user);
  console.log('ProtectedRoute loading:', loading);

  if (loading) return <div>Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;