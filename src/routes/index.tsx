import { createFileRoute } from "@tanstack/react-router";
import FileExplorer from "../components/files/FileExplorer";
import { ROOT_FOLDER_ID } from "../api/foldersApi";
import { RoleEnum } from "../enums/RoleEnum";
import { protectedRouteGuard } from "../auth/protectedRouteGuard";

export const Route = createFileRoute("/")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <FileExplorer folderId={ROOT_FOLDER_ID} />;
}
