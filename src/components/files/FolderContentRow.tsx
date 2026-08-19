import { useState } from "react";
import { Avatar, Checkbox, Dropdown, Flex, Tooltip, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import StarFilled from "@ant-design/icons/StarFilled";
import StarOutlined from "@ant-design/icons/StarOutlined";
import { formatFileSize } from "../../utils/formatFileSize";
import { shareAbbreviation } from "../../utils/shareAbbreviation";
import type { FileSystemNode } from "../../models/FileSystemNode";
import { useFolderContentActions } from "../../hooks/useFolderContentActions";
import FilePreviewModal from "./FilePreviewModal";
import RenameNodeModal from "./RenameNodeModal";

const { Text } = Typography;

interface FolderContentRowProps {
  node: FileSystemNode;
  selected: boolean;
  selectionActive: boolean;
  onToggleSelect: (id: string) => void;
}

export default function FolderContentRow({
  node,
  selected,
  selectionActive,
  onToggleSelect,
}: FolderContentRowProps) {
  const { t, i18n } = useTranslation();
  const { token } = theme.useToken();
  const [hovering, setHovering] = useState(false);
  const {
    isFolder,
    fileTypeIcon,
    menuItems,
    handleMenuClick,
    handleActivate,
    dragDepth,
    dragHandlers,
    renaming,
    setRenaming,
    previewing,
    setPreviewing,
    isFavorite,
    handleToggleFavorite,
  } = useFolderContentActions(node);

  const formattedDate = new Date(node.metadata.lastModified).toLocaleDateString(i18n.language, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={["contextMenu"]}>
        <Flex
          align="center"
          gap={12}
          draggable
          {...dragHandlers}
          onContextMenu={(e) => e.stopPropagation()}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onClick={handleActivate}
          className="fade-in-up"
          style={{
            padding: "8px 12px",
            borderRadius: token.borderRadius,
            border: dragDepth > 0 ? `1px dashed ${token.colorPrimary}` : "1px solid transparent",
            background: dragDepth > 0 ? token.colorPrimaryBg : hovering ? token.colorFillTertiary : undefined,
            cursor: isFolder ? "pointer" : "default",
            transition: "background 0.15s ease, border-color 0.15s ease",
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selected}
              style={{ opacity: selected || selectionActive || hovering ? 1 : 0 }}
              onChange={() => onToggleSelect(node.id)}
            />
          </div>
          <div style={{ fontSize: 20, width: 24, display: "flex", justifyContent: "center" }}>
            {isFolder ? <FolderOutlined /> : fileTypeIcon}
          </div>
          <Tooltip title={t(isFavorite ? "files.removeFromFavorites" : "files.addToFavorites")}>
            <span
              role="button"
              aria-label={t(isFavorite ? "files.removeFromFavorites" : "files.addToFavorites")}
              onClick={handleToggleFavorite}
              style={{
                cursor: "pointer",
                fontSize: 15,
                color: isFavorite ? token.colorWarning : token.colorTextTertiary,
                opacity: isFavorite || hovering ? 1 : 0,
                transition: "opacity 0.15s ease",
                lineHeight: 0,
                flexShrink: 0,
              }}
            >
              {isFavorite ? <StarFilled /> : <StarOutlined />}
            </span>
          </Tooltip>
          <Text style={{ flex: 1, minWidth: 0 }} ellipsis={{ tooltip: node.name }}>
            {node.name}
          </Text>
          {node.shareWith && node.shareWith.length > 0 && (
            <div onClick={(e) => e.stopPropagation()}>
              <Avatar.Group>
                {node.shareWith.map((apiName) => (
                  <Tooltip key={apiName} title={t("files.sharedWithTooltip", { apiName })}>
                    <Avatar
                      size={22}
                      style={{
                        backgroundColor: token.colorPrimary,
                        fontSize: 9,
                        fontWeight: 600,
                        cursor: "default",
                      }}
                    >
                      {shareAbbreviation(apiName)}
                    </Avatar>
                  </Tooltip>
                ))}
              </Avatar.Group>
            </div>
          )}
          <Text type="secondary" style={{ width: 90, textAlign: "right", flexShrink: 0 }}>
            {isFolder ? "—" : formatFileSize(node.metadata.size ?? 0)}
          </Text>
          <Text type="secondary" style={{ width: 100, textAlign: "right", flexShrink: 0 }}>
            {formattedDate}
          </Text>
        </Flex>
      </Dropdown>
      <RenameNodeModal node={renaming ? node : null} onClose={() => setRenaming(false)} />
      <FilePreviewModal node={previewing ? node : null} onClose={() => setPreviewing(false)} />
    </>
  );
}
