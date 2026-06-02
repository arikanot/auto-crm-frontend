import { useAuthStore } from "../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useClients } from "./hooks/useClients";

export const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Подключаем наш новый хук данных
  const { data: clients, isLoading, isError } = useClients();

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
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-200">
                  {user?.name}
                </p>
                <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                  {user?.role.toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 px-3 py-1.5 text-sm font-medium transition-all cursor-pointer"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Контент */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              База клиентов СТО
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Управление клиентами и привязанным автопарком
            </p>
          </div>
          <button className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all cursor-pointer">
            + Добавить клиента
          </button>
        </div>

        {/* Состояние загрузки */}
        {isLoading && (
          <div className="flex justify-center items-center py-12 text-slate-400 animate-pulse text-sm">
            Загрузка базы данных СТО...
          </div>
        )}

        {/* Состояние ошибки */}
        {isError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center text-red-400 text-sm">
            Не удалось загрузить клиентов. Проверь работу бэкенда.
          </div>
        )}

        {/* Основная таблица */}
        {!isLoading && !isError && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-800/30 backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Клиент</th>
                    <th className="px-6 py-4">Контакты</th>
                    <th className="px-6 py-4">Автомобили в системе</th>
                    <th className="px-6 py-4">Заметки</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                  {clients?.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-800/20 transition-colors"
                    >
                      {/* Имя */}
                      <td className="px-6 py-4 font-semibold text-white">
                        {client.name}
                      </td>
                      {/* Контакты */}
                      <td className="px-6 py-4 space-y-0.5">
                        <p className="text-slate-200 font-medium">
                          {client.phone}
                        </p>
                        {client.email && (
                          <p className="text-xs text-slate-400">
                            {client.email}
                          </p>
                        )}
                      </td>
                      {/* Машины */}
                      <td className="px-6 py-4">
                        {client.cars.length === 0 ? (
                          <span className="text-xs text-slate-500 italic">
                            Нет привязанных авто
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {client.cars.map((car) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
