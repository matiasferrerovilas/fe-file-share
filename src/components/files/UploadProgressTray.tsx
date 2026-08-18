import { Card, Progress, Space, Typography, theme } from "antd";
import CheckCircleFilled from "@ant-design/icons/CheckCircleFilled";
import CloseCircleFilled from "@ant-design/icons/CloseCircleFilled";
import FileOutlined from "@ant-design/icons/FileOutlined";
import { useTranslation } from "react-i18next";
import { useUploadQueue } from "../../uploads/UploadQueueContext";

const { Text } = Typography;

export default function UploadProgressTray() {
  const { uploads } = useUploadQueue();
  const { token } = theme.useToken();
  const { t } = useTranslation();

  if (uploads.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 1000,
        width: 320,
        maxWidth: "calc(100vw - 40px)",
      }}
      className="fade-in-up"
    >
      <Card
        size="small"
        title={t("files.uploadProgressTitle", { count: uploads.length })}
        style={{ boxShadow: token.boxShadowSecondary, borderRadius: token.borderRadiusLG }}
        styles={{ body: { padding: "8px 16px", maxHeight: 240, overflowY: "auto" } }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={10}>
          {uploads.map((item) => (
            <div key={item.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                {item.status === "done" ? (
                  <CheckCircleFilled style={{ color: token.colorSuccess, fontSize: 13 }} />
                ) : item.status === "error" ? (
                  <CloseCircleFilled style={{ color: token.colorError, fontSize: 13 }} />
                ) : (
                  <FileOutlined style={{ color: token.colorTextTertiary, fontSize: 13 }} />
                )}
                <Text ellipsis style={{ fontSize: 12.5, flex: 1, minWidth: 0 }} title={item.fileName}>
                  {item.fileName}
                </Text>
              </div>
              <Progress
                percent={item.progress}
                size="small"
                showInfo={false}
                status={item.status === "error" ? "exception" : item.status === "done" ? "success" : "active"}
              />
            </div>
          ))}
        </Space>
      </Card>
    </div>
  );
}
