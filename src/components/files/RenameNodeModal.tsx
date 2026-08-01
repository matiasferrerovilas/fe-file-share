import { useEffect } from "react";
import { Button, Form, Input, Modal } from "antd";
import EditOutlined from "@ant-design/icons/EditOutlined";
import { useRenameNode } from "../../hooks/useRenameNode";

interface RenameNodeModalProps {
  node: { id: string; name: string } | null;
  onClose: () => void;
}

export default function RenameNodeModal({ node, onClose }: RenameNodeModalProps) {
  const [form] = Form.useForm<{ name: string }>();
  const renameMutation = useRenameNode();

  useEffect(() => {
    if (node) form.setFieldsValue({ name: node.name });
  }, [node, form]);

  const handleClose = () => {
    onClose();
    form.resetFields();
  };

  const handleSubmit = (values: { name: string }) => {
    if (!node) return;
    renameMutation.mutate(
      { nodeId: node.id, name: values.name.trim() },
      { onSuccess: handleClose },
    );
  };

  return (
    <Modal
      open={node !== null}
      onCancel={handleClose}
      title="Renombrar"
      width={400}
      destroyOnHidden
      footer={
        <Button
          type="primary"
          icon={<EditOutlined />}
          loading={renameMutation.isPending}
          onClick={() => form.submit()}
        >
          Renombrar
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={renameMutation.isPending}
      >
        <Form.Item
          label="Nombre"
          name="name"
          rules={[{ required: true, message: "Ingresá un nombre" }]}
        >
          <Input autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
}
