import { useState } from "react";
import { Button, Form, Input, Modal } from "antd";
import PlusCircleOutlined from "@ant-design/icons/PlusCircleOutlined";
import UserAddOutlined from "@ant-design/icons/UserAddOutlined";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { CreateInvitationForm, Workspace } from "../../models/Workspace";
import { addInvitationWorkspaceApi } from "../../api/workspaceApi";

interface InviteUserToWorkspaceProps {
  group: Workspace;
}

export default function InviteUserToWorkspace({ group }: InviteUserToWorkspaceProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<{ email: string }>();
  const [modalOpen, setModalOpen] = useState(false);

  const handleCloseModal = () => {
    setModalOpen(false);
    form.resetFields();
  };

  const addInvitationMutation = useMutation({
    mutationFn: (invitation: CreateInvitationForm) => addInvitationWorkspaceApi(invitation),
    onError: (err) => console.error("Error creando invitación:", err),
    onSuccess: () => {
      console.debug("✅ Invitación creada correctamente");
      handleCloseModal();
    },
  });

  const handleSubmit = (values: { email: string }) => {
    addInvitationMutation.mutate({
      emails: [values.email],
      workspaceId: group.workspaceId,
    });
  };

  return (
    <>
      <Button
        type="text"
        icon={<UserAddOutlined style={{ fontSize: 18 }} />}
        onClick={() => setModalOpen(true)}
        title={t("workspace.inviteMember")}
        aria-label={t("workspace.inviteMember")}
      />
      <Modal
        open={modalOpen}
        onCancel={handleCloseModal}
        title={t("workspace.inviteMember")}
        width={400}
        footer={
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            loading={addInvitationMutation.isPending}
            onClick={() => form.submit()}
          >
            {t("workspace.sendInvitation")}
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={addInvitationMutation.isPending}
        >
          <Form.Item
            label={t("workspace.memberEmailLabel")}
            name="email"
            rules={[
              { required: true, message: t("workspace.emailRequired") },
              { type: "email", message: t("workspace.emailInvalid") },
            ]}
          >
            <Input placeholder={t("workspace.emailPlaceholder")} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
