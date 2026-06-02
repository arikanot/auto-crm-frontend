import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./features/auth/Login";
import { Dashboard } from "./features/auth/dashboard/Dashboard";
import { AdminPanel } from "./features/auth/admin/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичный роут: Авторизация */}
        <Route path="/login" element={<Login />} />

        {/* Защищенные роуты для ВСЕХ сотрудников СТО (Доступно после логина) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Защищенные роуты ТОЛЬКО для роли 'admin' */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        {/* Автоматический редирект с любой неизвестной страницы на dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
