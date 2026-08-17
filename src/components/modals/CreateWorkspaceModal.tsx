import { useState } from "react";
import { Button, Form, Input, Modal } from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { CreateWorkspaceForm } from "../../models/Workspace";
import { addWorkspaceApi } from "../../api/workspaceApi";
import { USER_WORKSPACES_QUERY_KEY } from "../../hooks/useWorkspaces";

interface CreateWorkspaceModalProps {
  children: (openModal: () => void) => React.ReactNode;
}

export default function CreateWorkspaceModal({ children }: CreateWorkspaceModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<CreateWorkspaceForm>();
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
    form.resetFields();
  };

  const addWorkspaceMutation = useMutation({
    mutationFn: (workspace: CreateWorkspaceForm) => addWorkspaceApi(workspace),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_WORKSPACES_QUERY_KEY });
      handleCloseModal();
    },
    onError: (err) => console.error("Error creando workspace:", err),
  });

  const handleSubmit = (values: CreateWorkspaceForm) => {
    addWorkspaceMutation.mutate(values);
  };

  return (
    <>
      {children(handleOpenModal)}
      <Modal
        open={modalOpen}
        onCancel={handleCloseModal}
        title={t("workspace.newWorkspaceTitle")}
        width={400}
        footer={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={addWorkspaceMutation.isPending}
            onClick={() => form.submit()}
          >
            {t("workspace.createWorkspace")}
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={addWorkspaceMutation.isPending}
        >
          <Form.Item
            label={t("workspace.nameLabel")}
            name="description"
            rules={[{ required: true, message: t("workspace.nameRequired") }]}
          >
            <Input placeholder={t("workspace.namePlaceholder")} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
