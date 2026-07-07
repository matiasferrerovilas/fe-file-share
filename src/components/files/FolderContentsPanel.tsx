import { useCallback, useMemo } from "react";
import {
  App as AntdApp,
  Breadcrumb,
  Dropdown,
  Table,
  type MenuProps,
  type TableColumnsType,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import FileOutlined from "@ant-design/icons/FileOutlined";
import FolderOpenOutlined from "@ant-design/icons/FolderOpenOutlined";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import { useFileSystemTree } from "../../hooks/useFileSystemTree";
import { useDeleteFolder } from "../../hooks/useDeleteFolder";
import { findNode, findPath } from "../../utils/fileSystemTree";
import { formatFileSize } from "../../utils/formatFileSize";
import { ROOT_FOLDER_ID } from "../../api/foldersApi";
import type { FileSystemNode } from "../../models/FileSystemNode";

interface FolderContentsPanelProps {
  folderId: string;
}

export default function FolderContentsPanel({ folderId }: FolderContentsPanelProps) {
  const navigate = useNavigate();
  const { message, modal } = AntdApp.useApp();

  const { data: tree = [], isLoading } = useFileSystemTree();
  const { mutate: deleteFolder } = useDeleteFolder();

  const { rows, ancestors } = useMemo(() => {
    const isRoot = folderId === ROOT_FOLDER_ID;
    const currentNode = isRoot ? null : findNode(tree, folderId);
    return {
      rows: isRoot ? tree : (currentNode?.children ?? []),
      ancestors: isRoot ? [] : findPath(tree, folderId),
    };
  }, [tree, folderId]);

  const goToFolder = useCallback(
    (id: string) => navigate({ to: "/files/$folderId", params: { folderId: id } }),
    [navigate],
  );

  const handleDeleteFolder = useCallback(
    (folder: FileSystemNode) => {
      modal.confirm({
        title: `¿Eliminar la carpeta "${folder.name}"?`,
        content: "Esta acción no se puede deshacer.",
        okText: "Eliminar",
        okButtonProps: { danger: true },
        cancelText: "Cancelar",
        onOk: () =>
          deleteFolder(folder.id, {
            onSuccess: () => message.success(`Carpeta "${folder.name}" eliminada`),
            onError: () => message.error("No se pudo eliminar la carpeta"),
          }),
      });
    },
    [deleteFolder, message, modal],
  );

  const getFolderMenuItems = useCallback(
    (folder: FileSystemNode): MenuProps["items"] => [
      {
        key: "open",
        label: "Abrir",
        icon: <FolderOpenOutlined />,
        onClick: () => goToFolder(folder.id),
      },
      { type: "divider" },
      {
        key: "delete",
        label: "Eliminar carpeta",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteFolder(folder),
      },
    ],
    [goToFolder, handleDeleteFolder],
  );

  const columns: TableColumnsType<FileSystemNode> = [
    {
      title: "Nombre",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, row) => {
        const label = (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              cursor: row.type === "FOLDER" ? "pointer" : "default",
            }}
            onClick={() => row.type === "FOLDER" && goToFolder(row.id)}
          >
            {row.type === "FOLDER" ? <FolderOutlined /> : <FileOutlined />}
            {name}
          </span>
        );

        if (row.type === "FOLDER") {
          return (
            <Dropdown trigger={["contextMenu"]} menu={{ items: getFolderMenuItems(row) }}>
              {label}
            </Dropdown>
          );
        }
        return label;
      },
    },
    {
      title: "Tipo",
      dataIndex: "type",
      width: 160,
      filters: [
        { text: "Carpetas", value: "FOLDER" },
        { text: "Archivos", value: "FILE" },
      ],
      onFilter: (value, row) => row.type === value,
      render: (_, row) => (row.type === "FOLDER" ? "Carpeta" : "Archivo"),
    },
    {
      title: "Tamaño",
      dataIndex: "size",
      width: 120,
      sorter: (a, b) => (a.size ?? -1) - (b.size ?? -1),
      render: (_, row) => (row.type === "FILE" && row.size != null ? formatFileSize(row.size) : "-"),
    },
    {
      title: "Modificado",
      dataIndex: "lastModified",
      width: 200,
      sorter: (a, b) => a.lastModified.localeCompare(b.lastModified),
      render: (_, row) => new Date(row.lastModified).toLocaleString(),
    },
  ];

  const breadcrumbItems = useMemo(
    () => [
      { title: <a onClick={() => navigate({ to: "/" })}>Inicio</a> },
      ...ancestors.map((node, index) => {
        const isCurrent = index === ancestors.length - 1;
        return {
          title: isCurrent ? node.name : <a onClick={() => goToFolder(node.id)}>{node.name}</a>,
        };
      }),
    ],
    [ancestors, navigate, goToFolder],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Breadcrumb items={breadcrumbItems} />

      <Table<FileSystemNode>
        rowKey="id"
        columns={columns}
        dataSource={rows}
        loading={isLoading}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
