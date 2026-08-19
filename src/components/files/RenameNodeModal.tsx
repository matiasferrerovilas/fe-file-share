import { useEffect } from "react";
import { App as AntdApp, Button, Form, Input, Modal } from "antd";
import EditOutlined from "@ant-design/icons/EditOutlined";
import { useTranslation } from "react-i18next";
import { useRenameNode } from "../../hooks/useRenameNode";
import { parseNameConflict, suggestAlternativeName } from "../../utils/conflictResolution";

interface RenameNodeModalProps {
  node: { id: string; name: string } | null;
  onClose: () => void;
}

const CONFLICT_MESSAGE_KEY = "rename-name-conflict";

export default function RenameNodeModal({ node, onClose }: RenameNodeModalProps) {
  const { t } = useTranslation();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm<{ name: string }>();
  const renameMutation = useRenameNode();

  useEffect(() => {
    if (node) form.setFieldsValue({ name: node.name });
  }, [node, form]);

  const handleClose = () => {
    onClose();
    form.resetFields();
  };

  const submitRename = (nodeId: string, name: string) => {
    renameMutation.mutate(
      { nodeId, name },
      {
        onSuccess: handleClose,
        onError: (error) => {
          const conflictingName = parseNameConflict(error);
          // Solo el 400 de colisión de nombre ofrece el atajo de renombrar; cualquier otro error
          // (permisos, red, carpeta raíz, ...) muestra el toast genérico de siempre.
          if (!conflictingName) {
            message.error(t("files.renameFailed"));
            return;
          }

          const suggestion = suggestAlternativeName(conflictingName);
          message.error({
            key: CONFLICT_MESSAGE_KEY,
            duration: 8,
            content: (
              <span>
                {t("files.nameConflict", { name: conflictingName })}{" "}
                <a
                  onClick={() => {
                    message.destroy(CONFLICT_MESSAGE_KEY);
                    submitRename(nodeId, suggestion);
                  }}
                >
                  {t("files.useAlternativeName", { name: suggestion })}
                </a>
              </span>
            ),
          });
        },
      },
    );
  };

  const handleSubmit = (values: { name: string }) => {
    if (!node) return;
    submitRename(node.id, values.name.trim());
  };

  return (
    <Modal
      open={node !== null}
      onCancel={handleClose}
      title={t("files.rename")}
      width={400}
      destroyOnHidden
      footer={
        <Button
          type="primary"
          icon={<EditOutlined />}
          loading={renameMutation.isPending}
          onClick={() => form.submit()}
        >
          {t("files.rename")}
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
          label={t("files.renameNameLabel")}
          name="name"
          rules={[{ required: true, message: t("files.renameNamePlaceholder") }]}
        >
          <Input autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
}
