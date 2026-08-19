import { useState } from "react";
import { App as AntdApp, Button, Checkbox, Flex, Tooltip, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import RollbackOutlined from "@ant-design/icons/RollbackOutlined";
import { formatFileSize } from "../../utils/formatFileSize";
import { getFileTypeIcon } from "../../utils/getFileTypeIcon";
import { FileSystemNodeType, type FileSystemNode } from "../../models/FileSystemNode";
import { useRestoreNode } from "../../hooks/useTrash";

const { Text } = Typography;

interface TrashContentRowProps {
  node: FileSystemNode;
  selected: boolean;
  selectionActive: boolean;
  onToggleSelect: (id: string) => void;
}

export default function TrashContentRow({ node, selected, selectionActive, onToggleSelect }: TrashContentRowProps) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = AntdApp.useApp();
  const [hovering, setHovering] = useState(false);
  const restoreMutation = useRestoreNode();

  const isFolder = node.metadata.type === FileSystemNodeType.FOLDER;
  const fileTypeIcon = getFileTypeIcon(node.metadata.contentType);

  const handleRestore = () => {
    restoreMutation.mutate(node.id, {
      onError: () => message.error(t("files.restoreFailed", { name: node.name })),
    });
  };

  return (
    <Flex
      align="center"
      gap={12}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="fade-in-up"
      style={{
        padding: "8px 12px",
        borderRadius: token.borderRadius,
        background: hovering ? token.colorFillTertiary : undefined,
        transition: "background 0.15s ease",
      }}
    >
      <Checkbox
        checked={selected}
        style={{ opacity: selected || selectionActive || hovering ? 1 : 0 }}
        onChange={() => onToggleSelect(node.id)}
      />
      <div style={{ fontSize: 20, width: 24, display: "flex", justifyContent: "center" }}>
        {isFolder ? <FolderOutlined /> : fileTypeIcon}
      </div>
      <Text style={{ flex: 1, minWidth: 0 }} ellipsis={{ tooltip: node.name }}>
        {node.name}
      </Text>
      <Text type="secondary" style={{ width: 90, textAlign: "right", flexShrink: 0 }}>
        {isFolder ? "—" : formatFileSize(node.metadata.size ?? 0)}
      </Text>
      <Tooltip title={t("files.restore")}>
        <Button
          icon={<RollbackOutlined />}
          loading={restoreMutation.isPending}
          onClick={handleRestore}
          style={{ flexShrink: 0 }}
        >
          {t("files.restore")}
        </Button>
      </Tooltip>
    </Flex>
  );
}
