import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios";

interface LaravelRepairPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  data: any[];
}

export const useRepairs = (status: string, search: string, page: number) => {
  return useQuery<LaravelRepairPagination>({
    queryKey: ["repairs", { status, search, page }],
    queryFn: async () => {
      const response = await api.get("/api/repairs", {
        params: {
          status: status || undefined,
          search: search || undefined,
          page: page,
        },
      });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};
