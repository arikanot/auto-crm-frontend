import React, { useState } from "react";
import { useAddCar } from "../auth/dashboard/hooks/useAddCar";

interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
}

export const AddCarModal: React.FC<AddCarModalProps> = ({
  isOpen,
  onClose,
  clientId,
}) => {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [numberPlate, setNumberPlate] = useState("");
  const [year, setYear] = useState("");

  const addCarMutation = useAddCar();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model) return;

    addCarMutation.mutate(
      {
        client_id: clientId,
        brand,
        model,
        number_plate: numberPlate,
        year: year ? parseInt(year) : undefined,
      },
      {
        onSuccess: () => {
          // Очищаем форму и закрываем модалку при успехе
          setBrand("");
          setModel("");
          setNumberPlate("");
          setYear("");
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-teal-400">
            Добавить автомобиль в автопарк
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition text-xl font-semibold cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Марка автомобиля *
            </label>
            <input
              type="text"
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="например, Toyota, BMW"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Модель *</label>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="например, Camry, X5"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Госномер
              </label>
              <input
                type="text"
                value={numberPlate}
                onChange={(e) => setNumberPlate(e.target.value)}
                placeholder="А000АА77"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
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
                placeholder="2018"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white p-2.5 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={addCarMutation.isPending}
              className="flex-1 bg-teal-600 hover:bg-teal-500 text-white p-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer"
            >
              {addCarMutation.isPending ? "Сохранение..." : "Добавить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
