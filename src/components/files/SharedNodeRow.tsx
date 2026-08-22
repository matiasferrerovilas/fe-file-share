import { useState } from "react";
import { App as AntdApp, Flex, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import { formatFileSize } from "../../utils/formatFileSize";
import { getFolderIcon } from "../../utils/folderCustomization";
import { isPreviewableContentType } from "../../utils/filePreview";
import { getFileTypeIcon } from "../../utils/getFileTypeIcon";
import { useDownloadFile } from "../../hooks/useDownloadFile";
import { FileSystemNodeType, type FileSystemNode } from "../../models/FileSystemNode";
import FilePreviewModal from "./FilePreviewModal";

const { Text } = Typography;

interface SharedNodeRowProps {
  node: FileSystemNode;
  /** Only called for folders — a file opens its own preview/download instead of navigating. */
  onOpenFolder: (node: FileSystemNode) => void;
}

/**
 * Read-mostly row for browsing content shared by someone else (Compartido conmigo /
 * SharedFolderBrowser) — deliberately not FolderContentCard/Row, which are tightly coupled to
 * useFolderContentActions' owner-centric rename/delete/customize/share menu. None of that applies
 * here: a shared node can only be opened (folder) or previewed/downloaded (file).
 */
export default function SharedNodeRow({ node, onOpenFolder }: SharedNodeRowProps) {
  const { t, i18n } = useTranslation();
  const { token } = theme.useToken();
  const { message } = AntdApp.useApp();
  const [previewing, setPreviewing] = useState(false);
  const downloadMutation = useDownloadFile();

  const isFolder = node.metadata.type === FileSystemNodeType.FOLDER;
  const previewable = !isFolder && isPreviewableContentType(node.name, node.metadata.contentType);
  const icon = isFolder ? getFolderIcon(node.metadata.folderIcon) : getFileTypeIcon(node.metadata.contentType);
  const folderColor = node.metadata.folderColor;

  const formattedDate = new Date(node.metadata.lastModified).toLocaleDateString(i18n.language, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleClick = () => {
    if (isFolder) {
      onOpenFolder(node);
      return;
    }
    if (previewable) {
      setPreviewing(true);
      return;
    }
    downloadMutation.mutate(node.id, {
      onError: () => message.error(t("files.downloadFailed", { name: node.name })),
    });
  };

  return (
    <>
      <Flex
        align="center"
        gap={12}
        onClick={handleClick}
        style={{
          padding: "8px 12px",
          borderRadius: token.borderRadius,
          cursor: "pointer",
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = token.colorFillTertiary)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div
          style={{
            fontSize: 20,
            width: 24,
            display: "flex",
            justifyContent: "center",
            color: isFolder ? (folderColor ?? undefined) : undefined,
          }}
        >
          {isFolder ? icon : icon}
        </div>
        <Text style={{ flex: 1, minWidth: 0 }} ellipsis={{ tooltip: node.name }}>
          {node.name}
        </Text>
        <Text type="secondary" style={{ width: 90, textAlign: "right", flexShrink: 0 }}>
          {isFolder ? <FolderOutlined /> : formatFileSize(node.metadata.size ?? 0)}
        </Text>
        <Text type="secondary" style={{ width: 100, textAlign: "right", flexShrink: 0 }}>
          {formattedDate}
        </Text>
      </Flex>
      <FilePreviewModal node={previewing ? node : null} onClose={() => setPreviewing(false)} />
    </>
  );
}
