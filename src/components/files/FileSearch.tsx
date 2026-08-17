import { useMemo, useState } from "react";
import { Empty, Flex, Input, Popover, theme, Typography } from "antd";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import FileOutlined from "@ant-design/icons/FileOutlined";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ROOT_FOLDER_ID } from "../../api/foldersApi";
import { useFileSystemTree } from "../../hooks/useFileSystemTree";
import { FileSystemNodeType } from "../../models/FileSystemNode";
import { searchFileSystemTree } from "../../utils/searchFileSystemTree";

const { Text } = Typography;

const MAX_RESULTS = 20;

interface FileSearchProps {
  style?: React.CSSProperties;
  onNavigate?: () => void;
}

export default function FileSearch({ style, onNavigate }: FileSearchProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { data: tree = [] } = useFileSystemTree();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(
    () => searchFileSystemTree(tree[0]?.children ?? [], query).slice(0, MAX_RESULTS),
    [tree, query],
  );

  const handleSelect = (nodeId: string) => {
    const match = results.find(({ node }) => node.id === nodeId);
    if (!match) return;

    const { node, path } = match;
    const folderId =
      node.metadata.type === FileSystemNodeType.FOLDER
        ? node.id
        : (path[path.length - 2]?.id ?? ROOT_FOLDER_ID);

    navigate({ to: "/files/$folderId", params: { folderId } });
    setQuery("");
    setOpen(false);
    onNavigate?.();
  };

  const content = (
    <div style={{ width: "min(320px, 90vw)" }}>
      {results.length === 0 ? (
        <Empty description={t("nav.noResults")} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        results.map(({ node, path }) => {
          const breadcrumb = path
            .slice(0, -1)
            .map((ancestor) => ancestor.name)
            .join(" / ");

          return (
            <div
              key={node.id}
              onClick={() => handleSelect(node.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                borderRadius: token.borderRadiusSM,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = token.colorFillTertiary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {node.metadata.type === FileSystemNodeType.FOLDER ? <FolderOutlined /> : <FileOutlined />}
              <Flex vertical style={{ minWidth: 0, flex: 1 }}>
                <Text ellipsis>{node.name}</Text>
                {breadcrumb && (
                  <Text type="secondary" ellipsis style={{ fontSize: 11 }}>
                    {breadcrumb}
                  </Text>
                )}
              </Flex>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open && query.trim() !== ""}
      onOpenChange={setOpen}
      placement="bottomLeft"
      styles={{ content: { padding: 8 } }}
    >
      <Input
        allowClear
        value={query}
        placeholder={t("nav.search")}
        prefix={<SearchOutlined />}
        style={style}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (query.trim()) setOpen(true);
        }}
      />
    </Popover>
  );
}
