import { createFileRoute } from "@tanstack/react-router";
import { Col, Flex, Row, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { protectedRouteGuard } from "../auth/protectedRouteGuard";
import { RoleEnum } from "../enums/RoleEnum";
import { SettingInviteWorkspaces } from "../components/settings/SettingInviteWorkspaces";
import { SettingCurrentWorkspace } from "../components/settings/SettingCurrentWorkspace";

const { Title } = Typography;

export const Route = createFileRoute("/settings")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <Row justify="center" style={{ paddingTop: 30, paddingBottom: 30 }}>
      <Col xs={22} md={18} lg={14}>
        <Title level={4} style={{ marginBottom: 20 }}>
          {t("nav.settings")}
        </Title>
        <Flex vertical gap={16}>
          <SettingInviteWorkspaces />
          <SettingCurrentWorkspace />
        </Flex>
      </Col>
    </Row>
  );
}
