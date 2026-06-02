import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios";

export interface Car {
  id: number;
  client_id: number;
  brand: string;
  model: string;
  vin: string | null;
  number_plate: string | null;
  year: number | null;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  comment: string | null;
  cars: Car[];
  created_at: string;
}

export const useClients = () => {
  return useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      try {
        const response = await api.get("/api/clients");

        // КРИТИЧЕСКИ ВАЖНО: Проверяем, что пришел именно массив
        if (Array.isArray(response.data)) {
          return response.data;
        }

        // Если пришел объект ошибки (например, с сообщением о сессии), выкидываем в catch
        throw new Error(
          response.data?.message || "Неверный формат данных бэкенда",
        );
      } catch (error) {
        console.error("Ошибка при запросе клиентов:", error);
        throw error;
      }
    },
    // Возвращаем пустой массив по умолчанию в случае сбоя, чтобы .map() не падал
    initialData: [],
  });
};
