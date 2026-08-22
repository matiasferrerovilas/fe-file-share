import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import SmartFileListExplorer from "../components/files/SmartFileListExplorer";
import { useRecentFiles } from "../hooks/useRecentFiles";
import { RoleEnum } from "../enums/RoleEnum";
import { protectedRouteGuard } from "../auth/protectedRouteGuard";

export const Route = createFileRoute("/recent")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { data: nodes = [], isLoading } = useRecentFiles();

  return (
    <SmartFileListExplorer
      nodes={nodes}
      title={t("files.recentTitle")}
      isLoading={isLoading}
      emptyDescription={t("files.emptyRecent")}
    />
  );
}
