import { useMemo, useState } from "react";
import { App as AntdApp, Button, Empty, Flex, Spin, Typography, theme } from "antd";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import RollbackOutlined from "@ant-design/icons/RollbackOutlined";
import { useTranslation } from "react-i18next";
import type { FileSystemNode } from "../../models/FileSystemNode";
import { useRestoreNode } from "../../hooks/useTrash";
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
  const { message } = AntdApp.useApp();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const restoreMutation = useRestoreNode();

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
      message.error(t("files.bulkRestoreFailed", { failed, total: selectedNodes.length }));
    } else {
      message.success(t("files.itemsRestoredSuccess"));
    }
    clearSelection();
  };

  return (
    <>
      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>
        {title}
      </Typography.Title>
      <Text type="secondary" style={{ marginBottom: 16 }}>
        {t("files.trashRetentionHint")}
      </Text>
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
