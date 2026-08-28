import { useState } from "react";
import { App as AntdApp, Button, DatePicker, Empty, Flex, Form, List, Modal, Popconfirm, Select, Tag, Typography } from "antd";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import PlusCircleOutlined from "@ant-design/icons/PlusCircleOutlined";
import SaveOutlined from "@ant-design/icons/SaveOutlined";
import UsergroupAddOutlined from "@ant-design/icons/UsergroupAddOutlined";
import { useTranslation } from "react-i18next";
import { SharePermission, type UserFileShare } from "../../models/FileShare";
import { useShareWithUser, useUserShares, useRevokeUserShare, useUpdateUserShare } from "../../hooks/useUserShares";

const { Text } = Typography;

interface ShareWithPersonModalProps {
  node: { id: string; name: string } | null;
  onClose: () => void;
}

interface ShareForm {
  emails: string[];
  permission: SharePermission;
  expiresAt?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ShareWithPersonModal({ node, onClose }: ShareWithPersonModalProps) {
  const { t } = useTranslation();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm<ShareForm>();
  const fileId = node?.id ?? null;

  const sharesQuery = useUserShares(fileId);
  const shareMutation = useShareWithUser();
  const updateMutation = useUpdateUserShare();
  const revokeMutation = useRevokeUserShare();
  const [expiresAtDate, setExpiresAtDate] = useState<string | null>(null);
  const [editingShare, setEditingShare] = useState<UserFileShare | null>(null);

  const resetForm = () => {
    form.resetFields();
    setExpiresAtDate(null);
    setEditingShare(null);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleStartEdit = (share: UserFileShare) => {
    setEditingShare(share);
    form.setFieldsValue({ emails: [share.sharedWithEmail], permission: share.permission });
    setExpiresAtDate(share.expiresAt ? share.expiresAt.slice(0, 10) : null);
  };

  const handleSubmit = async (values: ShareForm) => {
    if (!fileId) return;
    // "Hasta el X" incluye todo ese día, no solo el instante de medianoche.
    const expiresAt = expiresAtDate ? `${expiresAtDate}T23:59:59` : null;

    if (editingShare) {
      updateMutation.mutate(
        { shareId: editingShare.id, fileId, permission: values.permission, expiresAt },
        {
          onSuccess: () => {
            message.success(t("files.shareWithPerson.updateSuccess", { email: editingShare.sharedWithEmail }));
            resetForm();
          },
          onError: () =>
            message.error(t("files.shareWithPerson.updateFailed", { email: editingShare.sharedWithEmail })),
        },
      );
      return;
    }

    // Un email por request al backend (no hay endpoint de lote) — Promise.allSettled para que un
    // 404/409 de una persona no le impida al resto de la tanda compartirse igual, mismo patrón que
    // el borrado/movido en lote de FolderContentsPanel.
    const results = await Promise.allSettled(
      values.emails.map((email) => shareMutation.mutateAsync({ fileId, email, permission: values.permission, expiresAt })),
    );
    const failedEmails = values.emails.filter((_, index) => results[index]?.status === "rejected");

    if (failedEmails.length === 0) {
      message.success(
        values.emails.length === 1
          ? t("files.shareWithPerson.shareSuccess", { email: values.emails[0] })
          : t("files.shareWithPerson.shareSuccessMultiple", { count: values.emails.length }),
      );
      resetForm();
    } else if (failedEmails.length < values.emails.length) {
      message.warning(
        t("files.shareWithPerson.sharePartialFailure", {
          failed: failedEmails.length,
          total: values.emails.length,
          emails: failedEmails.join(", "),
        }),
      );
      resetForm();
    } else {
      message.error(t("files.shareWithPerson.shareFailedAll"));
    }
  };

  const handleRevoke = (share: UserFileShare) => {
    if (!fileId) return;
    revokeMutation.mutate(
      { shareId: share.id, fileId },
      {
        onSuccess: () => message.success(t("files.shareWithPerson.revokeSuccess", { email: share.sharedWithEmail })),
        onError: () => message.error(t("files.shareWithPerson.revokeFailed", { email: share.sharedWithEmail })),
      },
    );
  };

  const shares = sharesQuery.data ?? [];
  const isEditing = editingShare !== null;
  const isSubmitting = shareMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={node !== null}
      onCancel={handleClose}
      title={node ? t("files.shareWithPerson.title", { name: node.name }) : ""}
      width={480}
      destroyOnHidden
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={isSubmitting}
        initialValues={{ permission: SharePermission.READ }}
      >
        {isEditing && (
          <Text type="secondary" style={{ display: "block", marginBottom: 12, fontSize: 13 }}>
            {t("files.shareWithPerson.editingBanner", { email: editingShare.sharedWithEmail })}
          </Text>
        )}
        <Flex gap={12} align="flex-start" wrap>
          <Form.Item
            label={t(isEditing ? "files.shareWithPerson.emailLabel" : "files.shareWithPerson.emailsLabel")}
            name="emails"
            style={{ flex: 1, minWidth: 200 }}
            rules={[
              {
                validator: async (_, value: string[] | undefined) => {
                  if (!value || value.length === 0) {
                    throw new Error(t("files.shareWithPerson.emailRequired"));
                  }
                  if (value.some((email) => !EMAIL_PATTERN.test(email))) {
                    throw new Error(t("files.shareWithPerson.emailInvalid"));
                  }
                },
              },
            ]}
          >
            <Select
              mode="tags"
              open={false}
              suffixIcon={null}
              tokenSeparators={[",", ";", " "]}
              placeholder={t(
                isEditing ? "files.shareWithPerson.emailPlaceholder" : "files.shareWithPerson.emailsPlaceholder",
              )}
              disabled={isEditing}
            />
          </Form.Item>
          <Form.Item
            label={t("files.shareWithPerson.permissionLabel")}
            name="permission"
            style={{ width: 150 }}
          >
            <Select
              options={[
                { value: SharePermission.READ, label: t("files.shareWithPerson.permissionRead") },
                { value: SharePermission.WRITE, label: t("files.shareWithPerson.permissionWrite") },
                { value: SharePermission.READ_WRITE, label: t("files.shareWithPerson.permissionReadWrite") },
              ]}
            />
          </Form.Item>
        </Flex>
        <Form.Item label={t("files.shareWithPerson.expiresAtLabel")}>
          <DatePicker
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            placeholder={t("files.shareWithPerson.expiresAtPlaceholder")}
            onChange={(_, dateString) => setExpiresAtDate(typeof dateString === "string" && dateString ? dateString : null)}
          />
          {isEditing && (
            <Text type="secondary" style={{ display: "block", marginTop: 6, fontSize: 12 }}>
              {expiresAtDate
                ? t("files.shareWithPerson.currentExpiration", { date: expiresAtDate })
                : t("files.shareWithPerson.currentExpirationNone")}
            </Text>
          )}
        </Form.Item>
        <Flex gap={8}>
          <Button
            type="primary"
            icon={isEditing ? <SaveOutlined /> : <PlusCircleOutlined />}
            htmlType="submit"
            loading={isSubmitting}
            block
          >
            {t(isEditing ? "files.shareWithPerson.saveChangesButton" : "files.shareWithPerson.shareButton")}
          </Button>
          {isEditing && (
            <Button icon={<CloseOutlined />} onClick={resetForm} disabled={isSubmitting}>
              {t("files.shareWithPerson.cancelEditButton")}
            </Button>
          )}
        </Flex>
      </Form>

      <List
        style={{ marginTop: 20 }}
        loading={sharesQuery.isLoading}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("files.shareWithPerson.empty")} /> }}
        dataSource={shares}
        renderItem={(share) => (
          <List.Item
            actions={[
              <Button
                key="edit"
                type="text"
                size="small"
                icon={<EditOutlined />}
                aria-label={t("files.shareWithPerson.editButton")}
                onClick={() => handleStartEdit(share)}
              />,
              <Popconfirm
                key="revoke"
                title={t("files.shareWithPerson.revokeConfirmTitle", { email: share.sharedWithEmail })}
                onConfirm={() => handleRevoke(share)}
                okText={t("files.delete")}
                okButtonProps={{ danger: true }}
                cancelText={t("files.cancel")}
              >
                <Button type="text" danger size="small" icon={<DeleteOutlined />} loading={revokeMutation.isPending} />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              avatar={<UsergroupAddOutlined />}
              title={share.sharedWithEmail}
              description={
                <Flex gap={8} align="center">
                  <Tag>{t(`files.shareWithPerson.permission${permissionSuffix(share.permission)}`)}</Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {share.expiresAt
                      ? t("files.shareWithPerson.expiresOn", { date: share.expiresAt.slice(0, 10) })
                      : t("files.shareWithPerson.noExpiration")}
                  </Text>
                </Flex>
              }
            />
          </List.Item>
        )}
      />
    </Modal>
  );
}

function permissionSuffix(permission: SharePermission): "Read" | "Write" | "ReadWrite" {
  if (permission === SharePermission.READ) return "Read";
  if (permission === SharePermission.WRITE) return "Write";
  return "ReadWrite";
}
