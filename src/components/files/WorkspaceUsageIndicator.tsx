import { Progress, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useWorkspaceUsage } from "../../hooks/useWorkspaceUsage";
import { formatFileSize } from "../../utils/formatFileSize";

const { Text } = Typography;

// Umbral a partir del cual la barra pasa a "exception" (rojo) para avisar antes de que la
// próxima subida sea rechazada por superar la cuota del workspace.
const NEAR_LIMIT_PERCENT = 90;

export default function WorkspaceUsageIndicator() {
  const { t } = useTranslation();
  const { data: usage } = useWorkspaceUsage();

  if (!usage) return null;

  const percent = usage.quotaBytes > 0 ? Math.min(100, (usage.usedBytes / usage.quotaBytes) * 100) : 0;

  return (
    <div style={{ marginTop: 16 }}>
      <Progress
        percent={percent}
        showInfo={false}
        size="small"
        status={percent >= NEAR_LIMIT_PERCENT ? "exception" : "normal"}
      />
      <Text type="secondary" style={{ fontSize: 12 }}>
        {t("files.storageUsage", {
          used: formatFileSize(usage.usedBytes),
          total: formatFileSize(usage.quotaBytes),
        })}
      </Text>
    </div>
  );
}
