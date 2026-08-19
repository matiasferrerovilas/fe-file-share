import { useState } from "react";
import { Button, Drawer, Grid, Layout, theme } from "antd";
import MenuOutlined from "@ant-design/icons/MenuOutlined";
import { useTranslation } from "react-i18next";
import FolderTreeSidebar from "./FolderTreeSidebar";
import FolderContentsPanel from "./FolderContentsPanel";
import { ROOT_FOLDER_ID } from "../../api/foldersApi";
import type { FileSystemNode } from "../../models/FileSystemNode";
import { UploadQueueProvider } from "../../uploads/UploadQueueProvider";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

interface SmartFileListExplorerProps {
  nodes: FileSystemNode[];
  title: string;
  isLoading?: boolean;
  emptyDescription?: string;
}

/**
 * Same Sider+Content shell as FileExplorer, but for a fixed list of nodes rather than a real
 * folder position (Favoritos/Recientes) — no upload dropzone/tray here, since there's no
 * meaningful upload target for the panel itself. Still needs UploadQueueProvider though:
 * FolderTreeSidebar and FolderContentsPanel call useUploadQueue() unconditionally (the sidebar
 * supports drag-and-drop uploads onto real folders even from this view).
 */
export default function SmartFileListExplorer({ nodes, title, isLoading, emptyDescription }: SmartFileListExplorerProps) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [treeOpen, setTreeOpen] = useState(false);

  return (
    <UploadQueueProvider>
    <Layout style={{ flex: 1, minHeight: 0, background: token.colorBgContainer }}>
      {isMobile ? (
        <Drawer
          title={t("files.folders")}
          placement="left"
          open={treeOpen}
          onClose={() => setTreeOpen(false)}
          width="85%"
          styles={{ body: { padding: 16 } }}
        >
          <FolderTreeSidebar activeFolderId={ROOT_FOLDER_ID} onNavigate={() => setTreeOpen(false)} />
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
          <FolderTreeSidebar activeFolderId={ROOT_FOLDER_ID} />
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
            {t("files.folders")}
          </Button>
        )}
        <FolderContentsPanel
          folderId={ROOT_FOLDER_ID}
          nodes={nodes}
          title={title}
          isLoading={isLoading}
          emptyDescription={emptyDescription}
        />
      </Content>
    </Layout>
    </UploadQueueProvider>
  );
}
