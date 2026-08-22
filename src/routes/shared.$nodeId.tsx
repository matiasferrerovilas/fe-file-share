import { createFileRoute } from "@tanstack/react-router";
import SharedFolderBrowser from "../components/files/SharedFolderBrowser";
import { RoleEnum } from "../enums/RoleEnum";
import { protectedRouteGuard } from "../auth/protectedRouteGuard";

export const Route = createFileRoute("/shared/$nodeId")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { nodeId } = Route.useParams();
  return <SharedFolderBrowser key={nodeId} nodeId={nodeId} />;
}
