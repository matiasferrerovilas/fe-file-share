import { useMemo } from "react";
import { Tooltip, Tree, type TreeDataNode } from "antd";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import FileOutlined from "@ant-design/icons/FileOutlined";
import { useNavigate } from "@tanstack/react-router";
import { useFileSystemTree } from "../../hooks/useFileSystemTree";
import { useMoveNode, MOVE_NODE_DATA_TYPE } from "../../hooks/useMoveNode";
import type { FileSystemNode } from "../../models/FileSystemNode";

interface FolderTreeSidebarProps {
  activeFolderId: string;
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
    icon: node.type === "FOLDER" ? <FolderOutlined /> : <FileOutlined />,
    isLeaf: node.type === "FILE",
    selectable: node.type === "FOLDER",
    children: node.children?.length ? toTreeData(node.children) : undefined,
  }));
}

export default function FolderTreeSidebar({ activeFolderId }: FolderTreeSidebarProps) {
  const navigate = useNavigate();
  const { data: tree = [] } = useFileSystemTree();
  const { moveIfValid } = useMoveNode();

  // El primer nodo es la carpeta raíz ("Home") del backend — la sidebar la trata como
  // el propio "Inicio" en vez de mostrarla como un nodo más para expandir.
  const treeData: TreeDataNode[] = useMemo(() => toTreeData(tree[0]?.children ?? []), [tree]);

  return (
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
      }}
    />
  );
}
