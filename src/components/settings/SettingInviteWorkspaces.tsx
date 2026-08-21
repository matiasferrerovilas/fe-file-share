import MailOutlined from "@ant-design/icons/MailOutlined";
import { Badge, Card, Space, theme, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useWorkspaceInvitations } from "../../hooks/useWorkspaces";
import type { Invitations } from "../../models/Workspace";
import SettingInviteWorkspaceCard from "./SettingInviteWorkspaceCard";
import { useInvitationSubscription } from "../../websocket/useInvitationSubscription";

const { Text } = Typography;

export function SettingInviteWorkspaces() {
  const { data: invitations, isFetching } = useWorkspaceInvitations();
  const { token } = theme.useToken();
  const { t } = useTranslation();

  useInvitationSubscription();

  if (!invitations || invitations.length === 0) {
    return null;
  }

  return (
    <Card
      loading={isFetching}
      title={
        <Space align="center">
          <MailOutlined style={{ color: token.colorPrimary, fontSize: 18 }} />
          <Text strong>{t("workspace.pendingInvitationsTitle")}</Text>
          <Badge count={invitations.length} style={{ backgroundColor: token.colorPrimary, fontWeight: "bold" }} />
        </Space>
      }
      style={{
        backgroundColor: token.colorPrimaryBg,
        borderRadius: 12,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
      styles={{
        header: { borderBottom: "none", padding: "12px 16px" },
        body: { display: "flex", justifyContent: "space-between", padding: "12px 16px" },
      }}
    >
      <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
        {invitations.map((invite: Invitations) => (
          <SettingInviteWorkspaceCard key={invite.id} invite={invite} />
        ))}
      </Space>
    </Card>
  );
}
