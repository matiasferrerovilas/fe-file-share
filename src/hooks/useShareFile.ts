import { useMutation } from "@tanstack/react-query";
import { shareFile } from "../api/sharesApi";
import type { SharePermission } from "../models/FileShare";

interface ShareFileVariables {
  fileId: string;
  apiName: string;
  permission: SharePermission;
}

export const useShareFile = () =>
  useMutation({
    mutationFn: ({ fileId, apiName, permission }: ShareFileVariables) =>
      shareFile(fileId, apiName, permission),
  });
