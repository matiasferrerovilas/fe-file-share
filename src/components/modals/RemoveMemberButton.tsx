import { Button, Popconfirm, App } from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { removeWorkspaceMemberApi } from "../../api/workspaceApi";
import { USER_WORKSPACES_QUERY_KEY } from "../../hooks/useWorkspaces";

interface RemoveMemberButtonProps {
  workspaceId: number;
  userId: number;
  email: string;
}

export default function RemoveMemberButton({ workspaceId, userId, email }: RemoveMemberButtonProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const removeMemberMutation = useMutation({
    mutationFn: () => removeWorkspaceMemberApi(workspaceId, userId),
    onSuccess: () => {
      void message.success(t("workspace.removeMemberSuccess", { email }));
      void queryClient.invalidateQueries({ queryKey: USER_WORKSPACES_QUERY_KEY });
    },
    onError: () => {
      void message.error(t("workspace.removeMemberError", { email }));
    },
  });

  return (
    <Popconfirm
      title={t("workspace.removeMemberConfirmTitle", { email })}
      description={t("workspace.removeMemberConfirmDescription")}
      onConfirm={() => removeMemberMutation.mutate()}
      okText={t("workspace.removeMemberConfirmOk")}
      cancelText={t("workspace.removeMemberConfirmCancel")}
      okButtonProps={{ danger: true, loading: removeMemberMutation.isPending }}
      placement="topRight"
    >
      <Button
        type="text"
        danger
        size="small"
        icon={<DeleteOutlined />}
        title={t("workspace.removeMemberTooltip")}
        aria-label={t("workspace.removeMemberAriaLabel", { email })}
        loading={removeMemberMutation.isPending}
      />
    </Popconfirm>
  );
}
