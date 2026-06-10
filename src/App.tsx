import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./features/auth/Login";
import { Dashboard } from "./features/auth/dashboard/Dashboard";
import { AdminPanel } from "./features/auth/admin/AdminPanel";
import { ClientDetail } from "./pages/ClientDetail";
import { RepairsList } from "./features/repairs/RepairsList";
import { PartsList } from "./features/parts/PartsList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичный роут: Авторизация */}
        <Route path="/login" element={<Login />} />

        {/* Защищенные роуты для ВСЕХ сотрудников СТО (Доступно после логина) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/repairs" element={<RepairsList />} />
          <Route path="/parts" element={<PartsList />} />
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
