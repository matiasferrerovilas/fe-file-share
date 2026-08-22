import { useState } from "react";
import { App as AntdApp, Button, DatePicker, Empty, Flex, Form, Input, List, Modal, Popconfirm, Select, Tag, Typography } from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import PlusCircleOutlined from "@ant-design/icons/PlusCircleOutlined";
import UsergroupAddOutlined from "@ant-design/icons/UsergroupAddOutlined";
import { useTranslation } from "react-i18next";
import { SharePermission, type UserFileShare } from "../../models/FileShare";
import { useShareWithUser, useUserShares, useRevokeUserShare } from "../../hooks/useUserShares";

const { Text } = Typography;

interface ShareWithPersonModalProps {
  node: { id: string; name: string } | null;
  onClose: () => void;
}

interface ShareForm {
  email: string;
  permission: SharePermission;
  expiresAt?: string;
}

export default function ShareWithPersonModal({ node, onClose }: ShareWithPersonModalProps) {
  const { t } = useTranslation();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm<ShareForm>();
  const fileId = node?.id ?? null;

  const sharesQuery = useUserShares(fileId);
  const shareMutation = useShareWithUser();
  const revokeMutation = useRevokeUserShare();
  const [expiresAtDate, setExpiresAtDate] = useState<string | null>(null);

  const handleClose = () => {
    onClose();
    form.resetFields();
    setExpiresAtDate(null);
  };

  const handleSubmit = (values: ShareForm) => {
    if (!fileId) return;
    shareMutation.mutate(
      {
        fileId,
        email: values.email,
        permission: values.permission,
        // "Hasta el X" incluye todo ese día, no solo el instante de medianoche.
        expiresAt: expiresAtDate ? `${expiresAtDate}T23:59:59` : null,
      },
      {
        onSuccess: () => {
          message.success(t("files.shareWithPerson.shareSuccess", { email: values.email }));
          form.resetFields();
          setExpiresAtDate(null);
        },
        onError: (error) => {
          const status = (error as { response?: { status?: number } }).response?.status;
          message.error(
            t(
              status === 404
                ? "files.shareWithPerson.noAccountForEmail"
                : status === 409
                  ? "files.shareWithPerson.alreadyShared"
                  : "files.shareWithPerson.shareFailed",
              { email: values.email },
            ),
          );
        },
      },
    );
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
        disabled={shareMutation.isPending}
        initialValues={{ permission: SharePermission.READ }}
      >
        <Flex gap={12} align="flex-start" wrap>
          <Form.Item
            label={t("files.shareWithPerson.emailLabel")}
            name="email"
            style={{ flex: 1, minWidth: 200 }}
            rules={[
              { required: true, message: t("files.shareWithPerson.emailRequired") },
              { type: "email", message: t("files.shareWithPerson.emailInvalid") },
            ]}
          >
            <Input placeholder={t("files.shareWithPerson.emailPlaceholder")} />
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
        </Form.Item>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          htmlType="submit"
          loading={shareMutation.isPending}
          block
        >
          {t("files.shareWithPerson.shareButton")}
        </Button>
      </Form>

      <List
        style={{ marginTop: 20 }}
        loading={sharesQuery.isLoading}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("files.shareWithPerson.empty")} /> }}
        dataSource={shares}
        renderItem={(share) => (
          <List.Item
            actions={[
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
