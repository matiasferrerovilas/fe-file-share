import { useEffect, useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const { results, isSearching } = useFileSearch(query);

  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  const handleSelect = (result: FileSearchResult) => {
    const folderId = result.type === FileSystemNodeType.FOLDER ? result.id : (result.parentId ?? ROOT_FOLDER_ID);

    navigate({ to: "/files/$folderId", params: { folderId } });
    setQuery("");
    setOpen(false);
    onNavigate?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const active = results[activeIndex];
      if (active) handleSelect(active);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
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
        <div id="file-search-listbox" role="listbox">
          {results.map((result, index) => {
            const breadcrumb = result.path.join(" / ");
            const active = index === activeIndex;

            return (
              <div
                key={result.id}
                id={`file-search-option-${index}`}
                role="option"
                aria-selected={active}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setActiveIndex(index)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: token.borderRadiusSM,
                  cursor: "pointer",
                  background: active ? token.colorFillTertiary : "transparent",
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
          })}
        </div>
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
        role="combobox"
        aria-expanded={open && query.trim() !== ""}
        aria-controls="file-search-listbox"
        aria-activedescendant={
          open && results.length > 0 ? `file-search-option-${activeIndex}` : undefined
        }
        onKeyDown={handleKeyDown}
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
