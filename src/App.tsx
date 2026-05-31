import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./features/auth/Login";

const DashboardPlaceholder = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-800">Главная панель СТО</h1>
    <p className="mt-2 text-gray-600">Вы успешно авторизовались в CRM!</p>
  </div>
);

const AdminPlaceholder = () => (
  <div className="p-8 bg-red-50 min-h-screen">
    <h1 className="text-3xl font-bold text-red-700">Админка (Настройки СТО)</h1>
    <p className="mt-2 text-red-600">Сюда имеет доступ ТОЛЬКО роль admin.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные роуты */}
        <Route path="/login" element={<Login />} />

        {/* Защищенные роуты для ВСЕХ сотрудников СТО */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
        </Route>

        {/* Защищенные роуты ТОЛЬКО для Администратора */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminPlaceholder />} />
        </Route>

        {/* Авторедирект с любой неизвестной страницы на dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
