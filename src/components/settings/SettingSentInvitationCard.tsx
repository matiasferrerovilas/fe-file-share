import Card from "antd/es/card/Card";
import type { SentInvitation } from "../../models/Workspace";
import { App, Button, Flex, Popconfirm, theme, Typography } from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import MailOutlined from "@ant-design/icons/MailOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { cancelWorkspaceInvitationApi } from "../../api/workspaceApi";
import { SENT_INVITATIONS_WORKSPACES_QUERY_KEY } from "../../hooks/useWorkspaces";

const { Text } = Typography;

interface SettingSentInvitationCardProps {
  invite: SentInvitation;
}

export default function SettingSentInvitationCard({ invite }: SettingSentInvitationCardProps) {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const cancelInvitationMutation = useMutation({
    mutationFn: () => cancelWorkspaceInvitationApi(invite.id),
    onSuccess: () => {
      void message.success(t("workspace.cancelInvitationSuccess"));
      void queryClient.invalidateQueries({ queryKey: SENT_INVITATIONS_WORKSPACES_QUERY_KEY });
    },
    onError: () => {
      void message.error(t("workspace.cancelInvitationError"));
    },
  });

  return (
    <Card
      hoverable
      styles={{ body: { padding: "14px 18px" } }}
      style={{
        borderRadius: 14,
        border: `1.5px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
      }}
    >
      <Flex align="center" justify="space-between" gap={12} style={{ minWidth: 0 }}>
        <Flex align="center" gap={12} style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              flexShrink: 0,
              background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 12px ${token.colorPrimaryBorder}`,
            }}
          >
            <MailOutlined style={{ color: "#fff", fontSize: 20 }} />
          </div>
          <Flex vertical gap={4} style={{ minWidth: 0, flex: 1 }}>
            <Text
              strong
              style={{
                fontSize: 15,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {invite.workspaceName}
            </Text>
            <Flex align="center" gap={6} style={{ minWidth: 0 }}>
              <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>
                {t("workspace.invitedUserLabel")}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: token.colorPrimary,
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {invite.invitedUserEmail}
              </Text>
            </Flex>
          </Flex>
        </Flex>

        <Popconfirm
          title={t("workspace.cancelInvitationConfirmTitle")}
          description={t("workspace.cancelInvitationConfirmDescription", {
            email: invite.invitedUserEmail,
          })}
          onConfirm={() => cancelInvitationMutation.mutate()}
          okText={t("workspace.cancelInvitationConfirmOk")}
          cancelText={t("workspace.cancelInvitationConfirmCancel")}
          okButtonProps={{ danger: true, loading: cancelInvitationMutation.isPending }}
          placement="topRight"
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={cancelInvitationMutation.isPending}
            style={{ borderRadius: 20, fontWeight: 600, flexShrink: 0 }}
          >
            {t("workspace.cancelInvitationButton")}
          </Button>
        </Popconfirm>
      </Flex>
    </Card>
  );
}
