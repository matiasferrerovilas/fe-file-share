import { createFileRoute } from "@tanstack/react-router";
import FileExplorer from "../components/files/FileExplorer";

export const Route = createFileRoute("/files/$folderId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { folderId } = Route.useParams();
  return <FileExplorer folderId={folderId} />;
}
