import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";

interface NewCarData {
  client_id: number;
  brand: string;
  model: string;
  number_plate?: string;
  year?: number;
}

export const useAddCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (carData: NewCarData) => {
      const response = await api.post("/api/cars", carData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      //Обновляем кэш конкретного клиента, чтобы список его машин перерисовался
      queryClient.invalidateQueries({
        queryKey: ["client", String(variables.client_id)],
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};
