import { useState } from "react";
import { Breadcrumb, Empty, Flex, Spin, Typography } from "antd";
import { Link } from "@tanstack/react-router";
import LeftOutlined from "@ant-design/icons/LeftOutlined";
import { useTranslation } from "react-i18next";
import { useFolderSubtree } from "../../hooks/useFolderSubtree";
import type { FileSystemNode } from "../../models/FileSystemNode";
import SharedNodeRow from "./SharedNodeRow";

const { Title } = Typography;

interface SharedFolderBrowserProps {
  nodeId: string;
}

/**
 * Browses a folder someone else shared with the current user, including subfolders — the whole
 * subtree is fetched once (see useFolderSubtree) and navigation between levels happens locally
 * (pushing/popping a breadcrumb stack), no extra round trips. Deliberately not a reuse of
 * FileExplorer/FolderContentsPanel, which are hard-wired to the caller's own workspace tree via
 * useFileSystemTree and can't serve someone else's subtree.
 */
export default function SharedFolderBrowser({ nodeId }: SharedFolderBrowserProps) {
  const { t } = useTranslation();
  const { data: root, isLoading } = useFolderSubtree(nodeId);
  const [pathStack, setPathStack] = useState<FileSystemNode[]>([]);

  const currentNode = pathStack.length > 0 ? pathStack[pathStack.length - 1] : root;
  const children = currentNode?.children ?? [];

  const handleOpenFolder = (node: FileSystemNode) => setPathStack((prev) => [...prev, node]);
  const handleBreadcrumbClick = (index: number) =>
    setPathStack((prev) => (index < 0 ? [] : prev.slice(0, index + 1)));

  if (isLoading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "50vh" }}>
        <Spin />
      </Flex>
    );
  }

  if (!root) {
    return null;
  }

  const breadcrumbItems = [
    { title: <a onClick={() => handleBreadcrumbClick(-1)}>{root.name}</a> },
    ...pathStack.map((node, index) => ({
      title:
        index === pathStack.length - 1 ? (
          node.name
        ) : (
          <a onClick={() => handleBreadcrumbClick(index)}>{node.name}</a>
        ),
    })),
  ];

  return (
    <div style={{ padding: 24 }}>
      <Link to="/shared-with-me" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
        <LeftOutlined style={{ fontSize: 12 }} />
        {t("files.sharedWithMe.backLink")}
      </Link>
      <Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>
        {t("files.sharedWithMe.browserTitle")}
      </Title>
      <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
      {children.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("files.sharedWithMe.emptyFolder")} />
      ) : (
        <Flex vertical gap={4}>
          {children.map((child) => (
            <SharedNodeRow key={child.id} node={child} onOpenFolder={handleOpenFolder} />
          ))}
        </Flex>
      )}
    </div>
  );
}
