import { Button, Form, Input, Modal } from "antd";
import FolderAddOutlined from "@ant-design/icons/FolderAddOutlined";
import { useTranslation } from "react-i18next";
import { useCreateFolder } from "../../hooks/useCreateFolder";

interface CreateFolderModalProps {
  folderId: string;
  open: boolean;
  onClose: () => void;
}

export default function CreateFolderModal({ folderId, open, onClose }: CreateFolderModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<{ name: string }>();
  const createFolderMutation = useCreateFolder();

  const handleClose = () => {
    onClose();
    form.resetFields();
  };

  const handleSubmit = (values: { name: string }) => {
    createFolderMutation.mutate(
      { folderId, name: values.name.trim() },
      { onSuccess: handleClose },
    );
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={t("files.createFolder")}
      width={400}
      destroyOnHidden
      footer={
        <Button
          type="primary"
          icon={<FolderAddOutlined />}
          loading={createFolderMutation.isPending}
          onClick={() => form.submit()}
        >
          {t("files.createFolder")}
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={createFolderMutation.isPending}
      >
        <Form.Item
          label={t("files.renameNameLabel")}
          name="name"
          rules={[{ required: true, message: t("files.createFolderNamePlaceholder") }]}
        >
          <Input placeholder={t("files.createFolderExample")} autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
}
