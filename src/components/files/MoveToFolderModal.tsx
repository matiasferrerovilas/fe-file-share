import { useMemo, useState } from "react";
import { Button, Modal, Tree, type TreeDataNode } from "antd";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import { useTranslation } from "react-i18next";
import { useFileSystemTree } from "../../hooks/useFileSystemTree";
import { ROOT_FOLDER_ID } from "../../api/foldersApi";
import { FileSystemNodeType, type FileSystemNode } from "../../models/FileSystemNode";

interface MoveToFolderModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (targetFolderId: string) => void;
  confirmLoading?: boolean;
}

function toFolderTreeData(nodes: FileSystemNode[]): TreeDataNode[] {
  return nodes
    .filter((node) => node.metadata.type === FileSystemNodeType.FOLDER)
    .map((node) => ({
      key: node.id,
      title: node.name,
      icon: <FolderOutlined />,
      children: node.children?.length ? toFolderTreeData(node.children) : undefined,
    }));
}

/**
 * Folder picker reused by the bulk "Mover a..." action. There isn't a dedicated single-item
 * folder-picker component to reuse — single-item move is drag&drop only (see FolderTreeSidebar /
 * useFolderContentActions) — so this is a new, minimal one built on the same Tree-of-folders
 * pattern FolderTreeSidebar already uses for its sidebar tree.
 */
export default function MoveToFolderModal({ open, onClose, onConfirm, confirmLoading }: MoveToFolderModalProps) {
  const { t } = useTranslation();
  const { data: tree = [] } = useFileSystemTree();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const treeData: TreeDataNode[] = useMemo(
    () => [
      {
        key: ROOT_FOLDER_ID,
        title: tree[0]?.name ?? t("files.folders"),
        icon: <FolderOutlined />,
        children: toFolderTreeData(tree[0]?.children ?? []),
      },
    ],
    [tree, t],
  );

  const handleClose = () => {
    setSelectedFolderId(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={t("files.moveToTitle")}
      width={420}
      destroyOnHidden
      footer={
        <Button
          type="primary"
          icon={<FolderOutlined />}
          disabled={!selectedFolderId}
          loading={confirmLoading}
          onClick={() => selectedFolderId && onConfirm(selectedFolderId)}
        >
          {t("files.moveHere")}
        </Button>
      }
    >
      <Tree
        treeData={treeData}
        showIcon
        blockNode
        defaultExpandAll
        selectedKeys={selectedFolderId ? [selectedFolderId] : []}
        onSelect={(keys) => setSelectedFolderId(typeof keys[0] === "string" ? keys[0] : null)}
      />
    </Modal>
  );
}
