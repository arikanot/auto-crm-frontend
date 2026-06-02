import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

export const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Состояния для формы нового ремонта
  const [description, setDescription] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [partsCost, setPartsCost] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);

  // Загрузка детальных данных клиента из нашего нового эндпоинта show
  const {
    data: client,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const response = await api.get(`/api/clients/${id}`);
      // Автоматически выберем первую машину клиента для формы, если она есть
      if (response.data.cars?.length > 0) {
        setSelectedCarId(response.data.cars[0].id);
      }
      return response.data;
    },
  });

  // Мутация для добавления нового ремонта (Бэкенд эндпоинт напишем на следующем шаге, пока подготовим фронт)
  const addRepairMutation = useMutation({
    mutationFn: (newRepair: any) => api.post("/api/repairs", newRepair),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      setDescription("");
      setLaborCost("");
      setPartsCost("");
      setNotes("");
      setStatus("pending");
    },
  });

  const handleAddRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarId) return;

    addRepairMutation.mutate({
      car_id: selectedCarId,
      description,
      status,
      labor_cost: laborCost ? parseFloat(laborCost) : 0,
      parts_cost: partsCost ? parseFloat(partsCost) : 0,
      notes,
    });
  };

  if (isLoading)
    return (
      <div className="p-6 text-center text-gray-400">
        Загрузка карточки клиента...
      </div>
    );
  if (isError || !client)
    return (
      <div className="p-6 text-center text-red-400">
        Ошибка: Клиент не найден.
      </div>
    );

  // Маппинг статусов для красивого отображения тегов
  const statusLabels: Record<string, { text: string; color: string }> = {
    pending: {
      text: "Ожидает",
      color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    in_progress: {
      text: "В работе",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    waiting_parts: {
      text: "Ждет запчасти",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    completed: {
      text: "Готов",
      color: "bg-green-500/10 text-green-400 border-green-500/20",
    },
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      {/* Кнопка Назад */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 flex items-center text-sm text-gray-400 hover:text-white transition"
      >
        &larr; Вернуться в базу
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ЛЕВАЯ КОЛОНКА: Данные клиента и авто */}
        <div className="space-y-6 lg:col-span-1">
          {/* Карточка владельца */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center text-teal-400">
              Профиль клиента
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400 block text-xs">ФИО</span>
                <span className="text-base font-medium">{client.name}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Телефон</span>
                <span className="text-base font-medium">{client.phone}</span>
              </div>
              {client.email && (
                <div>
                  <span className="text-gray-400 block text-xs">Email</span>
                  <span className="text-base font-medium text-gray-300">
                    {client.email}
                  </span>
                </div>
              )}
              {client.comment && (
                <div>
                  <span className="text-gray-400 block text-xs">Заметка</span>
                  <p className="text-gray-300 bg-slate-900/50 p-2.5 rounded-lg mt-1 italic">
                    {client.comment}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Карточка автомобилей */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-teal-400">Автопарк</h2>
            {client.cars?.map((car: any) => (
              <div
                key={car.id}
                className="bg-slate-900 p-4 rounded-lg border border-slate-700 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">
                    {car.brand} {car.model}
                  </span>
                  <span className="bg-teal-500/10 text-teal-400 text-xs px-2 py-1 rounded font-mono border border-teal-500/20">
                    {car.number_plate || "БЕЗ НОМЕРА"}
                  </span>
                </div>
                <div className="text-xs text-gray-400 flex justify-between">
                  <span>Год выпуска: {car.year || "—"}</span>
                  <span>VIN: {car.vin || "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: История ремонтов и создание заказ-наряда */}
        <div className="lg:col-span-2 space-y-6">
          {/* Форма нового ремонта */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-blue-400">
              Открыть новый заказ-наряд
            </h2>
            <form
              onSubmit={handleAddRepair}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">
                  Что нужно сделать / Поломка *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Замена тормозных колодок, диагностика подвески"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Статус ремонта
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="pending">Ожидает</option>
                  <option value="in_progress">В работе</option>
                  <option value="waiting_parts">Ждет запчасти</option>
                  <option value="completed">Готов</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Стоимость работ (₽)
                </label>
                <input
                  type="number"
                  value={laborCost}
                  onChange={(e) => setLaborCost(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Стоимость запчастей (₽)
                </label>
                <input
                  type="number"
                  value={partsCost}
                  onChange={(e) => setPartsCost(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={addRepairMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {addRepairMutation.isPending
                    ? "Добавление..."
                    : "Добавить работу"}
                </button>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs text-gray-400 mb-1">
                  Заметки мастера / Список деталей
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Колодки Brembo, артикул..."
                />
              </div>
            </form>
          </div>

          {/* История заказ-нарядов */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-gray-200">
              История обслуживания
            </h2>

            {/* Собираем все ремонты со всех машин клиента */}
            {client.cars?.flatMap((c: any) => c.repairs || []).length === 0 ? (
              <p className="text-gray-500 text-sm py-4 italic text-center">
                История ремонтов пуста. Этот клиент у нас впервые.
              </p>
            ) : (
              <div className="space-y-4">
                {client.cars.flatMap((c: any) =>
                  (c.repairs || []).map((repair: any) => {
                    const currentStatus = statusLabels[repair.status] || {
                      text: repair.status,
                      color: "bg-slate-700 text-white",
                    };
                    const totalCost =
                      parseFloat(repair.labor_cost) +
                      parseFloat(repair.parts_cost);

                    return (
                      <div
                        key={repair.id}
                        className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-base">
                              {repair.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Авто: {c.brand} {c.model} ({c.number_plate})
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium border ${currentStatus.color}`}
                          >
                            {currentStatus.text}
                          </span>
                        </div>

                        {repair.notes && (
                          <p className="text-sm text-gray-400 bg-slate-850 p-2 rounded border border-slate-800 italic">
                            {repair.notes}
                          </p>
                        )}

                        <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-slate-800">
                          <div className="space-x-4">
                            <span>
                              Работа:{" "}
                              <strong className="text-gray-200">
                                {repair.labor_cost} ₽
                              </strong>
                            </span>
                            <span>
                              Запчасти:{" "}
                              <strong className="text-gray-200">
                                {repair.parts_cost} ₽
                              </strong>
                            </span>
                          </div>
                          <div className="text-sm font-bold text-teal-400">
                            Итого: {totalCost} ₽
                          </div>
                        </div>
                      </div>
                    );
                  }),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
