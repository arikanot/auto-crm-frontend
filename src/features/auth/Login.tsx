import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getCsrfCookie } from "../../api/axios";
import { useAuthStore } from "../../store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Инициализируем CSRF-защиту Laravel Sanctum
      await getCsrfCookie();

      // 2. Отправляем запрос на логин
      const response = await api.post("/api/login", { email, password });

      // 3. Сохраняем пользователя в глобальный стейт Zustand
      setUser(response.data.user);

      // 3. КРИТИЧЕСКИ ВАЖНО: Сбрасываем кэш запросов, чтобы React Query сделал СВЕЖИЙ запрос к API
      await queryClient.invalidateQueries({ queryKey: ["clients"] });

      // 4. Перенаправляем на главную панель СТО
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);

      // Безопасная проверка: если Laravel вернул ошибки валидации полей
      if (err.response && err.response.data && err.response.data.errors) {
        setError(Object.values(err.response.data.errors)[0] as string);
      }
      // Если Laravel вернул стандартное сообщение (например, "Неверные учетные данные")
      else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      }
      // Если бэкенд вообще лежит
      else {
        setError("Неверный логин или пароль, либо бэкенд недоступен.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-slate-800 p-8 shadow-xl border border-slate-700">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            AutoShift CRM
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Панель управления автосервисом
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-300 block mb-1">
              Email сотрудника
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="example@auto.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 block mb-1">
              Пароль
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 transition-all cursor-pointer mt-2"
          >
            {loading ? "Вход..." : "Войти в систему"}
          </button>
        </form>
      </div>
    </div>
  );
};
