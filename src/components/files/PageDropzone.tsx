import { useState, type DragEvent, type ReactNode } from "react";
import { App as AntdApp, theme } from "antd";
import InboxOutlined from "@ant-design/icons/InboxOutlined";
import { useUploadFileToFolder } from "../../hooks/useUploadFileToFolder";
import { Semaphore } from "../../utils/semaphore";

// Como mucho 4 subidas en simultáneo — protege al Pi y al pool de conexiones del browser
// cuando se sueltan muchos archivos de una.
const uploadSemaphore = new Semaphore(4);

interface PageDropzoneProps {
  folderId: string;
  children: ReactNode;
}

export default function PageDropzone({ folderId, children }: PageDropzoneProps) {
  const { token } = theme.useToken();
  const { message } = AntdApp.useApp();
  const { mutateAsync: uploadFile } = useUploadFileToFolder();
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

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const results = await Promise.allSettled(
      files.map(async (file) => {
        const release = await uploadSemaphore.acquire();
        try {
          await uploadFile({ folderId, file, onProgress: () => {} });
        } finally {
          release();
        }
      }),
    );

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      message.error(`${failed} de ${files.length} archivo(s) fallaron al subir`);
    } else {
      message.success(
        files.length === 1 ? "Archivo subido correctamente" : `${files.length} archivos subidos correctamente`,
      );
    }
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
            Soltá los archivos acá para subirlos
          </span>
        </div>
      )}
    </div>
  );
}
