import { Avatar, Card, Divider, Empty, Flex, Tag, theme, Tooltip, Typography } from "antd";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import MailOutlined from "@ant-design/icons/MailOutlined";
import { useTranslation } from "react-i18next";
import { useCurrentWorkspace } from "../../workspace/WorkspaceContext";
import { useWorkspacesSubscription } from "../../websocket/useWorkspacesSubscription";
import InviteUserToWorkspace from "../modals/InviteUserToWorkspace";
import ExitWorkspaceModal from "../modals/ExitWorkspaceModal";
import RemoveMemberButton from "../modals/RemoveMemberButton";
import { useCurrentUser } from "../../hooks/useCurrentUser";

const { Title, Text } = Typography;

export function SettingCurrentWorkspace() {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { currentWorkspace, workspaces, isLoading } = useCurrentWorkspace();
  // Los miembros vienen incluidos en el workspace activo (metadata.memberDetails)
  const memberDetails = currentWorkspace?.metadata.memberDetails ?? [];
  const { data: currentUser } = useCurrentUser();

  // Solo el OWNER del workspace puede eliminar miembros — mismo criterio que valida el backend
  // (api-identity, WorkspaceMembershipService.removeMembership).
  const canRemoveMembers = currentWorkspace?.metadata.role === "OWNER";

  useWorkspacesSubscription();

  // Solo mostrar botón de salir si hay más de un workspace
  const canLeave = workspaces.length > 1;

  if (!currentWorkspace) {
    return (
      <Card loading={isLoading} style={{ borderRadius: 16 }}>
        <Empty description={t("workspace.noWorkspaceSelected")} />
      </Card>
    );
  }

  return (
    <Card loading={isLoading} style={{ borderRadius: 16 }}>
      <Flex align="center" gap={10} style={{ marginBottom: 4 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 3px 10px ${token.colorPrimaryBorder}`,
          }}
        >
          <TeamOutlined style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div style={{ flex: 1 }}>
          <Flex align="center" gap={8}>
            <Title level={5} style={{ margin: 0 }}>
              {currentWorkspace.workspaceName}
            </Title>
            <span
              style={{
                background: token.colorFillSecondary,
                borderRadius: 12,
                color: token.colorTextSecondary,
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
              }}
            >
              {t("workspace.memberCount", { count: currentWorkspace.metadata.members.length })}
            </span>
          </Flex>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t("workspace.manageWorkspace")}
          </Text>
        </div>
        {canLeave && <ExitWorkspaceModal group={currentWorkspace} />}
      </Flex>

      <Divider style={{ margin: "14px 0" }} />

      <div>
        <Flex align="center" justify="space-between" style={{ marginBottom: 12 }}>
          <Flex align="center" gap={8}>
            <UserOutlined style={{ color: token.colorTextSecondary }} />
            <Text strong style={{ fontSize: 14 }}>
              {t("workspace.members")}
            </Text>
          </Flex>
          <InviteUserToWorkspace group={currentWorkspace} />
        </Flex>
        {memberDetails.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("workspace.noMembers")}
          />
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {memberDetails.map((member, index) => (
              <li
                key={member.userId}
                style={{
                  padding: "8px 0",
                  borderBottom:
                    index < memberDetails.length - 1
                      ? `1px solid ${token.colorBorderSecondary}`
                      : undefined,
                }}
              >
                <Flex align="center" justify="space-between" style={{ width: "100%" }}>
                  <Flex align="center" gap={12}>
                    <Avatar
                      size={32}
                      icon={<UserOutlined />}
                      style={{ backgroundColor: token.colorPrimaryBg, color: token.colorPrimary }}
                    />
                    <Flex align="center" gap={6}>
                      <MailOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
                      <Text style={{ fontSize: 13 }}>{member.email}</Text>
                      {member.role === "OWNER" && (
                        <Tooltip title={t("workspace.ownerTooltip")}>
                          <Tag color="gold" style={{ marginInlineEnd: 0 }}>
                            {t("workspace.ownerTag")}
                          </Tag>
                        </Tooltip>
                      )}
                    </Flex>
                  </Flex>
                  {canRemoveMembers && member.email !== currentUser?.email && (
                    <RemoveMemberButton
                      workspaceId={currentWorkspace.workspaceId}
                      userId={member.userId}
                      email={member.email}
                    />
                  )}
                </Flex>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
