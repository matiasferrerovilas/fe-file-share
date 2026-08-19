import { useState } from "react";
import { Empty, Flex, Input, Popover, Spin, theme, Typography } from "antd";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import FileOutlined from "@ant-design/icons/FileOutlined";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ROOT_FOLDER_ID } from "../../api/foldersApi";
import { useFileSearch } from "../../hooks/useFileSearch";
import { FileSystemNodeType } from "../../models/FileSystemNode";
import type { FileSearchResult } from "../../models/FileSearchResult";

const { Text } = Typography;

interface FileSearchProps {
  style?: React.CSSProperties;
  onNavigate?: () => void;
}

export default function FileSearch({ style, onNavigate }: FileSearchProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { results, isSearching } = useFileSearch(query);

  const handleSelect = (result: FileSearchResult) => {
    const folderId = result.type === FileSystemNodeType.FOLDER ? result.id : (result.parentId ?? ROOT_FOLDER_ID);

    navigate({ to: "/files/$folderId", params: { folderId } });
    setQuery("");
    setOpen(false);
    onNavigate?.();
  };

  const content = (
    <div style={{ width: "min(320px, 90vw)" }}>
      {isSearching ? (
        <Flex justify="center" style={{ padding: 16 }}>
          <Spin size="small" />
        </Flex>
      ) : results.length === 0 ? (
        <Empty description={t("nav.noResults")} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        results.map((result) => {
          const breadcrumb = result.path.join(" / ");

          return (
            <div
              key={result.id}
              onClick={() => handleSelect(result)}
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
              {result.type === FileSystemNodeType.FOLDER ? <FolderOutlined /> : <FileOutlined />}
              <Flex vertical style={{ minWidth: 0, flex: 1 }}>
                <Text ellipsis>{result.name}</Text>
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
