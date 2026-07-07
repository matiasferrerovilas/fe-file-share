import { App as AntdApp, Upload, type UploadProps } from "antd";
import InboxOutlined from "@ant-design/icons/InboxOutlined";
import { useUploadFileToFolder } from "../../hooks/useUploadFileToFolder";
import { Semaphore } from "../../utils/semaphore";

const { Dragger } = Upload;

// Como mucho 4 subidas en simultáneo — protege al Pi y al pool de conexiones del browser
// cuando se suben hasta ~50 archivos de una.
const uploadSemaphore = new Semaphore(4);

interface FolderUploaderProps {
  folderId: string;
}

export default function FolderUploader({ folderId }: FolderUploaderProps) {
  const { message } = AntdApp.useApp();
  const { mutateAsync: uploadFile } = useUploadFileToFolder();

  const uploadProps: UploadProps = {
    multiple: true,
    showUploadList: true,
    customRequest: async ({ file, onProgress, onSuccess, onError }) => {
      const release = await uploadSemaphore.acquire();
      try {
        const uploaded = await uploadFile({
          folderId,
          file: file as File,
          onProgress: (percent) => onProgress?.({ percent }),
        });
        onSuccess?.(uploaded);
      } catch (err) {
        onError?.(err as Error);
      } finally {
        release();
      }
    },
    onChange: ({ file }) => {
      if (file.status === "error") {
        message.error(`${file.name} falló al subir`);
      }
    },
  };

  return (
    <Dragger {...uploadProps}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Arrastrá archivos acá o hacé click para subir</p>
      <p className="ant-upload-hint">Hasta 50 archivos por vez</p>
    </Dragger>
  );
}
