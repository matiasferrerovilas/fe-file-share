import { useState, type DragEvent, type ReactNode } from "react";
import { theme } from "antd";
import InboxOutlined from "@ant-design/icons/InboxOutlined";
import { useTranslation } from "react-i18next";
import { useUploadQueue } from "../../uploads/UploadQueueContext";

interface PageDropzoneProps {
  folderId: string;
  children: ReactNode;
}

export default function PageDropzone({ folderId, children }: PageDropzoneProps) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { runUploads } = useUploadQueue();
  const [dragDepth, setDragDepth] = useState(0);

  const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer.types).includes("Files");

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    if (!hasFiles(e)) return;
    setDragDepth((depth) => depth + 1);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragDepth((depth) => Math.max(0, depth - 1));
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setDragDepth(0);

    const dropped = e.dataTransfer.files;
    await runUploads(folderId, dropped, t);
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ position: "relative", flex: 1, minHeight: 0, display: "flex" }}
    >
      {children}
      {dragDepth > 0 && (
        <div
          className="fade-in"
          style={{
            position: "absolute",
            inset: 8,
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            background: token.colorBgMask,
            border: `2px dashed ${token.colorPrimary}`,
            borderRadius: token.borderRadiusLG,
            pointerEvents: "none",
          }}
        >
          <InboxOutlined style={{ fontSize: 42, color: token.colorPrimary }} />
          <span style={{ fontSize: 16, fontWeight: 600, color: token.colorPrimary }}>
            {t("files.dropHint")}
          </span>
        </div>
      )}
    </div>
  );
}
