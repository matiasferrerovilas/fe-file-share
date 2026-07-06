import { App as AntdApp, Upload, type UploadProps } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import InboxOutlined from "@ant-design/icons/InboxOutlined";
import { uploadFileToFolder } from "../../api/foldersApi";
import { FILE_SYSTEM_TREE_QUERY_KEY } from "../../hooks/useFileSystemTree";
import { Semaphore } from "../../utils/semaphore";

const { Dragger } = Upload;

// Como mucho 4 subidas en simultáneo — protege al Pi y al pool de conexiones del browser
// cuando se suben hasta ~50 archivos de una.
const uploadSemaphore = new Semaphore(4);

interface FolderUploaderProps {
  folderId: string;
}

export default function FolderUploader({ folderId }: FolderUploaderProps) {
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();

  const uploadProps: UploadProps = {
    multiple: true,
    showUploadList: true,
    customRequest: async ({ file, onProgress, onSuccess, onError }) => {
      const release = await uploadSemaphore.acquire();
      try {
        const uploaded = await uploadFileToFolder(
          folderId,
          file as File,
          (percent) => onProgress?.({ percent }),
        );
        queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_TREE_QUERY_KEY });
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
