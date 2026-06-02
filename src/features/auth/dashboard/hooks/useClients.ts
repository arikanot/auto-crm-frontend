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

interface LaravelPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  data: any[]; // Тут наш массив клиентов
}

export const useClients = (search: string, page: number) => {
  return useQuery<LaravelPagination>({
    // <-- Указываем тип возвращаемых данных
    queryKey: ["clients", { search, page }],
    queryFn: async () => {
      const response = await api.get("/api/clients", {
        params: {
          search: search || undefined,
          page: page,
        },
      });
      return response.data;
    },
    placeholderData: (previousData) => previousData, // Чтобы таблица не мигала белым при вводе
  });
};
