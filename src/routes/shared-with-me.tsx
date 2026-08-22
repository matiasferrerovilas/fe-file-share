import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Empty, Flex, Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";
import SharedNodeRow from "../components/files/SharedNodeRow";
import { useSharedWithMe } from "../hooks/useSharedWithMe";
import type { FileSystemNode } from "../models/FileSystemNode";
import { RoleEnum } from "../enums/RoleEnum";
import { protectedRouteGuard } from "../auth/protectedRouteGuard";

const { Title } = Typography;

export const Route = createFileRoute("/shared-with-me")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: nodes = [], isLoading } = useSharedWithMe();

  const handleOpenFolder = (node: FileSystemNode) => {
    void navigate({ to: "/shared/$nodeId", params: { nodeId: node.id } });
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
        {t("files.sharedWithMe.title")}
      </Title>
      {isLoading ? (
        <Flex align="center" justify="center" style={{ minHeight: "50vh" }}>
          <Spin />
        </Flex>
      ) : nodes.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("files.sharedWithMe.empty")} />
      ) : (
        <Flex vertical gap={4}>
          {nodes.map((node) => (
            <SharedNodeRow key={node.id} node={node} onOpenFolder={handleOpenFolder} />
          ))}
        </Flex>
      )}
    </div>
  );
}
