import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  // Состояния для полей формы
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [numberPlate, setNumberPlate] = useState("");
  const [year, setYear] = useState("");

  const [error, setError] = useState("");

  // Мутация React Query для отправки POST-запроса
  const mutation = useMutation({
    mutationFn: (newClientData: any) => {
      return api.post("/api/clients", newClientData);
    },
    onSuccess: () => {
      // Инвалидируем кэш клиентов, чтобы таблица на Dashboard сама мгновенно перекачалась
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      // Закрываем окно и чистим форму
      resetForm();
      onClose();
    },
    onError: (err: any) => {
      if (err.response?.data?.errors) {
        setError(Object.values(err.response.data.errors)[0] as string);
      } else {
        setError(
          err.response?.data?.message || "Произошла ошибка при добавлении.",
        );
      }
    },
  });

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setComment("");
    setBrand("");
    setModel("");
    setNumberPlate("");
    setYear("");
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    mutation.mutate({
      name,
      phone,
      email,
      comment,
      brand,
      model,
      number_plate: numberPlate,
      year: year ? parseInt(year) : null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full p-6 text-white max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700">
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-3">
          <h2 className="text-xl font-bold">Добавление нового клиента СТО</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Блок 1: Владелец */}
          <div>
            <h3 className="text-teal-400 font-semibold mb-3 text-sm tracking-wider uppercase">
              1. Данные владельца
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  ФИО клиента *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500"
                  placeholder="Иванов Петр Васильевич"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Номер телефона *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500"
                  placeholder="+375 (29) 123-45-67"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">
                  Email (необязательно)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500"
                  placeholder="petr@mail.ru"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">
                  Заметка / Комментарий
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500"
                  placeholder="Постоянный клиент, просит скидку..."
                />
              </div>
            </div>
          </div>

          {/* Блок 2: Машина */}
          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-teal-400 font-semibold mb-3 text-sm tracking-wider uppercase">
              2. Данные автомобиля
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Марка авто *
                </label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500"
                  placeholder="Toyota"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Модель авто *
                </label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500"
                  placeholder="Camry"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Госномер
                </label>
                <input
                  type="text"
                  value={numberPlate}
                  onChange={(e) => setNumberPlate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500"
                  placeholder="А123АА 777"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Год выпуска
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500"
                  placeholder="2018"
                />
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end space-x-3 border-t border-slate-700 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm bg-slate-700 text-gray-200 rounded-lg hover:bg-slate-600 transition disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-500 font-medium transition flex items-center justify-center disabled:opacity-50"
            >
              {mutation.isPending ? "Сохранение..." : "Создать карту"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
