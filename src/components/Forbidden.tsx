import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";

type ForbiddenProps = {
  onRetry?: () => void;
};

export default function Forbidden({ onRetry }: ForbiddenProps) {
  const { t } = useTranslation();
  return (
    <Result
      status="403"
      title="403"
      subTitle={t("common.forbiddenSubtitle")}
      extra={
        <Button type="primary" onClick={onRetry ?? (() => window.location.reload())}>
          {t("common.forbiddenRetry")}
        </Button>
      }
    />
  );
}
