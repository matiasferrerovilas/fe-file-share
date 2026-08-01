import { useState } from "react";
import { App as AntdApp, Card, Dropdown, Tag, theme, type MenuProps } from "antd";
import FileOutlined from "@ant-design/icons/FileOutlined";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import DownloadOutlined from "@ant-design/icons/DownloadOutlined";
import { useNavigate } from "@tanstack/react-router";
import { FileSystemNodeType, type FileSystemNode } from "../../models/FileSystemNode";
import { formatFileSize } from "../../utils/formatFileSize";
import { useDeleteFolder } from "../../hooks/useDeleteFolder";
import { useDownloadFile } from "../../hooks/useDownloadFile";
import { useMoveNode, MOVE_NODE_DATA_TYPE } from "../../hooks/useMoveNode";
import RenameNodeModal from "./RenameNodeModal";

interface FolderContentCardProps {
  node: FileSystemNode;
}

export default function FolderContentCard({ node }: FolderContentCardProps) {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { modal, message } = AntdApp.useApp();
  const deleteMutation = useDeleteFolder();
  const downloadMutation = useDownloadFile();
  const { moveIfValid } = useMoveNode();
  const [renaming, setRenaming] = useState(false);
  const [dragDepth, setDragDepth] = useState(0);

  const isFolder = node.type === FileSystemNodeType.FOLDER;

  const handleDelete = () => {
    modal.confirm({
      title: `Eliminar "${node.name}"`,
      content: isFolder
        ? "Se eliminará la carpeta y todo su contenido. Esta acción no se puede deshacer."
        : "Esta acción no se puede deshacer.",
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: () =>
        deleteMutation.mutateAsync(node.id).catch(() => {
          message.error(`No se pudo eliminar "${node.name}"`);
        }),
    });
  };

  const menuItems: MenuProps["items"] = [
    ...(!isFolder
      ? [{ key: "download", label: "Descargar", icon: <DownloadOutlined /> }]
      : []),
    { key: "rename", label: "Renombrar", icon: <EditOutlined /> },
    { key: "delete", label: "Eliminar", icon: <DeleteOutlined />, danger: true },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key, domEvent }) => {
    domEvent.stopPropagation();
    if (key === "download") {
      downloadMutation.mutate(node.id, {
        onError: () => message.error(`No se pudo descargar "${node.name}"`),
      });
    }
    if (key === "rename") setRenaming(true);
    if (key === "delete") handleDelete();
  };

  return (
    <>
      {/* Evita que el click derecho también dispare el menú de "Crear carpeta" del panel */}
      <div onContextMenu={(e) => e.stopPropagation()}>
        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={["contextMenu"]}>
          <Card
            hoverable
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(MOVE_NODE_DATA_TYPE, node.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragEnter={(e) => {
              if (!isFolder) return;
              e.preventDefault();
              setDragDepth((d) => d + 1);
            }}
            onDragOver={(e) => {
              if (!isFolder) return;
              e.preventDefault();
            }}
            onDragLeave={(e) => {
              if (!isFolder) return;
              e.preventDefault();
              setDragDepth((d) => Math.max(0, d - 1));
            }}
            onDrop={(e) => {
              if (!isFolder) return;
              e.preventDefault();
              setDragDepth(0);
              const draggedId = e.dataTransfer.getData(MOVE_NODE_DATA_TYPE);
              moveIfValid(draggedId, node.id);
            }}
            style={{
              width: 240,
              border:
                dragDepth > 0
                  ? `2px dashed ${token.colorPrimary}`
                  : `1px solid ${token.colorPrimary}`,
              background: dragDepth > 0 ? token.colorPrimaryBg : undefined,
              transition: "border-color 0.15s ease, background 0.15s ease",
            }}
            onClick={() => {
              if (node.type !== FileSystemNodeType.FOLDER) return;
              navigate({ to: "/files/$folderId", params: { folderId: node.id } });
            }}
            cover={
              <div
                style={{
                  height: 160,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 64,
                }}
              >
                {isFolder ? <FolderOutlined /> : <FileOutlined />}
              </div>
            }
          >
            <Card.Meta title={node.name} style={{ textAlign: "center" }} />
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <Tag
                icon={isFolder ? <FolderOutlined /> : <FileOutlined />}
                color={isFolder ? "blue" : "default"}
                style={{ borderRadius: 16, fontWeight: 600 }}
              >
                {isFolder ? "Carpeta" : `Archivo · ${formatFileSize(node.size ?? 0)}`}
              </Tag>
            </div>
          </Card>
        </Dropdown>
      </div>
      <RenameNodeModal node={renaming ? node : null} onClose={() => setRenaming(false)} />
    </>
  );
}
