import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserDefault, setUserDefault } from "../api/settingsApi";
import type { UserSettingKey } from "../models/UserSetting";
import { FILE_SYSTEM_TREE_QUERY_KEY } from "./useFileSystemTree";

export const USER_DEFAULTS_QUERY_KEY = "user-defaults" as const;

export const useUserDefault = (key: UserSettingKey) =>
  useQuery({
    queryKey: [USER_DEFAULTS_QUERY_KEY, key],
    queryFn: () => getUserDefault(key),
    staleTime: 5 * 60 * 1000,
  });

export const useSetUserDefault = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: UserSettingKey; value: number }) =>
      setUserDefault(key, value),
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: [USER_DEFAULTS_QUERY_KEY, key] });

      if (key === "DEFAULT_WORKSPACE") {
        queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_TREE_QUERY_KEY });
      }
    },
    onError: (err) => console.error("Error setting user default:", err),
  });
};
