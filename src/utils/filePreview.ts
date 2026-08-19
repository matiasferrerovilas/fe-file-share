const PDF_CONTENT_TYPE = "application/pdf";
const TEXT_PLAIN_CONTENT_TYPE = "text/plain";
const MARKDOWN_CONTENT_TYPES = ["text/markdown", "text/x-markdown"];
const MARKDOWN_EXTENSIONS = [".md", ".markdown"];
const TEXT_EXTENSIONS = [".txt"];

export const isImageContentType = (contentType: string | null): boolean =>
  contentType?.startsWith("image/") ?? false;

export const isPdfContentType = (contentType: string | null): boolean => contentType === PDF_CONTENT_TYPE;

// Content-type detection for Markdown is unreliable across browsers/OSes (many never register a
// MIME type for .md at all), so it's also recognized by file extension.
export const isMarkdownFile = (name: string, contentType: string | null): boolean =>
  (contentType !== null && MARKDOWN_CONTENT_TYPES.includes(contentType)) ||
  MARKDOWN_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext));

export const isPlainTextFile = (name: string, contentType: string | null): boolean =>
  !isMarkdownFile(name, contentType) &&
  (contentType === TEXT_PLAIN_CONTENT_TYPE || TEXT_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext)));

export const isPreviewableContentType = (name: string, contentType: string | null): boolean =>
  isImageContentType(contentType) ||
  isPdfContentType(contentType) ||
  isMarkdownFile(name, contentType) ||
  isPlainTextFile(name, contentType);
