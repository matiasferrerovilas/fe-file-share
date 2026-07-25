import { Layout, theme } from "antd";
import FolderTreeSidebar from "./FolderTreeSidebar";
import FolderUploader from "./FolderUploader";
import FolderContentsPanel from "./FolderContentsPanel";

const { Sider, Content } = Layout;

interface FileExplorerProps {
  folderId: string;
}

export default function FileExplorer({ folderId }: FileExplorerProps) {
  const { token } = theme.useToken();

  return (
    <Layout style={{ flex: 1, minHeight: 0, background: token.colorBgContainer }}>
      <Sider
        width={260}
        style={{
          height: "100%",
          background: token.colorBgContainer,
          borderInlineEnd: `1px solid ${token.colorBorderSecondary}`,
          padding: 16,
          overflow: "auto",
        }}
      >
        <FolderTreeSidebar activeFolderId={folderId} />
      </Sider>
      <Content
        style={{
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          overflow: "auto",
          minWidth: 0,
        }}
      >
        <FolderContentsPanel folderId={folderId} />
      </Content>
    </Layout>
  );
}
