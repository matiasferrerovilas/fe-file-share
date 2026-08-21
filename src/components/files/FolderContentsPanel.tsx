import { useMemo, useRef, useState, type MouseEvent } from "react";
import { App as AntdApp, Breadcrumb, Button, Col, Dropdown, Empty, Flex, Grid, Segmented, Space, Spin, Typography, theme, type MenuProps } from "antd";
import { useNavigate } from "@tanstack/react-router";
import FolderAddOutlined from "@ant-design/icons/FolderAddOutlined";
import DownloadOutlined from "@ant-design/icons/DownloadOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import AppstoreOutlined from "@ant-design/icons/AppstoreOutlined";
import UnorderedListOutlined from "@ant-design/icons/UnorderedListOutlined";
import SortAscendingOutlined from "@ant-design/icons/SortAscendingOutlined";
import SortDescendingOutlined from "@ant-design/icons/SortDescendingOutlined";
import { useTranslation } from "react-i18next";
import { useFileSystemTree } from "../../hooks/useFileSystemTree";
import { findNode, findPath } from "../../utils/fileSystemTree";
import { ROOT_FOLDER_ID } from "../../api/foldersApi";
import { useDeleteFolder } from "../../hooks/useDeleteFolder";
import { useDownloadFile } from "../../hooks/useDownloadFile";
import { useMoveNode } from "../../hooks/useMoveNode";
import { useUploadQueue } from "../../uploads/UploadQueueContext";
import { useTourRefs } from "../../tour/TourRefsContext";
import { describeBulkFailures } from "../../utils/describeBulkFailures";
import { FileSystemNodeType, type FileSystemNode } from "../../models/FileSystemNode";
import FolderContentCard from "./FolderContentCard";
import FolderContentRow from "./FolderContentRow";
import CreateFolderModal from "./CreateFolderModal";
import MoveToFolderModal from "./MoveToFolderModal";

const { Text } = Typography;

interface FolderContentsPanelProps {
  folderId: string;
  // Cuando se proveen, el panel renderiza esta lista fija en vez de derivar los hijos de
  // `folderId` en el árbol — usado por las vistas "Favoritos"/"Recientes", que no son una carpeta
  // real: no tienen breadcrumb, no aceptan subida ni "Crear carpeta" en esa posición.
  nodes?: FileSystemNode[];
  title?: string;
  isLoading?: boolean;
  emptyDescription?: string;
}

const { useBreakpoint } = Grid;

type ViewMode = "grid" | "list";
type SortField = "name" | "size" | "date";
type SortDirection = "asc" | "desc";

function compareNodes(a: FileSystemNode, b: FileSystemNode, field: SortField, direction: SortDirection): number {
  // Las carpetas siempre van antes que los archivos, sin importar el criterio u orden elegido.
  const aIsFolder = a.metadata.type === FileSystemNodeType.FOLDER;
  const bIsFolder = b.metadata.type === FileSystemNodeType.FOLDER;
  if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;

  const sign = direction === "asc" ? 1 : -1;
  if (field === "size") return sign * ((a.metadata.size ?? 0) - (b.metadata.size ?? 0));
  if (field === "date") {
    return sign * (new Date(a.metadata.lastModified).getTime() - new Date(b.metadata.lastModified).getTime());
  }
  return sign * a.name.localeCompare(b.name);
}

export default function FolderContentsPanel({
  folderId,
  nodes: explicitNodes,
  title,
  isLoading,
  emptyDescription,
}: FolderContentsPanelProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { modal, message, notification } = AntdApp.useApp();
  const { registerRef } = useTourRefs();
  const isSmartView = explicitNodes !== undefined;
  const contextMenuItems: MenuProps["items"] = [
    { key: "create-folder", label: t("files.createFolder"), icon: <FolderAddOutlined /> },
  ];
  const { data: tree = [] } = useFileSystemTree();
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [movingSelection, setMovingSelection] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
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
  const { moveNodeAsync, isMoving } = useMoveNode();
  const { runUploads } = useUploadQueue();
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => {
    if (explicitNodes) {
      return [...explicitNodes].sort((a, b) => compareNodes(a, b, sortField, sortDirection));
    }
    // El primer nodo es la carpeta raíz del backend — al verla se muestran
    // directamente sus hijos en vez de listarla como si fuera una carpeta más.
    const children =
      folderId === ROOT_FOLDER_ID ? (tree[0]?.children ?? []) : (findNode(tree, folderId)?.children ?? []);
    return [...children].sort((a, b) => compareNodes(a, b, sortField, sortDirection));
  }, [tree, folderId, explicitNodes, sortField, sortDirection]);

  const selectedNodes = useMemo(
    () => rows.filter((node) => selectedIds.has(node.id)),
    [rows, selectedIds],
  );

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
      notification.error({
        message: t("files.bulkDownloadFailed", { failed, total: selectedNodes.length }),
        description: describeBulkFailures(selectedNodes, results),
      });
    }
  };

  const handleBulkDelete = () => {
    modal.confirm({
      title: t("files.bulkDeleteConfirmTitle", { count: selectedNodes.length }),
      content: t("files.bulkDeleteConfirmContent"),
      okText: t("files.delete"),
      okButtonProps: { danger: true },
      cancelText: t("files.cancel"),
      onOk: async () => {
        const results = await Promise.allSettled(
          selectedNodes.map((node) => deleteMutation.mutateAsync(node.id)),
        );
        const failed = results.filter((r) => r.status === "rejected").length;
        if (failed > 0) {
          notification.error({
            message: t("files.bulkDeleteFailed", { failed, total: selectedNodes.length }),
            description: describeBulkFailures(selectedNodes, results),
          });
        } else {
          message.success(t("files.itemsDeletedSuccess"));
        }
        clearSelection();
      },
    });
  };

  const handleBulkMove = async (targetFolderId: string) => {
    const results = await Promise.allSettled(
      selectedNodes.map((node) => moveNodeAsync({ nodeId: node.id, targetFolderId })),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      notification.error({
        message: t("files.bulkMoveFailed", { failed, total: selectedNodes.length }),
        description: describeBulkFailures(selectedNodes, results),
      });
    } else {
      message.success(t("files.itemsMovedSuccess"));
    }
    setMovingSelection(false);
    clearSelection();
  };

  const handleFilesSelected = async (fileList: FileList | null) => {
    await runUploads(folderId, fileList, t);
  };

  // En mobile no hay drag&drop ni menú contextual accesible: tocar el fondo
  // del panel (fuera de una tarjeta) dispara directamente el selector de archivos.
  const handleEmptyAreaTap = (e: MouseEvent<HTMLDivElement>) => {
    if (!isMobile || isSmartView) return;
    if ((e.target as HTMLElement).closest(".ant-card")) return;
    uploadInputRef.current?.click();
  };

  const ancestors = useMemo(() => {
    if (isSmartView || folderId === ROOT_FOLDER_ID) return [];
    // Busca desde los hijos de la raíz: el nodo raíz ya se muestra como el
    // primer item del breadcrumb, no hace falta repetirlo en ancestors.
    return findPath(tree[0]?.children ?? [], folderId);
  }, [tree, folderId, isSmartView]);

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
      {isSmartView ? (
        <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
          {title}
        </Typography.Title>
      ) : (
        <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
      )}
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
          <Text strong>{t("files.selectedCount", { count: selectedNodes.length })}</Text>
          <Button icon={<DownloadOutlined />} onClick={handleBulkDownload}>
            {t("files.download")}
          </Button>
          <Button icon={<FolderOutlined />} onClick={() => setMovingSelection(true)}>
            {t("files.moveToTitle")}
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
            {t("files.delete")}
          </Button>
          <Button type="text" icon={<CloseOutlined />} onClick={clearSelection} />
        </Flex>
      )}
      <Flex align="center" justify="space-between" wrap gap={12} style={{ marginBottom: 16 }}>
        <Flex align="center" gap={8}>
          <Segmented
            value={sortField}
            onChange={(value) => setSortField(value as SortField)}
            options={[
              { label: t("files.sortName"), value: "name" },
              { label: t("files.sortSize"), value: "size" },
              { label: t("files.sortDate"), value: "date" },
            ]}
          />
          <Button
            type="text"
            aria-label={t(sortDirection === "asc" ? "files.sortAscending" : "files.sortDescending")}
            icon={sortDirection === "asc" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
            onClick={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))}
          />
        </Flex>
        <div ref={(el) => registerRef("viewToggle", el)}>
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
            options={[
              { label: t("files.gridView"), value: "grid", icon: <AppstoreOutlined /> },
              { label: t("files.listView"), value: "list", icon: <UnorderedListOutlined /> },
            ]}
          />
        </div>
      </Flex>
      {!isSmartView && (
        <input
          ref={uploadInputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            void handleFilesSelected(e.target.files);
            e.target.value = "";
          }}
        />
      )}
      <Dropdown
        menu={{ items: contextMenuItems, onClick: () => setCreatingFolder(true) }}
        trigger={isSmartView ? [] : ["contextMenu"]}
      >
        <div style={{ flex: 1, minHeight: "60vh" }} onClick={handleEmptyAreaTap}>
          {isLoading ? (
            <Flex align="center" justify="center" style={{ minHeight: "50vh" }}>
              <Spin />
            </Flex>
          ) : rows.length === 0 ? (
            <Flex vertical align="center" justify="center" style={{ minHeight: "50vh" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  isSmartView ? (
                    <Text>{emptyDescription}</Text>
                  ) : (
                    <Flex vertical gap={4} align="center">
                      <Text>{t("files.emptyFolderTitle")}</Text>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {t("files.emptyFolderHint")}
                      </Text>
                    </Flex>
                  )
                }
              />
            </Flex>
          ) : viewMode === "grid" ? (
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
          ) : (
            <Flex vertical gap={4}>
              {!isMobile && (
                <Flex
                  gap={12}
                  style={{ padding: "0 12px 4px", color: token.colorTextSecondary, fontSize: 12 }}
                >
                  <div style={{ width: 20 }} />
                  <div style={{ width: 24 }} />
                  <Text type="secondary" style={{ flex: 1, fontSize: 12 }}>
                    {t("files.columnName")}
                  </Text>
                  <Text type="secondary" style={{ width: 90, textAlign: "right", fontSize: 12 }}>
                    {t("files.columnSize")}
                  </Text>
                  <Text type="secondary" style={{ width: 100, textAlign: "right", fontSize: 12 }}>
                    {t("files.columnModified")}
                  </Text>
                </Flex>
              )}
              {rows.map((node) => (
                <FolderContentRow
                  key={node.id}
                  node={node}
                  selected={selectedIds.has(node.id)}
                  selectionActive={selectedIds.size > 0}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </Flex>
          )}
        </div>
      </Dropdown>
      {!isSmartView && (
        <CreateFolderModal
          folderId={folderId}
          open={creatingFolder}
          onClose={() => setCreatingFolder(false)}
        />
      )}
      <MoveToFolderModal
        open={movingSelection}
        onClose={() => setMovingSelection(false)}
        onConfirm={handleBulkMove}
        confirmLoading={isMoving}
      />
    </>
  );
}
