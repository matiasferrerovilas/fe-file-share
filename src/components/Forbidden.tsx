import { Button, Result } from "antd";

type ForbiddenProps = {
  onRetry?: () => void;
};

export default function Forbidden({ onRetry }: ForbiddenProps) {
  return (
    <Result
      status="403"
      title="403"
      subTitle="No tenés permisos para acceder a esta aplicación."
      extra={
        <Button type="primary" onClick={onRetry ?? (() => window.location.reload())}>
          Reintentar
        </Button>
      }
    />
  );
}
