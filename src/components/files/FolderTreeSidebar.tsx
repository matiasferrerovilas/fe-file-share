import { useMemo } from "react";
import { Tree, type TreeDataNode } from "antd";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import FileOutlined from "@ant-design/icons/FileOutlined";
import { useNavigate } from "@tanstack/react-router";
import { useFileSystemTree } from "../../hooks/useFileSystemTree";
import type { FileSystemNode } from "../../models/FileSystemNode";

interface FolderTreeSidebarProps {
  activeFolderId: string;
}

function toTreeData(nodes: FileSystemNode[]): TreeDataNode[] {
  return nodes.map((node) => ({
    key: node.id,
    title: node.name,
    icon: node.type === "FOLDER" ? <FolderOutlined /> : <FileOutlined />,
    isLeaf: node.type === "FILE",
    selectable: node.type === "FOLDER",
    children: node.children?.length ? toTreeData(node.children) : undefined,
  }));
}

export default function FolderTreeSidebar({ activeFolderId }: FolderTreeSidebarProps) {
  const navigate = useNavigate();
  const { data: tree = [] } = useFileSystemTree();

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
      onSelect={(keys) => {
        const folderId = keys[0];
        if (typeof folderId !== "string") return;
        navigate({ to: "/files/$folderId", params: { folderId } });
      }}
    />
  );
}
