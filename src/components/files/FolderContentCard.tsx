import { useState } from "react";
import { App as AntdApp, Card, Dropdown, Tag, theme, type MenuProps } from "antd";
import FileOutlined from "@ant-design/icons/FileOutlined";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { useNavigate } from "@tanstack/react-router";
import { FileSystemNodeType, type FileSystemNode } from "../../models/FileSystemNode";
import { formatFileSize } from "../../utils/formatFileSize";
import { useDeleteFolder } from "../../hooks/useDeleteFolder";
import RenameNodeModal from "./RenameNodeModal";

interface FolderContentCardProps {
  node: FileSystemNode;
}

export default function FolderContentCard({ node }: FolderContentCardProps) {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { modal, message } = AntdApp.useApp();
  const deleteMutation = useDeleteFolder();
  const [renaming, setRenaming] = useState(false);

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
    { key: "rename", label: "Renombrar", icon: <EditOutlined /> },
    { key: "delete", label: "Eliminar", icon: <DeleteOutlined />, danger: true },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key, domEvent }) => {
    domEvent.stopPropagation();
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
            style={{ width: 240, border: `1px solid ${token.colorPrimary}` }}
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
