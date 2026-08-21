import { Button, Popconfirm } from "antd";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Workspace } from "../../models/Workspace";
import { exitWorkspaceApi } from "../../api/workspaceApi";
import { USER_WORKSPACES_QUERY_KEY } from "../../hooks/useWorkspaces";

interface ExitWorkspaceModalProps {
  group: Workspace;
}

export default function ExitWorkspaceModal({ group }: ExitWorkspaceModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const exitWorkspaceMutation = useMutation({
    mutationFn: () => exitWorkspaceApi(group.workspaceId),
    onError: (err) => console.error("Error saliendo del workspace:", err),
    onSuccess: () => {
      console.debug("✅ Saliste del workspace correctamente");
      queryClient.invalidateQueries({ queryKey: USER_WORKSPACES_QUERY_KEY });
    },
  });

  return (
    <Popconfirm
      title={t("workspace.exitConfirmTitle")}
      onConfirm={() => exitWorkspaceMutation.mutate()}
      okText={t("workspace.exitConfirmOk")}
      cancelText={t("workspace.exitConfirmCancel")}
      placement="topRight"
    >
      <Button
        type="text"
        icon={<LogoutOutlined style={{ fontSize: 18 }} />}
        danger
        title={t("workspace.exitButton")}
        aria-label={t("workspace.exitButton")}
      />
    </Popconfirm>
  );
}
