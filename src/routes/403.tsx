import { createFileRoute } from "@tanstack/react-router";
import Forbidden from "../components/Forbidden";

// Sin protectedRouteGuard a propósito: acá es donde termina el usuario que no pasó ese guard en
// otra ruta — exigirle un rol acá también sería un loop de redirects.
export const Route = createFileRoute("/403")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Forbidden />;
}
