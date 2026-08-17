const PDF_CONTENT_TYPE = "application/pdf";

export const isImageContentType = (contentType: string | null): boolean =>
  contentType?.startsWith("image/") ?? false;

export const isPdfContentType = (contentType: string | null): boolean => contentType === PDF_CONTENT_TYPE;

export const isPreviewableContentType = (contentType: string | null): boolean =>
  isImageContentType(contentType) || isPdfContentType(contentType);
