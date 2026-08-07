import { createFileRoute } from "@tanstack/react-router";
import { protectedRouteGuard } from "../auth/protectedRouteGuard";
import { RoleEnum } from "../enums/RoleEnum";
import { HelpPage } from "../components/help/HelpPage";

export const Route = createFileRoute("/help")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <HelpPage />;
}
