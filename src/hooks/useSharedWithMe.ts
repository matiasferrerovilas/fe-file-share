import { useQuery } from "@tanstack/react-query";
import { getSharedWithMe } from "../api/userSharesApi";

export const SHARED_WITH_ME_QUERY_KEY = ["shared-with-me"] as const;

export const useSharedWithMe = () =>
  useQuery({
    queryKey: SHARED_WITH_ME_QUERY_KEY,
    queryFn: getSharedWithMe,
  });
