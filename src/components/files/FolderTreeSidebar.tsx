import { useMemo } from "react";
import { Tree, type TreeDataNode } from "antd";
import HomeOutlined from "@ant-design/icons/HomeOutlined";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import { useNavigate } from "@tanstack/react-router";
import { useFolderTree } from "../../hooks/useFolderTree";
import { ROOT_FOLDER_ID } from "../../api/foldersApi";
import type { FolderTreeNode } from "../../models/FolderTree";

interface FolderTreeSidebarProps {
  activeFolderId: string;
}

function toTreeData(nodes: FolderTreeNode[]): TreeDataNode[] {
  return nodes.map((node) => ({
    key: node.id,
    title: node.name,
    icon: <FolderOutlined />,
    children: node.children.length ? toTreeData(node.children) : undefined,
  }));
}

export default function FolderTreeSidebar({ activeFolderId }: FolderTreeSidebarProps) {
  const navigate = useNavigate();
  const { data: tree = [] } = useFolderTree();

  const treeData: TreeDataNode[] = useMemo(
    () => [
      { key: ROOT_FOLDER_ID, title: "Inicio", icon: <HomeOutlined /> },
      ...toTreeData(tree),
    ],
    [tree],
  );

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
        if (folderId === ROOT_FOLDER_ID) {
          navigate({ to: "/" });
        } else {
          navigate({ to: "/files/$folderId", params: { folderId } });
        }
      }}
    />
  );
}
