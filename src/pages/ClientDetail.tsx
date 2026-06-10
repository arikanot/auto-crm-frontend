import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { AddCarModal } from "../features/clients/AddCarModel";
import { useUpdateClient } from "../features/auth/dashboard/hooks/useUpdateClient";
import { useSearchParts } from "../features/auth/dashboard/hooks/useParts";

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

  // Состояния для формы нового ремонта
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

  const { data: foundParts = [] } = useSearchParts(partSearch);

  // Состояния редактирования профиля
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editComment, setEditComment] = useState("");

  const updateClientMutation = useUpdateClient();

  // Загрузка детальных данных клиента
  const {
    data: client,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const response = await api.get(`/api/clients/${id}`);
      if (response.data.cars?.length > 0 && !selectedCarId) {
        setSelectedCarId(response.data.cars[0].id);
      }
      return response.data;
    },
  });

  React.useEffect(() => {
    if (client) {
      setEditName(client.name);
      setEditPhone(client.phone);
      setEditEmail(client.email || "");
      setEditComment(client.comment || "");
    }
  }, [client]);

  // Закрытие дропдауна при клике в любом месте экрана
  React.useEffect(() => {
    const handleOutsideClick = () => setShowDropdown(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Мутация для добавления нового ремонта
  const addRepairMutation = useMutation({
    mutationFn: (newRepair: any) => api.post("/api/repairs", newRepair),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      setDescription("");
      setLaborCost("");
      setNotes("");
      setStatus("pending");
      setSelectedParts([]);
    },
    onError: (error: any) => {
      alert(
        error.response?.data?.message || "Ошибка при создании заказ-наряда",
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

    addRepairMutation.mutate({
      car_id: selectedCarId,
      description,
      status,
      labor_cost: laborCost ? parseFloat(laborCost) : 0,
      parts: partsPayload,
      notes,
    });
  };

  const handleSaveProfile = () => {
    if (!editName || !editPhone) return;
    updateClientMutation.mutate(
      {
        id: Number(id),
        name: editName,
        phone: editPhone,
        email: editEmail,
        comment: editComment,
      },
      {
        onSuccess: () => setIsEditing(false),
      },
    );
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

  // === ВСЕ ПРОВЕРКИ СТАТУСОВ ПЕРЕНЕСЕНЫ СЮДА (ПОСЛЕ ВСЕХ ХУКОВ!) ===
  if (isLoading)
    return (
      <div className="p-6 text-center text-gray-400">
        Загрузка карточки клиента...
      </div>
    );
  if (isError || !client)
    return (
      <div className="p-6 text-center text-red-400">
        Ошибка: Клиент не найден на сервере (500/404).
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
        className="mb-6 flex items-center text-sm text-gray-400 hover:text-white transition cursor-pointer"
      >
        &larr; Вернуться в базу
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-teal-400">
                Профиль клиента
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 px-2.5 py-1 rounded-lg text-gray-300 transition cursor-pointer"
                >
                  Изменить
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-xs bg-slate-700 hover:bg-slate-600 px-2.5 py-1 rounded-lg text-gray-300 transition cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="text-xs bg-teal-600 hover:bg-teal-500 px-2.5 py-1 rounded-lg text-white transition cursor-pointer"
                  >
                    Сохранить
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
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
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-gray-400 block text-xs mb-1">
                    ФИО *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block text-xs mb-1">
                    Телефон *
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block text-xs mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block text-xs mb-1">
                    Заметка
                  </label>
                  <textarea
                    rows={2}
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-teal-500 italic"
                  />
                </div>
              </div>
            )}
          </div>

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
                    <span>Год: {car.year || "—"}</span>
                    <span>VIN: {car.vin || "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-blue-400">
              Открыть новый заказ-наряд
            </h2>
            <form onSubmit={handleAddRepair} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">
                    Что нужно сделать *
                  </label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                    placeholder="Замена масла, диагностика ДВС"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Выбрать авто
                  </label>
                  <select
                    value={selectedCarId || ""}
                    onChange={(e) => setSelectedCarId(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                  >
                    {client.cars?.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.brand} {c.model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ПОДБОР ЗАПЧАСТЕЙ СО СКЛАДА */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <label className="block text-xs text-gray-400 mb-1">
                  Подобрать запчасти со склада
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

              {/* Список выбранных деталей */}
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
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={addRepairMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer"
                  >
                    {addRepairMutation.isPending
                      ? "Добавление..."
                      : "Открыть заказ-наряд"}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label className="block text-xs text-gray-400 mb-1">
                  Заметки мастера
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                  placeholder="Рекомендации..."
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
                История ремонтов пуста.
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

                        {repair.parts && repair.parts.length > 0 && (
                          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 text-xs space-y-1">
                            <span className="text-gray-500 font-semibold block mb-1">
                              Установленные запчасти:
                            </span>
                            {repair.parts.map((part: any) => (
                              <div
                                key={part.id}
                                className="flex justify-between text-gray-300"
                              >
                                <span>
                                  • {part.name}{" "}
                                  <span className="text-gray-500 font-mono text-[10px]">
                                    [{part.sku}]
                                  </span>{" "}
                                  x{part.pivot.quantity} шт
                                </span>
                                <span className="font-medium text-slate-400">
                                  {(
                                    parseFloat(part.pivot.price_at_sale) *
                                    part.pivot.quantity
                                  ).toLocaleString()}{" "}
                                  ₽
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

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
