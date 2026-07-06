import { redirect } from "@tanstack/react-router";
import type { RootRouteContext } from "../../routes/__root";

export const onBoardingGuard = async ({
  context,
}: {
  context: RootRouteContext;
}) => {
  const { auth } = context;
  if (auth.loading) return;

  if (!auth.firstLogin) {
    throw redirect({ to: "/" });
  }
};
