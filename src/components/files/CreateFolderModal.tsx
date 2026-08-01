import { Button, Form, Input, Modal } from "antd";
import FolderAddOutlined from "@ant-design/icons/FolderAddOutlined";
import { useCreateFolder } from "../../hooks/useCreateFolder";

interface CreateFolderModalProps {
  folderId: string;
  open: boolean;
  onClose: () => void;
}

export default function CreateFolderModal({ folderId, open, onClose }: CreateFolderModalProps) {
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
      title="Nueva carpeta"
      width={400}
      destroyOnHidden
      footer={
        <Button
          type="primary"
          icon={<FolderAddOutlined />}
          loading={createFolderMutation.isPending}
          onClick={() => form.submit()}
        >
          Crear carpeta
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
          label="Nombre"
          name="name"
          rules={[{ required: true, message: "Ingresá el nombre de la carpeta" }]}
        >
          <Input placeholder="Ej: Fotos" autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
}
