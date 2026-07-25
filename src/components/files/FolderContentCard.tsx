import { Card, Tag, theme } from "antd";
import FileOutlined from "@ant-design/icons/FileOutlined";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import { useNavigate } from "@tanstack/react-router";
import { FileSystemNodeType, type FileSystemNode } from "../../models/FileSystemNode";
import { formatFileSize } from "../../utils/formatFileSize";

interface FolderContentCardProps {
  node: FileSystemNode;
}

export default function FolderContentCard({ node }: FolderContentCardProps) {
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const isFolder = node.type === FileSystemNodeType.FOLDER;

  return (
    <Card
      hoverable
      style={{ width: 240, border: `1px solid ${token.colorPrimary}` }}
      onClick={() => {
        if (node.type !== FileSystemNodeType.FOLDER) return;
        navigate({ to: "/files/$folderId", params: { folderId: node.id } });
      }}
      cover={
        <div
          style={{
            height: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
          }}
        >
          {isFolder ? <FolderOutlined /> : <FileOutlined />}
        </div>
      }
    >
      <Card.Meta title={node.name} style={{ textAlign: "center" }} />
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <Tag
          icon={isFolder ? <FolderOutlined /> : <FileOutlined />}
          color={isFolder ? "blue" : "default"}
          style={{ borderRadius: 16, fontWeight: 600 }}
        >
          {isFolder ? "Carpeta" : `Archivo · ${formatFileSize(node.size ?? 0)}`}
        </Tag>
      </div>
    </Card>
  );
}
