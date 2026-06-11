import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { AddCarModal } from "../features/clients/AddCarModel";

interface SelectedPartItem {
  id: number;
  name: string;
  sku: string;
  selling_price: number;
  quantity: number;
  stock_quantity: number;
}

export const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Идентификатор редактируемого заказ-наряда (null — создание нового)
  const [editingRepairId, setEditingRepairId] = useState<number | null>(null);

  // Состояния для формы ремонта
  const [description, setDescription] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);

  // Складской подбор запчастей
  const [partSearch, setPartSearch] = useState("");
  const [selectedParts, setSelectedParts] = useState<SelectedPartItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Мгновенный поиск запчастей внутри компонента
  const { data: foundParts = [] } = useQuery({
    queryKey: ["parts-search", partSearch],
    queryFn: async () => {
      if (!partSearch || partSearch.length < 2) return [];
      const response = await api.get("/api/parts", {
        params: { search: partSearch },
      });
      return response.data.data || [];
    },
    enabled: partSearch.length >= 2,
  });

  // Загрузка детальных данных клиента
  const {
    data: client,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const response = await api.get(`/api/clients/${id}`);
      // Выбираем машину по умолчанию ТОЛЬКО если мы не в режиме редактирования старого заказа
      if (response.data.cars?.length > 0 && !editingRepairId) {
        setSelectedCarId(response.data.cars[0].id);
      }
      return response.data;
    },
  });

  // Глобальный клик для закрытия автокомплита
  React.useEffect(() => {
    const handleOutsideClick = () => setShowDropdown(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Мутация для отправки (создание или обновление)
  const submitRepairMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingRepairId) {
        return api.put(`/api/repairs/${editingRepairId}`, payload);
      }
      return api.post("/api/repairs", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      // Полный сброс формы
      setEditingRepairId(null);
      setDescription("");
      setLaborCost("");
      setNotes("");
      setStatus("pending");
      setSelectedParts([]);
    },
    onError: (error: any) => {
      alert(
        error.response?.data?.message || "Ошибка при сохранении заказ-наряда",
      );
    },
  });

  // Мутация для удаления заказ-наряда
  const deleteRepairMutation = useMutation({
    mutationFn: (repairId: number) => api.delete(`/api/repairs/${repairId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      alert("Заказ-наряд успешно удален. Запчасти возвращены на склад.");
    },
    onError: (error: any) => {
      alert(
        error.response?.data?.message || "Ошибка при удалении заказ-наряда",
      );
    },
  });

  const handleAddRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarId) return;

    const partsPayload = selectedParts.map((p) => ({
      id: p.id,
      quantity: p.quantity,
    }));

    submitRepairMutation.mutate({
      car_id: selectedCarId,
      description,
      status,
      labor_cost: laborCost ? parseFloat(laborCost) : 0,
      notes,
      parts: partsPayload,
    });
  };

  const handleStartEditRepair = (repair: any) => {
    setEditingRepairId(repair.id);
    setDescription(repair.description || "");
    setLaborCost(repair.labor_cost ? repair.labor_cost.toString() : "0");
    setNotes(repair.notes || "");
    setStatus(repair.status || "pending");

    if (repair.car_id) {
      setSelectedCarId(repair.car_id);
    }

    if (repair.parts && repair.parts.length > 0) {
      const mappedParts = repair.parts.map((p: any) => {
        const priceAtSale = p.pivot?.price_at_sale
          ? parseFloat(p.pivot.price_at_sale)
          : parseFloat(p.selling_price);
        const qtyInRepair = p.pivot?.quantity ? parseInt(p.pivot.quantity) : 1;

        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          selling_price: priceAtSale,
          quantity: qtyInRepair,
          stock_quantity: (p.stock_quantity || 0) + qtyInRepair,
        };
      });
      setSelectedParts(mappedParts);
    } else {
      setSelectedParts([]);
    }

    setPartSearch("");
    setShowDropdown(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteRepair = (repairId: number) => {
    if (
      window.confirm(
        "Вы уверены, что хотите удалить этот заказ-наряд? Все запчасти вернутся на склад.",
      )
    ) {
      deleteRepairMutation.mutate(repairId);
    }
  };

  const handleSelectPart = (part: any) => {
    if (selectedParts.some((p) => p.id === part.id)) return;
    setSelectedParts([
      ...selectedParts,
      {
        id: part.id,
        name: part.name,
        sku: part.sku,
        selling_price: parseFloat(part.selling_price),
        quantity: 1,
        stock_quantity: part.stock_quantity,
      },
    ]);
    setPartSearch("");
    setShowDropdown(false);
  };

  const handleUpdateQty = (id: number, qty: number) => {
    setSelectedParts(
      selectedParts.map((p) =>
        p.id === id
          ? { ...p, quantity: Math.min(Math.max(qty, 1), p.stock_quantity) }
          : p,
      ),
    );
  };

  const handleRemovePart = (id: number) => {
    setSelectedParts(selectedParts.filter((p) => p.id !== id));
  };

  const totalPartsCost = selectedParts.reduce(
    (sum, p) => sum + p.selling_price * p.quantity,
    0,
  );

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
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 flex items-center text-sm text-gray-400 hover:text-white transition"
      >
        &larr; Вернуться в базу
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          {/* Профиль */}
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

          {/* Автопарк */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-teal-400">Автопарк</h2>
              <button
                onClick={() => setIsCarModalOpen(true)}
                className="bg-teal-600/20 hover:bg-teal-600/40 text-teal-400 px-2.5 py-1 rounded-lg text-xs font-semibold border border-teal-500/30 transition cursor-pointer"
              >
                + Добавить авто
              </button>
            </div>
            <div className="space-y-3">
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
        </div>

        {/* Правая колонка: Форма и История */}
        <div className="lg:col-span-2 space-y-6">
          {/* Форма */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-blue-400">
              {editingRepairId
                ? `Редактирование заказ-наряда №${editingRepairId}`
                : "Открыть новый заказ-наряд"}
            </h2>
            <form onSubmit={handleAddRepair} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">
                    Что нужно сделать / Поломка *
                  </label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                    placeholder="Замена тормозных колодок..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Статус ремонта
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                  >
                    <option value="pending">Ожидает</option>
                    <option value="in_progress">В работе</option>
                    <option value="waiting_parts">Ждет запчасти</option>
                    <option value="completed">Готов</option>
                  </select>
                </div>
              </div>

              {/* Автокомплит поиска запчастей */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <label className="block text-xs text-gray-400 mb-1">
                  Подобрать запчасти со склада (введите название или артикул)
                </label>
                <input
                  type="text"
                  value={partSearch}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => {
                    setPartSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  placeholder="Начните вводить: Фильтр, Колодки..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                />

                {showDropdown && partSearch.length >= 2 && (
                  <div className="absolute left-0 right-0 mt-1 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl max-h-48 overflow-y-auto z-20 divide-y divide-slate-800">
                    {foundParts.length === 0 ? (
                      <div className="p-3 text-xs text-gray-500 italic">
                        Товар не найден или его нет на остатке
                      </div>
                    ) : (
                      foundParts.map((part: any) => (
                        <div
                          key={part.id}
                          onClick={() => handleSelectPart(part)}
                          className="p-2.5 text-xs hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div>
                            <span className="font-mono text-blue-400 font-bold mr-2">
                              [{part.sku}]
                            </span>
                            <span className="font-medium text-slate-200">
                              {part.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-teal-400 font-bold block">
                              {part.selling_price} ₽
                            </span>
                            <span className="text-gray-500 text-[10px]">
                              Остаток: {part.stock_quantity} шт
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Интерактивная спецификация выбранных деталей */}
              {selectedParts.length > 0 && (
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 space-y-2">
                  {selectedParts.map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between text-xs bg-slate-950 p-2 rounded-lg border border-slate-800"
                    >
                      <div className="w-1/2">
                        <span className="font-bold text-slate-200">
                          {part.name}
                        </span>
                        <span className="block text-[10px] text-gray-500 font-mono">
                          {part.sku}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={part.stock_quantity}
                          value={part.quantity}
                          onChange={(e) =>
                            handleUpdateQty(
                              part.id,
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-12 bg-slate-900 border border-slate-700 rounded p-1 text-center font-bold text-white focus:outline-none"
                        />
                        <span className="text-gray-500">
                          из {part.stock_quantity} шт
                        </span>
                      </div>
                      <div className="text-teal-400 font-bold w-20 text-right">
                        {(part.selling_price * part.quantity).toLocaleString()}{" "}
                        ₽
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePart(part.id)}
                        className="text-red-400 hover:text-red-300 font-bold text-sm px-1 cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Стоимость и Кнопки */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Стоимость работ (₽)
                  </label>
                  <input
                    type="number"
                    value={laborCost}
                    onChange={(e) => setLaborCost(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col justify-end text-sm text-gray-400 py-1.5 md:text-right">
                  <div>
                    Запчасти:{" "}
                    <strong className="text-teal-400">
                      {totalPartsCost.toLocaleString()} ₽
                    </strong>
                  </div>
                  <div className="text-base font-bold text-white mt-0.5">
                    Всего:{" "}
                    {(
                      (parseFloat(laborCost) || 0) + totalPartsCost
                    ).toLocaleString()}{" "}
                    ₽
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <button
                    type="submit"
                    disabled={submitRepairMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer"
                  >
                    {submitRepairMutation.isPending
                      ? "Сохранение..."
                      : editingRepairId
                        ? "Сохранить изменения"
                        : "Добавить работу"}
                  </button>
                  {editingRepairId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRepairId(null);
                        setDescription("");
                        setLaborCost("");
                        setNotes("");
                        setStatus("pending");
                        setSelectedParts([]);
                      }}
                      className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg text-xs transition cursor-pointer"
                    >
                      Отменить редактирование
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <label className="block text-xs text-gray-400 mb-1">
                  Заметки мастера / Список деталей
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                  placeholder="Колодки Brembo, артикул..."
                />
              </div>
            </form>
          </div>

          {/* История обслуживания */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-gray-200">
              История обслуживания
            </h2>

            {client.cars?.flatMap((c: any) => c.repairs || []).length === 0 ? (
              <p className="text-gray-500 text-sm py-4 italic text-center">
                История ремонтов пуста. Этот client у нас впервые.
              </p>
            ) : (
              <div className="space-y-4">
                {client.cars.flatMap((c: any) =>
                  (c.repairs || []).map((repair: any) => {
                    const currentStatus = statusLabels[repair.status] || {
                      text: repair.status,
                      color: "bg-slate-700 text-white",
                    };

                    return (
                      <div
                        key={repair.id}
                        className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3 text-left"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-base text-slate-100">
                              {repair.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Авто: {c.brand} {c.model} (
                              {c.number_plate || "БЕЗ НОМЕРА"})
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-medium border ${currentStatus.color}`}
                            >
                              {currentStatus.text}
                            </span>
                            <div className="flex gap-2 text-xs text-gray-500">
                              <button
                                type="button"
                                onClick={() => handleStartEditRepair(repair)}
                                className="hover:text-blue-400 transition cursor-pointer text-blue-500"
                              >
                                Редактировать
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRepair(repair.id)}
                                className="hover:text-red-400 transition cursor-pointer text-red-500"
                              >
                                Удалить
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* НАГЛЯДНЫЙ СПИСОК ЗАПЧАСТЕЙ ПРЯМО В КАРТОЧКЕ */}
                        {repair.parts && repair.parts.length > 0 ? (
                          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1.5">
                            <span className="text-gray-400 font-semibold block text-[11px] uppercase tracking-wider">
                              Использованные запчасти:
                            </span>
                            {repair.parts.map((part: any, idx: number) => {
                              const qty = part.pivot?.quantity
                                ? parseInt(part.pivot.quantity)
                                : 1;
                              const price = part.pivot?.price_at_sale
                                ? parseFloat(part.pivot.price_at_sale)
                                : parseFloat(part.selling_price);

                              return (
                                <div
                                  key={part.id || idx}
                                  className="flex justify-between items-center text-xs text-slate-300 bg-slate-900/40 px-2 py-1 rounded"
                                >
                                  <div>
                                    <span className="text-gray-500 font-mono mr-1.5">
                                      [{part.sku || "—"}]
                                    </span>
                                    <span className="font-medium">
                                      {part.name}
                                    </span>
                                  </div>
                                  <div className="text-slate-400 font-mono">
                                    {qty} шт × {price.toLocaleString()} ₽ ={" "}
                                    <span className="text-teal-400 font-bold">
                                      {(qty * price).toLocaleString()} ₽
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 italic bg-slate-950/30 p-2 rounded text-center border border-dashed border-slate-800">
                            Запчасти со склада не списывались (только
                            услуги/работа)
                          </div>
                        )}

                        {repair.notes && (
                          <div className="text-sm text-gray-400 bg-slate-950/30 p-2.5 rounded border border-slate-800 italic">
                            <span className="text-[10px] text-gray-500 block font-sans not-italic font-bold uppercase">
                              Заметки:
                            </span>
                            {repair.notes}
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-slate-800">
                          <div className="space-x-4">
                            <span>
                              Работа:{" "}
                              <strong className="text-gray-200">
                                {parseFloat(repair.labor_cost).toLocaleString()}{" "}
                                ₽
                              </strong>
                            </span>
                            <span>
                              Запчасти:{" "}
                              <strong className="text-gray-200">
                                {parseFloat(repair.parts_cost).toLocaleString()}{" "}
                                ₽
                              </strong>
                            </span>
                          </div>
                          <div className="text-base font-bold text-teal-400">
                            Итого:{" "}
                            {(
                              parseFloat(repair.labor_cost) +
                              parseFloat(repair.parts_cost)
                            ).toLocaleString()}{" "}
                            ₽
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
      <AddCarModal
        isOpen={isCarModalOpen}
        onClose={() => setIsCarModalOpen(false)}
        clientId={Number(id)}
      />
    </div>
  );
};
