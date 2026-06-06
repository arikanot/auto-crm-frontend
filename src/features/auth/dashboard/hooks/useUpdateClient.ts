import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";

interface UpdateClientData {
  id: number;
  name: string;
  phone: string;
  email?: string;
  comment?: string;
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateClientData) => {
      const response = await api.put(`/api/clients/${id}`, data);
      return response.data;
    },
    onSuccess: (updateClient) => {
      queryClient.setQueryData(
        ["client", String(updateClient.id)],
        updateClient,
      );

      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};
