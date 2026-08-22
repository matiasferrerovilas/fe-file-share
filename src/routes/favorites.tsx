import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import SmartFileListExplorer from "../components/files/SmartFileListExplorer";
import { useFavorites } from "../hooks/useFavorites";
import { RoleEnum } from "../enums/RoleEnum";
import { protectedRouteGuard } from "../auth/protectedRouteGuard";

export const Route = createFileRoute("/favorites")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { data: nodes = [], isLoading } = useFavorites();

  return (
    <SmartFileListExplorer
      nodes={nodes}
      title={t("files.favoritesTitle")}
      isLoading={isLoading}
      emptyDescription={t("files.emptyFavorites")}
    />
  );
}
