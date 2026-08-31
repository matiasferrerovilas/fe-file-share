import { useMemo, useState } from "react";
import { App as AntdApp, Button, Empty, Flex, Popconfirm, Spin, Typography, theme } from "antd";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import RollbackOutlined from "@ant-design/icons/RollbackOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { useTranslation } from "react-i18next";
import type { FileSystemNode } from "../../models/FileSystemNode";
import { useRestoreNode, usePurgeNode } from "../../hooks/useTrash";
import { describeBulkFailures } from "../../utils/describeBulkFailures";
import TrashContentRow from "./TrashContentRow";

const { Text } = Typography;

interface TrashContentsPanelProps {
  nodes: FileSystemNode[];
  title: string;
  isLoading?: boolean;
}

export default function TrashContentsPanel({ nodes, title, isLoading }: TrashContentsPanelProps) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, notification } = AntdApp.useApp();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const restoreMutation = useRestoreNode();
  const purgeMutation = usePurgeNode();

  const rows = useMemo(() => [...nodes].sort((a, b) => a.name.localeCompare(b.name)), [nodes]);
  const selectedNodes = useMemo(() => rows.filter((node) => selectedIds.has(node.id)), [rows, selectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkRestore = async () => {
    const results = await Promise.allSettled(selectedNodes.map((node) => restoreMutation.mutateAsync(node.id)));
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      notification.error({
        message: t("files.bulkRestoreFailed", { failed, total: selectedNodes.length }),
        description: describeBulkFailures(selectedNodes, results),
      });
    } else {
      message.success(t("files.itemsRestoredSuccess"));
    }
    clearSelection();
  };

  const purgeNodes = async (targets: FileSystemNode[]) => {
    const results = await Promise.allSettled(targets.map((node) => purgeMutation.mutateAsync(node.id)));
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      notification.error({
        message: t("files.bulkPurgeFailed", { failed, total: targets.length }),
        description: describeBulkFailures(targets, results),
      });
    } else {
      message.success(t("files.itemsPurgedSuccess"));
    }
  };

  const handleBulkPurge = async () => {
    await purgeNodes(selectedNodes);
    clearSelection();
  };

  const handleEmptyTrash = () => purgeNodes(rows);

  return (
    <>
      <Flex align="center" justify="space-between" wrap gap={8}>
        <div>
          <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>
            {title}
          </Typography.Title>
          <Text type="secondary">{t("files.trashRetentionHint")}</Text>
        </div>
        {rows.length > 0 && (
          <Popconfirm
            title={t("files.emptyTrashConfirmTitle")}
            description={t("files.emptyTrashConfirmDescription", { count: rows.length })}
            onConfirm={handleEmptyTrash}
            okText={t("files.purgeConfirmOk")}
            cancelText={t("files.purgeConfirmCancel")}
            okButtonProps={{ danger: true, loading: purgeMutation.isPending }}
          >
            <Button danger icon={<DeleteOutlined />}>
              {t("files.emptyTrashButton")}
            </Button>
          </Popconfirm>
        )}
      </Flex>
      {selectedNodes.length > 0 && (
        <Flex
          align="center"
          gap={12}
          wrap
          style={{
            marginTop: 16,
            marginBottom: 16,
            padding: "8px 12px",
            background: token.colorFillTertiary,
            borderRadius: token.borderRadius,
          }}
        >
          <Text strong>{t("files.selectedCount", { count: selectedNodes.length })}</Text>
          <Button icon={<RollbackOutlined />} onClick={handleBulkRestore}>
            {t("files.restore")}
          </Button>
          <Popconfirm
            title={t("files.emptyTrashConfirmTitle")}
            description={t("files.purgeConfirmDescription")}
            onConfirm={handleBulkPurge}
            okText={t("files.purgeConfirmOk")}
            cancelText={t("files.purgeConfirmCancel")}
            okButtonProps={{ danger: true, loading: purgeMutation.isPending }}
          >
            <Button danger icon={<DeleteOutlined />}>
              {t("files.purgeNow")}
            </Button>
          </Popconfirm>
          <Button type="text" icon={<CloseOutlined />} onClick={clearSelection} />
        </Flex>
      )}
      <div style={{ flex: 1, minHeight: "60vh", marginTop: 16 }}>
        {isLoading ? (
          <Flex align="center" justify="center" style={{ minHeight: "50vh" }}>
            <Spin />
          </Flex>
        ) : rows.length === 0 ? (
          <Flex vertical align="center" justify="center" style={{ minHeight: "50vh" }}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<Text>{t("files.emptyTrash")}</Text>} />
          </Flex>
        ) : (
          <Flex vertical gap={4}>
            {rows.map((node) => (
              <TrashContentRow
                key={node.id}
                node={node}
                selected={selectedIds.has(node.id)}
                selectionActive={selectedIds.size > 0}
                onToggleSelect={toggleSelect}
              />
            ))}
          </Flex>
        )}
      </div>
    </>
  );
}
