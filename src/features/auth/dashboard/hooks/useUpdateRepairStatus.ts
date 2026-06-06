import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";

export const useUpdateRepairStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      repairId,
      status,
    }: {
      repairId: number;
      status: string;
    }) => {
      const response = await api.patch(`/api/repairs/${repairId}/status`, {
        status,
      });
      return response.data;
    },
    onSuccess: () => {
      // Говорим React Query «протушить» кэш ремонтов и клиентов, чтобы интерфейс сам обновился
      queryClient.invalidateQueries({ queryKey: ["repairs"] });
      queryClient.invalidateQueries({ queryKey: ["client"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};
