import { useMemo, useRef } from "react";
import { Button, Flex, Tooltip, Tree, type TreeDataNode } from "antd";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import FileOutlined from "@ant-design/icons/FileOutlined";
import UploadOutlined from "@ant-design/icons/UploadOutlined";
import StarOutlined from "@ant-design/icons/StarOutlined";
import HistoryOutlined from "@ant-design/icons/HistoryOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useFileSystemTree } from "../../hooks/useFileSystemTree";
import { useMoveNode, MOVE_NODE_DATA_TYPE } from "../../hooks/useMoveNode";
import { useUploadQueue } from "../../uploads/UploadQueueContext";
import { useTourRefs } from "../../tour/TourRefsContext";
import type { FileSystemNode } from "../../models/FileSystemNode";
import WorkspaceUsageIndicator from "./WorkspaceUsageIndicator";

interface FolderTreeSidebarProps {
  activeFolderId: string;
  onNavigate?: () => void;
}

function toTreeData(nodes: FileSystemNode[]): TreeDataNode[] {
  return nodes.map((node) => ({
    key: node.id,
    title: (
      <Tooltip title={node.name} placement="right" mouseEnterDelay={0.4}>
        <span
          style={{
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {node.name}
        </span>
      </Tooltip>
    ),
    icon: node.metadata.type === "FOLDER" ? <FolderOutlined /> : <FileOutlined />,
    isLeaf: node.metadata.type === "FILE",
    selectable: node.metadata.type === "FOLDER",
    children: node.children?.length ? toTreeData(node.children) : undefined,
  }));
}

export default function FolderTreeSidebar({ activeFolderId, onNavigate }: FolderTreeSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { data: tree = [] } = useFileSystemTree();
  const { moveIfValid } = useMoveNode();
  const { runUploads } = useUploadQueue();
  const { registerRef } = useTourRefs();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // El primer nodo es la carpeta raíz ("Home") del backend — la sidebar la trata como
  // el propio "Inicio" en vez de mostrarla como un nodo más para expandir.
  const treeData: TreeDataNode[] = useMemo(() => toTreeData(tree[0]?.children ?? []), [tree]);

  const handleFilesSelected = async (fileList: FileList | null) => {
    await runUploads(activeFolderId, fileList, t);
  };

  const goTo = (to: "/favorites" | "/recent" | "/trash") => {
    navigate({ to });
    onNavigate?.();
  };

  return (
    <>
      <Button
        ref={(el) => registerRef("upload", el)}
        icon={<UploadOutlined />}
        block
        style={{ marginBottom: 12 }}
        onClick={() => fileInputRef.current?.click()}
      >
        {t("files.uploadFile")}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          void handleFilesSelected(e.target.files);
          e.target.value = "";
        }}
      />
      <Flex gap={8} style={{ marginBottom: 12 }}>
        <Button
          ref={(el) => registerRef("favorites", el)}
          icon={<StarOutlined />}
          block
          type={location.pathname === "/favorites" ? "primary" : "default"}
          onClick={() => goTo("/favorites")}
        >
          {t("files.favoritesTitle")}
        </Button>
        <Button
          icon={<HistoryOutlined />}
          block
          type={location.pathname === "/recent" ? "primary" : "default"}
          onClick={() => goTo("/recent")}
        >
          {t("files.recentTitle")}
        </Button>
      </Flex>
      <Button
        ref={(el) => registerRef("trash", el)}
        icon={<DeleteOutlined />}
        block
        style={{ marginBottom: 12 }}
        type={location.pathname === "/trash" ? "primary" : "default"}
        onClick={() => goTo("/trash")}
      >
        {t("files.trashTitle")}
      </Button>
      <Tree
        treeData={treeData}
        selectedKeys={[activeFolderId]}
        defaultExpandAll
        showIcon
        blockNode
        draggable
        // Solo se puede soltar "adentro" de una carpeta (dropPosition 0), no como
        // hermano antes/después de un nodo — acá no hay reordenamiento, solo mover.
        allowDrop={({ dropNode, dropPosition }) => dropPosition === 0 && !dropNode.isLeaf}
        onDragStart={({ event, node }) => {
          event.dataTransfer.setData(MOVE_NODE_DATA_TYPE, String(node.key));
          event.dataTransfer.effectAllowed = "move";
        }}
        onDrop={({ event, node }) => {
          if (node.isLeaf) return;
          const draggedId = event.dataTransfer.getData(MOVE_NODE_DATA_TYPE);
          moveIfValid(draggedId, String(node.key));
        }}
        onSelect={(keys) => {
          const folderId = keys[0];
          if (typeof folderId !== "string") return;
          navigate({ to: "/files/$folderId", params: { folderId } });
          onNavigate?.();
        }}
      />
      <div ref={(el) => registerRef("storage", el)}>
        <WorkspaceUsageIndicator />
      </div>
    </>
  );
}
