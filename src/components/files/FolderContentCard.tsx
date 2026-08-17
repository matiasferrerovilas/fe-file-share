import { useState } from "react";
import { Avatar, Card, Checkbox, Dropdown, Tag, Tooltip, theme } from "antd";
import { useTranslation } from "react-i18next";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import { formatFileSize } from "../../utils/formatFileSize";
import { shareAbbreviation } from "../../utils/shareAbbreviation";
import type { FileSystemNode } from "../../models/FileSystemNode";
import { useFolderContentActions } from "../../hooks/useFolderContentActions";
import FilePreviewModal from "./FilePreviewModal";
import RenameNodeModal from "./RenameNodeModal";

interface FolderContentCardProps {
  node: FileSystemNode;
  selected: boolean;
  selectionActive: boolean;
  onToggleSelect: (id: string) => void;
}

export default function FolderContentCard({
  node,
  selected,
  selectionActive,
  onToggleSelect,
}: FolderContentCardProps) {
  const { t } = useTranslation();
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
  } = useFolderContentActions(node);

  return (
    <>
      {/* Evita que el click derecho también dispare el menú de "Crear carpeta" del panel */}
      <div
        onContextMenu={(e) => e.stopPropagation()}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{ position: "relative", width: 240 }}
      >
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 2,
            opacity: selected || selectionActive || hovering ? 1 : 0,
            transition: "opacity 0.15s ease",
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusSM,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(node.id);
          }}
        >
          <Checkbox checked={selected} />
        </div>
        {node.shareWith.length > 0 && (
          <div
            style={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar.Group>
              {node.shareWith.map((apiName) => (
                <Tooltip key={apiName} title={t("files.sharedWithTooltip", { apiName })}>
                  <Avatar
                    size={28}
                    style={{
                      backgroundColor: token.colorPrimary,
                      fontSize: 10,
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
        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={["contextMenu"]}>
          <Card
            hoverable
            draggable
            {...dragHandlers}
            style={{
              width: 240,
              border:
                dragDepth > 0
                  ? `2px dashed ${token.colorPrimary}`
                  : `1px solid ${token.colorPrimary}`,
              background: dragDepth > 0 ? token.colorPrimaryBg : undefined,
              transition: "border-color 0.15s ease, background 0.15s ease",
            }}
            onClick={handleActivate}
            cover={
              <div
                style={{
                  height: 160,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 64,
                  cursor: "pointer",
                }}
              >
                {isFolder ? <FolderOutlined /> : fileTypeIcon}
              </div>
            }
          >
            <Card.Meta title={node.name} style={{ textAlign: "center" }} />
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <Tag
                icon={isFolder ? <FolderOutlined /> : fileTypeIcon}
                color={isFolder ? "blue" : "default"}
                style={{ borderRadius: 16, fontWeight: 600 }}
              >
                {isFolder ? t("files.folder") : t("files.fileWithSize", { size: formatFileSize(node.metadata.size ?? 0) })}
              </Tag>
            </div>
          </Card>
        </Dropdown>
      </div>
      <RenameNodeModal node={renaming ? node : null} onClose={() => setRenaming(false)} />
      <FilePreviewModal node={previewing ? node : null} onClose={() => setPreviewing(false)} />
    </>
  );
}
