import { useAuthStore } from "../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useClients } from "./hooks/useClients";
import { AddClientModal } from "../../clients/AddClientModel";
import { useState, useEffect } from "react";

export const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // 1. Состояния для пагинации и серверного поиска с дебаунсом
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(""); // Для мгновенного ввода
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Для запросов на сервер

  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Эффект задержки (Debounce): ждем 400мс после ввода, прежде чем дергать базу данных
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // При изменении строки поиска всегда сбрасываем на 1 страницу
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // 3. Передаем параметры поиска и страницы в обновленный хук данных
  const {
    data: paginationData,
    isLoading,
    isError,
  } = useClients(debouncedSearch, page);

  // Вытаскиваем массив клиентов и мета-данные пагинации из ответа Laravel
  const clients = paginationData?.data || [];
  const lastPage = paginationData?.last_page || 1;
  const totalClients = paginationData?.total || 0;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Шапка */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <span className="text-xl font-black tracking-tight text-blue-500">
              AutoShift
            </span>
            <nav className="flex gap-4 text-sm font-medium">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-blue-400 border-b-2 border-blue-500 pb-5 pt-5 font-semibold"
              >
                База клиентов
              </button>
              <button
                onClick={() => navigate("/repairs")}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                Заказ-наряды
              </button>
            </nav>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
              База клиентов
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Всего в системе:{" "}
              <span className="text-blue-400 font-semibold">
                {totalClients}
              </span>
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition focus:outline-none"
          >
            Добавить клиента
          </button>
        </div>

        {/* 4. БЛОК УМНОГО ПОИСКА */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <svg
                className="w-5 h-5"
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
              placeholder="Умный поиск по имени, телефону, авто или госномеру..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm placeholder-slate-500 text-slate-200 focus:outline-none focus:border-blue-500 focus:bg-slate-800 transition"
            />
          </div>
        </div>

        {/* Спиннер загрузки */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500"></div>
          </div>
        )}

        {/* Ошибка */}
        {isError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400 text-sm">
            Не удалось загрузить данные из базы СТО. Перепроверьте бэкенд.
          </div>
        )}

        {/* Отображение таблицы с результатами */}
        {paginationData && (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/40 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Клиент</th>
                      <th className="px-6 py-4">Контакты</th>
                      <th className="px-6 py-4">Автомобили</th>
                      <th className="px-6 py-4">Комментарий</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {clients.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-slate-500 italic"
                        >
                          Ничего не найдено по вашему запросу.
                        </td>
                      </tr>
                    ) : (
                      clients.map((client: any) => (
                        <tr
                          key={client.id}
                          onClick={() => navigate(`/clients/${client.id}`)} // Наша рабочая динамическая ссылка!
                          className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                        >
                          {/* Клиент */}
                          <td className="px-6 py-4 font-semibold text-slate-100">
                            {client.name}
                          </td>
                          {/* Контакты */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-0.5 text-xs">
                              <span className="text-slate-300 font-medium">
                                {client.phone}
                              </span>
                              {client.email && (
                                <span className="text-slate-500">
                                  {client.email}
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Автомобили */}
                          <td className="px-6 py-4">
                            {client.cars && client.cars.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {client.cars.map((car: any) => (
                                  <div
                                    key={car.id}
                                    className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 rounded-lg px-2 py-1 w-fit"
                                  >
                                    <span className="font-medium text-blue-400 text-xs">
                                      {car.brand} {car.model}
                                    </span>
                                    {car.number_plate && (
                                      <span className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider text-slate-300 border border-slate-800">
                                        {car.number_plate}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          {/* Комментарий */}
                          <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">
                            {client.comment || (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. ИНТЕРФЕЙС ПАГИНАЦИИ (Переключатель страниц) */}
            {lastPage > 1 && (
              <div className="flex justify-between items-center bg-slate-900/50 p-4 border border-slate-800 rounded-xl text-sm">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg disabled:opacity-40 disabled:hover:bg-slate-800 transition"
                >
                  &larr; Назад
                </button>
                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  Страница {page} из {lastPage}
                </span>
                <button
                  disabled={page === lastPage}
                  onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg disabled:opacity-40 disabled:hover:bg-slate-800 transition"
                >
                  Вперед &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
