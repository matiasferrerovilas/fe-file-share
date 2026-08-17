import type { ReactElement } from "react";
import FileOutlined from "@ant-design/icons/FileOutlined";
import FilePdfOutlined from "@ant-design/icons/FilePdfOutlined";
import FileImageOutlined from "@ant-design/icons/FileImageOutlined";
import FileZipOutlined from "@ant-design/icons/FileZipOutlined";
import FileWordOutlined from "@ant-design/icons/FileWordOutlined";
import FileExcelOutlined from "@ant-design/icons/FileExcelOutlined";
import FilePptOutlined from "@ant-design/icons/FilePptOutlined";

const WORD_TYPES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const EXCEL_TYPES = new Set([
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
const PPT_TYPES = new Set([
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);
const ZIP_TYPES = new Set([
  "application/zip",
  "application/x-zip-compressed",
  "application/x-7z-compressed",
  "application/x-rar-compressed",
]);

/**
 * Ícono representativo del tipo de archivo — antes todo mostraba el mismo FileOutlined genérico.
 * Devuelve el elemento ya armado (no el componente) para poder usarse directo en JSX sin que el
 * lint de react-hooks lo confunda con "un componente definido durante el render".
 */
export function getFileTypeIcon(contentType: string | null): ReactElement {
  if (contentType?.startsWith("image/")) return <FileImageOutlined />;
  if (contentType === "application/pdf") return <FilePdfOutlined />;
  if (contentType && WORD_TYPES.has(contentType)) return <FileWordOutlined />;
  if (contentType && EXCEL_TYPES.has(contentType)) return <FileExcelOutlined />;
  if (contentType && PPT_TYPES.has(contentType)) return <FilePptOutlined />;
  if (contentType && ZIP_TYPES.has(contentType)) return <FileZipOutlined />;
  return <FileOutlined />;
}
