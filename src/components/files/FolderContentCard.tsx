import { useState } from "react";
import { Avatar, Card, Checkbox, Dropdown, Tag, Tooltip, theme } from "antd";
import { useTranslation } from "react-i18next";
import StarFilled from "@ant-design/icons/StarFilled";
import StarOutlined from "@ant-design/icons/StarOutlined";
import UsergroupAddOutlined from "@ant-design/icons/UsergroupAddOutlined";
import { formatFileSize } from "../../utils/formatFileSize";
import { shareAbbreviation } from "../../utils/shareAbbreviation";
import { getFolderIcon } from "../../utils/folderCustomization";
import type { FileSystemNode } from "../../models/FileSystemNode";
import { useFolderContentActions } from "../../hooks/useFolderContentActions";
import FileActivityModal from "./FileActivityModal";
import FilePreviewModal from "./FilePreviewModal";
import FolderCustomizeModal from "./FolderCustomizeModal";
import RenameNodeModal from "./RenameNodeModal";
import ShareWithPersonModal from "./ShareWithPersonModal";

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
    customizing,
    setCustomizing,
    sharingWithPerson,
    setSharingWithPerson,
    viewingActivity,
    setViewingActivity,
    isFavorite,
    handleToggleFavorite,
  } = useFolderContentActions(node);
  const folderIcon = getFolderIcon(node.metadata.folderIcon);
  const folderColor = node.metadata.folderColor;

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
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {node.shareWith && node.shareWith.length > 0 && (
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
          )}
          {node.metadata.sharedWithUserCount > 0 && (
            <Tooltip title={t("files.shareWithPerson.sharedWithCountTooltip", { count: node.metadata.sharedWithUserCount })}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 16,
                  color: token.colorPrimary,
                  background: token.colorBgContainer,
                  borderRadius: token.borderRadiusSM,
                  lineHeight: 0,
                  padding: 2,
                }}
              >
                <UsergroupAddOutlined />
              </span>
            </Tooltip>
          )}
          <Tooltip title={t(isFavorite ? "files.removeFromFavorites" : "files.addToFavorites")}>
            <span
              role="button"
              aria-label={t(isFavorite ? "files.removeFromFavorites" : "files.addToFavorites")}
              onClick={handleToggleFavorite}
              style={{
                cursor: "pointer",
                fontSize: 18,
                color: isFavorite ? token.colorWarning : token.colorTextTertiary,
                opacity: isFavorite || selected || selectionActive || hovering ? 1 : 0,
                transition: "opacity 0.15s ease",
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusSM,
                lineHeight: 0,
                padding: 2,
              }}
            >
              {isFavorite ? <StarFilled /> : <StarOutlined />}
            </span>
          </Tooltip>
        </div>
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
                  color: isFolder ? (folderColor ?? undefined) : undefined,
                }}
              >
                {isFolder ? folderIcon : fileTypeIcon}
              </div>
            }
          >
            <Card.Meta title={node.name} style={{ textAlign: "center" }} />
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <Tag
                icon={isFolder ? folderIcon : fileTypeIcon}
                color={isFolder ? (folderColor ?? "blue") : "default"}
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
      <FolderCustomizeModal
        key={customizing ? node.id : "closed"}
        node={
          customizing
            ? { id: node.id, name: node.name, color: node.metadata.folderColor, icon: node.metadata.folderIcon }
            : null
        }
        onClose={() => setCustomizing(false)}
      />
      <ShareWithPersonModal
        node={sharingWithPerson ? { id: node.id, name: node.name } : null}
        onClose={() => setSharingWithPerson(false)}
      />
      <FileActivityModal
        node={viewingActivity ? { id: node.id, name: node.name } : null}
        onClose={() => setViewingActivity(false)}
      />
    </>
  );
}
