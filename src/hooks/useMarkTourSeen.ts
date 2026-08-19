import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markTourAsSeen } from "../api/onboarding/onboardinApi";
import { CURRENT_USER_QUERY_KEY } from "./useCurrentUser";
import type { CurrentUser } from "../models/CurrentUser";

export const useMarkTourSeen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markTourAsSeen,
    onSuccess: () => {
      queryClient.setQueryData<CurrentUser>(CURRENT_USER_QUERY_KEY, (old) =>
        old ? { ...old, metadata: { ...old.metadata, hasSeenTour: true } } : old,
      );
    },
  });
};
