import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";

interface LaravelPartPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  data: any[];
}

export const useParts = (search: string, page: number) => {
  return useQuery<LaravelPartPagination>({
    queryKey: ["parts", { search, page }],
    queryFn: async () => {
      const response = await api.get("/api/parts", {
        params: {
          search: search || undefined,
          page: page,
        },
      });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useAddPart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPart: any) => {
      const response = await api.post("/api/parts", newPart);
      return response.data;
    },
    onSuccess: () => {
      // Сбрасываем кэш склада, чтобы таблица сразу обновилась
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });
};

export const useSearchParts = (search: string) => {
  return useQuery({
    queryKey: ["parts-search", search],
    queryFn: async () => {
      if (!search || search.length < 2) return [];
      const response = await api.get("/api/parts", { params: { search } });
      return response.data.data; // Возвращаем массив запчастей из пагинированного ответа
    },
    enabled: search.length >= 2, // Начинаем искать только от 2-х символов
  });
};
