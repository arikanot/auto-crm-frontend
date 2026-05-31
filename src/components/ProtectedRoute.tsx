import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

interface ProtectedRouteProps {
  allowedRoles?: ("admin" | "manager" | "mechanic")[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  // 1. Если не авторизован — отправляем на логи
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // 2. Если роль пользователя не подходит под разрешенные — кидаем на главную панель
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  // Если всё ок — рендерим дочерние компоненты (страницы)
  return <Outlet />;
};
