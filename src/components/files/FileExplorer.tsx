import { useState } from "react";
import { Button, Drawer, Grid, Layout, theme } from "antd";
import MenuOutlined from "@ant-design/icons/MenuOutlined";
import FolderTreeSidebar from "./FolderTreeSidebar";
import FolderContentsPanel from "./FolderContentsPanel";
import PageDropzone from "./PageDropzone";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

interface FileExplorerProps {
  folderId: string;
}

export default function FileExplorer({ folderId }: FileExplorerProps) {
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [treeOpen, setTreeOpen] = useState(false);

  return (
    <PageDropzone folderId={folderId}>
      <Layout style={{ flex: 1, minHeight: 0, background: token.colorBgContainer }}>
        {isMobile ? (
          <Drawer
            title="Carpetas"
            placement="left"
            open={treeOpen}
            onClose={() => setTreeOpen(false)}
            width="85%"
            styles={{ body: { padding: 16 } }}
          >
            <FolderTreeSidebar
              activeFolderId={folderId}
              onNavigate={() => setTreeOpen(false)}
            />
          </Drawer>
        ) : (
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
        )}
        <Content
          style={{
            padding: isMobile ? 16 : 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            overflow: "auto",
            minWidth: 0,
          }}
        >
          {isMobile && (
            <Button icon={<MenuOutlined />} onClick={() => setTreeOpen(true)} style={{ alignSelf: "flex-start" }}>
              Carpetas
            </Button>
          )}
          <FolderContentsPanel folderId={folderId} />
        </Content>
      </Layout>
    </PageDropzone>
  );
}
