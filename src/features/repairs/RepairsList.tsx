import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore"; // Проверь путь к стору auth
import { useNavigate } from "react-router-dom";
import { useRepairs } from "../auth/dashboard/hooks/useRepairs"; // Наш созданный хук
import { useUpdateRepairStatus } from "../auth/dashboard/hooks/useUpdateRepairStatus";

export const RepairsList = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // 1. Состояния для серверного поиска, пагинации и фильтра по статусу
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(""); // "" означает "Все статусы"
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 2. Дебаунс для поиска (задержка 400мс, чтобы беречь базу данных)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Сбрасываем на 1 страницу при новом поиске
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Сбрасываем страницу, если менеджер переключил вкладку статуса
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  // 3. Загружаем данные через наш умный хук
  const {
    data: paginationData,
    isLoading,
    isError,
  } = useRepairs(statusFilter, debouncedSearch, page);

  const { mutate: updateStatus } = useUpdateRepairStatus();

  const repairs = paginationData?.data || [];
  const lastPage = paginationData?.last_page || 1;
  const totalRepairs = paginationData?.total || 0;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Маппинг статусов для красивых цветных бэджей
  const statusConfig: Record<string, { text: string; color: string }> = {
    pending: {
      text: "Ожидает",
      color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    in_progress: {
      text: "В работе",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    waiting_parts: {
      text: "Ждёт запчасти",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    completed: {
      text: "Готов",
      color: "bg-green-500/10 text-green-400 border-green-500/20",
    },
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Универсальная Шапка AutoShift с навигацией */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="text-xl font-black tracking-tight text-blue-500">
                AutoShift
              </span>
              {/* Кнопки переключения между глобальными разделами */}
              <nav className="flex gap-4 text-sm font-medium">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-slate-400 hover:text-slate-200 transition"
                >
                  База клиентов
                </button>
                <button
                  onClick={() => navigate("/repairs")}
                  className="text-blue-400 border-b-2 border-blue-500 pb-5 pt-5 font-semibold"
                >
                  Заказ-наряды
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-200">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-400">Администратор СТО</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
            Журнал заказ-нарядов
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Активных ремонтов в боксах:{" "}
            <span className="text-blue-400 font-semibold">{totalRepairs}</span>
          </p>
        </div>

        {/* Фильтры по статусам (Вкладки/Табы) + Поисковая строка */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          {/* Переключатели статусов */}
          <div className="flex flex-wrap gap-2 bg-slate-800/40 p-1 rounded-xl border border-slate-800/80 w-fit">
            {[
              { id: "", label: "Все" },
              { id: "pending", label: "Ожидают" },
              { id: "in_progress", label: "В работе" },
              { id: "waiting_parts", label: "Ждут запчасти" },
              { id: "completed", label: "Готовы" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleStatusChange(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  statusFilter === tab.id
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Инпут умного поиска */}
          <div className="relative w-full md:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Поиск по авто, клиенту, поломке..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-xs placeholder-slate-500 text-slate-200 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Индикатор загрузки */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500"></div>
          </div>
        )}

        {/* Ошибка */}
        {isError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400 text-sm">
            Не удалось загрузить список ремонтов. Перепроверьте работу API
            бэкенда.
          </div>
        )}

        {/* Таблица ремонтов */}
        {paginationData && (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/40 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Автомобиль / Клиент</th>
                      <th className="px-6 py-4">Описание работ</th>
                      <th className="px-6 py-4">Статус</th>
                      <th className="px-6 py-4">Стоимость (Итого)</th>
                      <th className="px-6 py-4 text-right">Дата открытия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {repairs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-slate-500 italic"
                        >
                          Заказ-нарядов с такими параметрами не найдено.
                        </td>
                      </tr>
                    ) : (
                      repairs.map((repair: any) => {
                        const config = statusConfig[repair.status] || {
                          text: repair.status,
                          color: "bg-slate-700 text-white",
                        };
                        const totalCost =
                          parseFloat(repair.labor_cost) +
                          parseFloat(repair.parts_cost);
                        const car = repair.car;
                        const client = car?.client;

                        return (
                          <tr
                            key={repair.id}
                            // При клике на ремонт из общего списка — проваливаемся сразу в детальную карточку этого клиента!
                            onClick={() => navigate(`/clients/${client?.id}`)}
                            className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                          >
                            {/* Автомобиль / Клиент */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-slate-100">
                                  {car
                                    ? `${car.brand} ${car.model}`
                                    : "Удалённое авто"}
                                </span>
                                <span className="text-xs text-slate-400">
                                  Владелец:{" "}
                                  <strong className="text-slate-300 font-medium">
                                    {client?.name || "—"}
                                  </strong>
                                </span>
                              </div>
                            </td>

                            {/* Описание работ */}
                            <td className="px-6 py-4 max-w-xs truncate font-medium text-slate-200">
                              {repair.description}
                              {repair.notes && (
                                <span className="block text-[11px] text-slate-500 font-normal italic truncate mt-0.5">
                                  Заметка: {repair.notes}
                                </span>
                              )}
                            </td>

                            {/* Статус */}
                            <td
                              className="px-6 py-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* onClick с stopPropagation нужен, чтобы при клике на селект нас не перекидывало на страницу клиента */}
                              <select
                                value={repair.status}
                                onChange={(e) =>
                                  updateStatus({
                                    repairId: repair.id,
                                    status: e.target.value,
                                  })
                                }
                                className={`rounded-lg border px-2 py-1 text-xs font-medium bg-slate-800 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer ${config.color}`}
                              >
                                <option
                                  value="pending"
                                  className="bg-slate-900 text-yellow-400"
                                >
                                  Ожидает
                                </option>
                                <option
                                  value="in_progress"
                                  className="bg-slate-900 text-blue-400"
                                >
                                  В работе
                                </option>
                                <option
                                  value="waiting_parts"
                                  className="bg-slate-900 text-purple-400"
                                >
                                  Ждёт запчасти
                                </option>
                                <option
                                  value="completed"
                                  className="bg-slate-900 text-green-400"
                                >
                                  Готов
                                </option>
                              </select>
                            </td>

                            {/* Стоимость */}
                            <td className="px-6 py-4 font-bold text-teal-400">
                              {totalCost.toLocaleString("ru-RU")} ₽
                            </td>

                            {/* Дата открытия */}
                            <td className="px-6 py-4 text-right text-xs text-slate-500 font-mono">
                              {new Date(repair.created_at).toLocaleDateString(
                                "ru-RU",
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Пагинация списка ремонтов */}
            {lastPage > 1 && (
              <div className="flex justify-between items-center bg-slate-900/50 p-4 border border-slate-800 rounded-xl text-sm">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg disabled:opacity-40 transition"
                >
                  &larr; Назад
                </button>
                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  Страница {page} из {lastPage}
                </span>
                <button
                  disabled={page === lastPage}
                  onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg disabled:opacity-40 transition"
                >
                  Вперед &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
