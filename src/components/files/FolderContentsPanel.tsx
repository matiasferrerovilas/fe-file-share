import { useMemo, useState } from "react";
import { App as AntdApp, Breadcrumb, Button, Col, Dropdown, Flex, Grid, Space, Typography, theme, type MenuProps } from "antd";
import { useNavigate } from "@tanstack/react-router";
import FolderAddOutlined from "@ant-design/icons/FolderAddOutlined";
import DownloadOutlined from "@ant-design/icons/DownloadOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import { useFileSystemTree } from "../../hooks/useFileSystemTree";
import { findNode, findPath } from "../../utils/fileSystemTree";
import { ROOT_FOLDER_ID } from "../../api/foldersApi";
import { FileSystemNodeType } from "../../models/FileSystemNode";
import { useDeleteFolder } from "../../hooks/useDeleteFolder";
import { useDownloadFile } from "../../hooks/useDownloadFile";
import FolderContentCard from "./FolderContentCard";
import CreateFolderModal from "./CreateFolderModal";

const { Text } = Typography;

interface FolderContentsPanelProps {
  folderId: string;
}

const contextMenuItems: MenuProps["items"] = [
  { key: "create-folder", label: "Crear carpeta", icon: <FolderAddOutlined /> },
];

const { useBreakpoint } = Grid;

export default function FolderContentsPanel({ folderId }: FolderContentsPanelProps) {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { modal, message } = AntdApp.useApp();
  const { data: tree = [] } = useFileSystemTree();
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Al cambiar de carpeta la selección anterior ya no aplica a lo que se ve en pantalla.
  const [selectionFolderId, setSelectionFolderId] = useState(folderId);
  if (folderId !== selectionFolderId) {
    setSelectionFolderId(folderId);
    setSelectedIds(new Set());
  }
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const deleteMutation = useDeleteFolder();
  const downloadMutation = useDownloadFile();

  const rows = useMemo(() => {
    // El primer nodo es la carpeta raíz del backend — al verla se muestran
    // directamente sus hijos en vez de listarla como si fuera una carpeta más.
    if (folderId === ROOT_FOLDER_ID) return tree[0]?.children ?? [];
    return findNode(tree, folderId)?.children ?? [];
  }, [tree, folderId]);

  const selectedNodes = useMemo(
    () => rows.filter((node) => selectedIds.has(node.id)),
    [rows, selectedIds],
  );
  const allSelectedAreFiles =
    selectedNodes.length > 0 && selectedNodes.every((node) => node.type === FileSystemNodeType.FILE);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDownload = async () => {
    const results = await Promise.allSettled(
      selectedNodes.map((node) => downloadMutation.mutateAsync(node.id)),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      message.error(`${failed} de ${selectedNodes.length} archivo(s) no se pudieron descargar`);
    }
  };

  const handleBulkDelete = () => {
    modal.confirm({
      title: `Eliminar ${selectedNodes.length} elemento(s)`,
      content: "Se eliminarán las carpetas seleccionadas y todo su contenido. Esta acción no se puede deshacer.",
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        const results = await Promise.allSettled(
          selectedNodes.map((node) => deleteMutation.mutateAsync(node.id)),
        );
        const failed = results.filter((r) => r.status === "rejected").length;
        if (failed > 0) {
          message.error(`${failed} de ${selectedNodes.length} elemento(s) no se pudieron eliminar`);
        } else {
          message.success("Elementos eliminados correctamente");
        }
        clearSelection();
      },
    });
  };

  const ancestors = useMemo(() => {
    if (folderId === ROOT_FOLDER_ID) return [];
    // Busca desde los hijos de la raíz: el nodo raíz ya se muestra como el
    // primer item del breadcrumb, no hace falta repetirlo en ancestors.
    return findPath(tree[0]?.children ?? [], folderId);
  }, [tree, folderId]);

  const goToFolder = (id: string) => navigate({ to: "/files/$folderId", params: { folderId: id } });

  const breadcrumbItems = [
    { title: <a onClick={() => goToFolder(ROOT_FOLDER_ID)}>{tree[0]?.name}</a> },
    ...ancestors.map((node, index) => ({
      title:
        index === ancestors.length - 1 ? (
          node.name
        ) : (
          <a onClick={() => goToFolder(node.id)}>{node.name}</a>
        ),
    })),
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
      {selectedNodes.length > 0 && (
        <Flex
          align="center"
          gap={12}
          wrap
          style={{
            marginBottom: 16,
            padding: "8px 12px",
            background: token.colorFillTertiary,
            borderRadius: token.borderRadius,
          }}
        >
          <Text strong>{selectedNodes.length} seleccionado(s)</Text>
          <Button
            icon={<DownloadOutlined />}
            disabled={!allSelectedAreFiles}
            onClick={handleBulkDownload}
          >
            Descargar
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
            Eliminar
          </Button>
          <Button type="text" icon={<CloseOutlined />} onClick={clearSelection} />
        </Flex>
      )}
      <Dropdown
        menu={{ items: contextMenuItems, onClick: () => setCreatingFolder(true) }}
        trigger={["contextMenu"]}
      >
        <div style={{ flex: 1, minHeight: "60vh" }}>
          <Space wrap style={isMobile ? { width: "100%", justifyContent: "center" } : undefined}>
            {rows.map((node, index) => (
              <Col
                xs={24}
                sm={12}
                lg={8}
                key={node.id}
                style={{ marginBottom: 16, animationDelay: `${(index + 2) * 80}ms` }}
                className="fade-in-up"
              >
                <FolderContentCard
                  key={node.id}
                  node={node}
                  selected={selectedIds.has(node.id)}
                  selectionActive={selectedIds.size > 0}
                  onToggleSelect={toggleSelect}
                />
              </Col>
            ))}
          </Space>
        </div>
      </Dropdown>
      <CreateFolderModal
        folderId={folderId}
        open={creatingFolder}
        onClose={() => setCreatingFolder(false)}
      />
    </>
  );
}
