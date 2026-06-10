import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useParts } from "../auth/dashboard/hooks/useParts";
import { AddPartModal } from "./AddPartModal";

export const PartsList = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const {
    data: paginationData,
    isLoading,
    isError,
  } = useParts(debouncedSearch, page);

  const parts = paginationData?.data || [];
  const lastPage = paginationData?.last_page || 1;
  const totalParts = paginationData?.total || 0;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Навигационная Шапка */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="text-xl font-black tracking-tight text-blue-500">
                AutoShift
              </span>
              <nav className="flex gap-4 text-sm font-medium">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-slate-400 hover:text-slate-200 transition"
                >
                  База клиентов
                </button>
                <button
                  onClick={() => navigate("/repairs")}
                  className="text-slate-400 hover:text-slate-200 transition"
                >
                  Заказ-наряды
                </button>
                <button
                  onClick={() => navigate("/parts")}
                  className="text-blue-400 border-b-2 border-blue-500 pb-5 pt-5 font-semibold"
                >
                  Склад
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-200">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-400">Складской учет</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Контент */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
              Номенклатура склада
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Всего позиций в каталоге:{" "}
              <span className="text-blue-400 font-semibold">{totalParts}</span>
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-500 transition cursor-pointer"
          >
            + Принять товар
          </button>
        </div>

        {/* Поиск */}
        <div className="mb-6 max-w-xs">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Поиск по названию или артикулу..."
            className="w-full pl-4 pr-4 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-xs placeholder-slate-500 text-slate-200 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {isLoading && (
          <div className="text-center py-10 text-gray-400">
            Загрузка товаров...
          </div>
        )}
        {isError && (
          <div className="text-center py-10 text-red-400">
            Ошибка при обращении к серверу склада.
          </div>
        )}

        {paginationData && (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/40 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Артикул / Деталь</th>
                    <th className="px-6 py-4">Бренд</th>
                    <th className="px-6 py-4">Остаток</th>
                    <th className="px-6 py-4">Закупка</th>
                    <th className="px-6 py-4">Продажа</th>
                    <th className="px-6 py-4 text-right">Ячейка</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {parts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-slate-500 italic"
                      >
                        Склад пуст или ничего не найдено.
                      </td>
                    </tr>
                  ) : (
                    parts.map((part: any) => (
                      <tr
                        key={part.id}
                        className="hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs text-blue-400 font-bold">
                              {part.sku}
                            </span>
                            <span className="font-medium text-slate-100 mt-0.5">
                              {part.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-300">
                          {part.brand || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${part.stock_quantity > 3 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                          >
                            {part.stock_quantity} шт
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-400">
                          {parseFloat(part.purchase_price).toLocaleString()} ₽
                        </td>
                        <td className="px-6 py-4 font-bold text-teal-400">
                          {parseFloat(part.selling_price).toLocaleString()} ₽
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-semibold text-slate-400">
                          {part.location || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Пагинация */}
            {lastPage > 1 && (
              <div className="flex justify-between items-center bg-slate-900/50 p-4 border border-slate-800 rounded-xl text-sm">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-40"
                >
                  &larr; Назад
                </button>
                <span className="text-slate-400 text-xs font-semibold">
                  Страница {page} из {lastPage}
                </span>
                <button
                  disabled={page === lastPage}
                  onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-40"
                >
                  Вперед &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <AddPartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
