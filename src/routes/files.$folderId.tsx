import { createFileRoute } from "@tanstack/react-router";
import FileExplorer from "../components/files/FileExplorer";
import { RoleEnum } from "../enums/RoleEnum";
import { protectedRouteGuard } from "../auth/protectedRouteGuard";

export const Route = createFileRoute("/files/$folderId")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { folderId } = Route.useParams();
  return <FileExplorer folderId={folderId} />;
}
