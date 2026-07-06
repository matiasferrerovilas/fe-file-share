import { Button, Result } from "antd";
import { Link } from "@tanstack/react-router";

export default function NotFound() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="La página que buscás no existe."
      extra={
        <Link to="/">
          <Button type="primary">Volver al inicio</Button>
        </Link>
      }
    />
  );
}
