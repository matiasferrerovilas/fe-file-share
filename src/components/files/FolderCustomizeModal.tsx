import { useState } from "react";
import { App as AntdApp, Button, Modal, theme } from "antd";
import { useTranslation } from "react-i18next";
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import { useSetFolderCustomization } from "../../hooks/useSetFolderCustomization";
import { FOLDER_COLOR_OPTIONS, FOLDER_ICON_OPTIONS } from "../../utils/folderCustomization";

interface FolderCustomizeModalProps {
  node: { id: string; name: string; color: string | null; icon: string | null } | null;
  onClose: () => void;
}

/** Caller remounts this (via `key`) whenever `node` changes, so the initial `useState` below
 * always reflects the right node without needing an effect to re-sync it. */
export default function FolderCustomizeModal({ node, onClose }: FolderCustomizeModalProps) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = AntdApp.useApp();
  const mutation = useSetFolderCustomization();
  const [color, setColor] = useState<string | null>(node?.color ?? null);
  const [icon, setIcon] = useState<string | null>(node?.icon ?? null);

  const handleClose = () => onClose();

  const handleSave = () => {
    if (!node) return;
    mutation.mutate(
      { nodeId: node.id, color, icon },
      {
        onSuccess: handleClose,
        onError: () => message.error(t("files.customizeFailed", { name: node.name })),
      },
    );
  };

  const handleReset = () => {
    setColor(null);
    setIcon(null);
  };

  return (
    <Modal
      open={node !== null}
      onCancel={handleClose}
      title={node ? t("files.customizeTitle", { name: node.name }) : ""}
      width={400}
      destroyOnHidden
      footer={[
        <Button key="reset" onClick={handleReset} disabled={mutation.isPending}>
          {t("files.customizeReset")}
        </Button>,
        <Button key="save" type="primary" loading={mutation.isPending} onClick={handleSave}>
          {t("files.customize")}
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 8, fontWeight: 500 }}>{t("files.customizeColorLabel")}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {FOLDER_COLOR_OPTIONS.map((swatch) => (
          <span
            key={swatch}
            role="button"
            aria-label={swatch}
            onClick={() => setColor(swatch)}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: swatch,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: color === swatch ? `2px solid ${token.colorText}` : "2px solid transparent",
            }}
          >
            {color === swatch && <CheckOutlined style={{ color: "#ffffff", fontSize: 12 }} />}
          </span>
        ))}
      </div>

      <div style={{ marginBottom: 8, fontWeight: 500 }}>{t("files.customizeIconLabel")}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {FOLDER_ICON_OPTIONS.map((option) => (
          <span
            key={option.key}
            role="button"
            aria-label={option.key}
            onClick={() => setIcon(option.key)}
            style={{
              width: 32,
              height: 32,
              borderRadius: token.borderRadiusSM,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 16,
              color: icon === option.key ? (color ?? token.colorPrimary) : token.colorTextSecondary,
              background: icon === option.key ? token.colorFillSecondary : "transparent",
              border: icon === option.key ? `1px solid ${token.colorBorder}` : "1px solid transparent",
            }}
          >
            {option.icon}
          </span>
        ))}
      </div>
    </Modal>
  );
}
