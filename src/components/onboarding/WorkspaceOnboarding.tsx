import { useMemo, useState } from "react";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import AppstoreOutlined from "@ant-design/icons/AppstoreOutlined";
import StarFilled from "@ant-design/icons/StarFilled";
import StarOutlined from "@ant-design/icons/StarOutlined";
import {
  Button,
  Col,
  Empty,
  Flex,
  Form,
  Input,
  Row,
  Space,
  Tooltip,
  Typography,
  theme,
} from "antd";
import { useTranslation } from "react-i18next";
import { useWorkspaces } from "../../hooks/useWorkspaces";
import type { OnboardingForm } from "../../api/onboarding/onboardinApi";

const { Text } = Typography;

interface Props {
  initialValues: Partial<OnboardingForm>;
  onNext: (values: Pick<OnboardingForm, "existingDefaultWorkspaceId" | "workspacesToAdd">) => void;
  onPrev?: () => void;
}

interface NewEntry {
  id: string;
  name: string;
}

export default function WorkspaceOnboarding({ initialValues, onNext, onPrev }: Props) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { data: existingWorkspaces = [] } = useWorkspaces();
  const [form] = Form.useForm<{ name: string }>();
  const [newEntries, setNewEntries] = useState<NewEntry[]>([]);
  // null significa "sin selección manual" — se usa el default natural (primer existente, si no el primer nuevo)
  const [selectedKey, setSelectedKey] = useState<string | null>(
    initialValues.existingDefaultWorkspaceId !== undefined
      ? `existing:${initialValues.existingDefaultWorkspaceId}`
      : null,
  );

  const naturalDefaultKey =
    existingWorkspaces.length > 0
      ? `existing:${existingWorkspaces[0].workspaceId}`
      : newEntries.length > 0
        ? `new:${newEntries[0].id}`
        : null;

  const defaultKey = selectedKey ?? naturalDefaultKey;

  const handleAdd = () => {
    form.validateFields().then(({ name }) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      setNewEntries((prev) => [...prev, { id: crypto.randomUUID(), name: trimmed }]);
      form.resetFields();
    }).catch(() => {
      // validación fallida — Ant Design muestra los errores en el form
    });
  };

  const handleRemove = (id: string) => {
    setNewEntries((prev) => prev.filter((e) => e.id !== id));
    if (selectedKey === `new:${id}`) {
      setSelectedKey(null);
    }
  };

  const handleSubmit = () => {
    let workspacesToAdd = newEntries.map((e) => e.name);

    if (defaultKey?.startsWith("new:")) {
      const id = defaultKey.slice("new:".length);
      const idx = newEntries.findIndex((e) => e.id === id);
      if (idx > 0) {
        const [chosen] = workspacesToAdd.splice(idx, 1);
        workspacesToAdd = [chosen, ...workspacesToAdd];
      }
    }

    const existingDefaultWorkspaceId = defaultKey?.startsWith("existing:")
      ? Number(defaultKey.slice("existing:".length))
      : undefined;

    onNext({ existingDefaultWorkspaceId, workspacesToAdd });
  };

  const items = useMemo(
    () => [
      ...existingWorkspaces.map((ws) => ({
        key: `existing:${ws.workspaceId}`,
        name: ws.workspaceName,
        removable: false,
        onRemove: () => {},
      })),
      ...newEntries.map((e) => ({
        key: `new:${e.id}`,
        name: e.name,
        removable: true,
        onRemove: () => handleRemove(e.id),
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [existingWorkspaces, newEntries],
  );

  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text type="secondary" style={{ display: "block" }}>
          {t("onboarding.workspaceStep.intro1")}
        </Text>
        <Text type="secondary" style={{ display: "block" }}>
          {t("onboarding.workspaceStep.intro2")}
        </Text>
      </div>

      <Form form={form} layout="vertical" onFinish={handleAdd}>
        <Row gutter={[12, 0]} align="middle">
          <Col flex="auto">
            <Form.Item
              name="name"
              style={{ margin: 0 }}
              rules={[
                { required: true, message: t("onboarding.workspaceStep.nameRequired") },
                {
                  validator: (_, value) => {
                    if (!value || !value.trim()) return Promise.resolve();
                    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/.test(value)) {
                      return Promise.reject(
                        new Error(t("onboarding.workspaceStep.nameInvalid")),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                placeholder={t("onboarding.workspaceStep.namePlaceholder")}
                style={{ borderRadius: 10, height: 40 }}
              />
            </Form.Item>
          </Col>
          <Col>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              htmlType="submit"
              style={{ height: 40, borderRadius: 10, fontWeight: 600 }}
            >
              {t("onboarding.workspaceStep.add")}
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Lista combinada de workspaces existentes + nuevos */}
      <div
        style={{
          minHeight: 80,
          padding: "12px 14px",
          borderRadius: 12,
          border: `1.5px dashed ${token.colorBorderSecondary}`,
          background: token.colorFillAlter,
        }}
      >
        {items.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t("onboarding.workspaceStep.empty")}
              </Text>
            }
            style={{ margin: "8px 0" }}
          />
        ) : (
          <Flex vertical gap={8}>
            {items.map((item) => {
              const isDefault = defaultKey === item.key;
              return (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: `1.5px solid ${isDefault ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
                    background: isDefault ? token.colorPrimaryBg : token.colorBgContainer,
                    transition: "all 0.2s ease",
                  }}
                >
                  <Flex align="center" gap={10}>
                    <AppstoreOutlined
                      style={{
                        color: isDefault ? token.colorPrimary : token.colorTextSecondary,
                        fontSize: 16,
                      }}
                    />
                    <Text strong style={{ fontSize: 14 }}>
                      {item.name}
                    </Text>
                    {isDefault && (
                      <span
                        style={{
                          background: `linear-gradient(90deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
                          borderRadius: 20,
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.5px",
                          padding: "2px 9px",
                          textTransform: "uppercase",
                          lineHeight: "18px",
                        }}
                      >
                        ★ {t("onboarding.workspaceStep.default")}
                      </span>
                    )}
                  </Flex>
                  <Flex gap={4}>
                    <Tooltip
                      title={
                        isDefault
                          ? t("onboarding.workspaceStep.alreadyDefaultTooltip")
                          : t("onboarding.workspaceStep.setAsDefaultTooltip")
                      }
                    >
                      <Button
                        type="text"
                        size="small"
                        aria-label={t("onboarding.workspaceStep.markAsDefaultAriaLabel", {
                          name: item.name,
                        })}
                        disabled={isDefault}
                        onClick={() => setSelectedKey(item.key)}
                        icon={
                          isDefault ? (
                            <StarFilled style={{ color: token.colorWarning }} />
                          ) : (
                            <StarOutlined style={{ color: token.colorTextQuaternary }} />
                          )
                        }
                      />
                    </Tooltip>
                    {item.removable && (
                      <Tooltip title={t("onboarding.workspaceStep.removeWorkspaceTooltip")}>
                        <Button
                          type="text"
                          size="small"
                          danger
                          aria-label={t("onboarding.workspaceStep.removeWorkspaceAriaLabel", {
                            name: item.name,
                          })}
                          onClick={item.onRemove}
                          icon={<DeleteOutlined />}
                        />
                      </Tooltip>
                    )}
                  </Flex>
                </div>
              );
            })}
          </Flex>
        )}
      </div>

      <Text type="secondary" style={{ fontSize: 12, display: "block", textAlign: "center" }}>
        {t("onboarding.workspaceStep.footerHint")}
      </Text>

      <Row gutter={[16, 10]}>
        {onPrev && (
          <Col xs={12}>
            <Button block onClick={onPrev}>
              {t("onboarding.welcomeStep.back")}
            </Button>
          </Col>
        )}
        <Col xs={onPrev ? 12 : 24}>
          <Button color="geekblue" block onClick={handleSubmit} variant="filled">
            {t("onboarding.workspaceStep.next")}
          </Button>
        </Col>
      </Row>
    </Space>
  );
}
