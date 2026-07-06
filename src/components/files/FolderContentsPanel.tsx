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
import ShareAltOutlined from "@ant-design/icons/ShareAltOutlined";
import { useFolderContents } from "../../hooks/useFolderContents";
import { useDeleteFolder } from "../../hooks/useDeleteFolder";
import { useShareFolderWithMedicalApp } from "../../hooks/useShareFolderWithMedicalApp";
import { formatFileSize } from "../../utils/formatFileSize";
import type { FileItem } from "../../models/FileItem";
import type { FolderSummary } from "../../models/Folder";

interface FolderContentsPanelProps {
  folderId: string;
}

type Row =
  | ({ rowType: "folder" } & FolderSummary)
  | ({ rowType: "file" } & FileItem);

export default function FolderContentsPanel({ folderId }: FolderContentsPanelProps) {
  const navigate = useNavigate();
  const { message, modal } = AntdApp.useApp();

  const { data, isLoading } = useFolderContents(folderId);
  const { mutate: deleteFolder } = useDeleteFolder(folderId);
  const { mutate: shareWithMedicalApp } = useShareFolderWithMedicalApp();

  const goToFolder = useCallback(
    (id: string) => navigate({ to: "/files/$folderId", params: { folderId: id } }),
    [navigate],
  );

  const rows: Row[] = useMemo(() => {
    if (!data) return [];
    return [
      ...data.folders.map((folder) => ({ rowType: "folder" as const, ...folder })),
      ...data.files.map((file) => ({ rowType: "file" as const, ...file })),
    ];
  }, [data]);

  const handleDeleteFolder = useCallback(
    (folder: FolderSummary) => {
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

  const handleShareWithMedicalApp = useCallback(
    (folder: FolderSummary) => {
      shareWithMedicalApp(folder.id, {
        onSuccess: () => message.success(`"${folder.name}" compartida con App Médica`),
        onError: () => message.error("No se pudo compartir la carpeta"),
      });
    },
    [shareWithMedicalApp, message],
  );

  const getFolderMenuItems = useCallback(
    (folder: FolderSummary): MenuProps["items"] => [
      {
        key: "open",
        label: "Abrir",
        icon: <FolderOpenOutlined />,
        onClick: () => goToFolder(folder.id),
      },
      {
        key: "share",
        label: "Compartir con App Médica",
        icon: <ShareAltOutlined />,
        onClick: () => handleShareWithMedicalApp(folder),
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
    [goToFolder, handleShareWithMedicalApp, handleDeleteFolder],
  );

  const columns: TableColumnsType<Row> = [
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
              cursor: row.rowType === "folder" ? "pointer" : "default",
            }}
            onClick={() => row.rowType === "folder" && goToFolder(row.id)}
          >
            {row.rowType === "folder" ? <FolderOutlined /> : <FileOutlined />}
            {name}
          </span>
        );

        if (row.rowType === "folder") {
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
      dataIndex: "rowType",
      width: 160,
      filters: [
        { text: "Carpetas", value: "folder" },
        { text: "Archivos", value: "file" },
      ],
      onFilter: (value, row) => row.rowType === value,
      render: (_, row) => (row.rowType === "folder" ? "Carpeta" : row.contentType),
    },
    {
      title: "Tamaño",
      dataIndex: "size",
      width: 120,
      sorter: (a, b) => (a.rowType === "file" ? a.size : -1) - (b.rowType === "file" ? b.size : -1),
      render: (_, row) => (row.rowType === "file" ? formatFileSize(row.size) : "-"),
    },
    {
      title: "Modificado",
      dataIndex: "createdAt",
      width: 200,
      sorter: (a, b) =>
        (a.rowType === "file" ? a.createdAt : "").localeCompare(
          b.rowType === "file" ? b.createdAt : "",
        ),
      render: (_, row) => (row.rowType === "file" ? new Date(row.createdAt).toLocaleString() : "-"),
    },
  ];

  const breadcrumbItems = useMemo(() => {
    const ancestors = data?.breadcrumb ?? [];
    return [
      { title: <a onClick={() => navigate({ to: "/" })}>Inicio</a> },
      ...ancestors.map((crumb, index) => {
        const isCurrent = index === ancestors.length - 1;
        return {
          title: isCurrent ? crumb.name : <a onClick={() => goToFolder(crumb.id)}>{crumb.name}</a>,
        };
      }),
    ];
  }, [data?.breadcrumb, navigate, goToFolder]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Breadcrumb items={breadcrumbItems} />

      <Table<Row>
        rowKey={(row) => `${row.rowType}-${row.id}`}
        columns={columns}
        dataSource={rows}
        loading={isLoading}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
