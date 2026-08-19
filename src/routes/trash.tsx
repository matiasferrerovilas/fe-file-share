import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import TrashExplorer from "../components/files/TrashExplorer";
import { useTrash } from "../hooks/useTrash";
import { RoleEnum } from "../enums/RoleEnum";
import { protectedRouteGuard } from "../auth/protectedRouteGuard";

export const Route = createFileRoute("/trash")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { data: nodes = [], isLoading } = useTrash();

  return <TrashExplorer nodes={nodes} title={t("files.trashTitle")} isLoading={isLoading} />;
}
