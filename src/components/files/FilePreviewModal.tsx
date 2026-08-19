import { Modal, Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import type { FileSystemNode } from "../../models/FileSystemNode";
import { useFilePreview } from "../../hooks/useFilePreview";
import { isImageContentType, isPdfContentType, isMarkdownFile, isPlainTextFile } from "../../utils/filePreview";

const { Text } = Typography;

interface FilePreviewModalProps {
  node: FileSystemNode | null;
  onClose: () => void;
}

export default function FilePreviewModal({ node, onClose }: FilePreviewModalProps) {
  const { t } = useTranslation();
  const contentType = node?.metadata.contentType ?? null;
  const isImage = isImageContentType(contentType);
  const isPdf = isPdfContentType(contentType);
  const isMarkdown = node !== null && isMarkdownFile(node.name, contentType);
  const isPlainText = node !== null && !isMarkdown && isPlainTextFile(node.name, contentType);
  const isText = isMarkdown || isPlainText;
  const { url, text, loading, error } = useFilePreview(node?.id ?? null, { asText: isText });

  return (
    <Modal
      open={node !== null}
      onCancel={onClose}
      footer={null}
      title={node?.name}
      width={isPdf || isText ? 860 : 720}
      centered
      destroyOnHidden
    >
      <div
        style={{
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading && <Spin />}

        {!loading && error && <Text type="secondary">{t("files.previewLoadFailed")}</Text>}

        {!loading && !error && url && isImage && (
          <img src={url} alt={node?.name} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }} />
        )}

        {!loading && !error && url && isPdf && (
          <iframe title={node?.name} src={url} style={{ width: "100%", height: "75vh", border: "none" }} />
        )}

        {!loading && !error && text !== null && isMarkdown && (
          <div style={{ width: "100%", maxHeight: "70vh", overflow: "auto", textAlign: "left" }}>
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}

        {!loading && !error && text !== null && isPlainText && (
          <pre
            style={{
              width: "100%",
              maxHeight: "70vh",
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "monospace",
              textAlign: "left",
              margin: 0,
            }}
          >
            {text}
          </pre>
        )}
      </div>
    </Modal>
  );
}
