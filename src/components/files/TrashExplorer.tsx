import { useState } from "react";
import { Button, Drawer, Grid, Layout, theme } from "antd";
import MenuOutlined from "@ant-design/icons/MenuOutlined";
import { useTranslation } from "react-i18next";
import FolderTreeSidebar from "./FolderTreeSidebar";
import TrashContentsPanel from "./TrashContentsPanel";
import { ROOT_FOLDER_ID } from "../../api/foldersApi";
import type { FileSystemNode } from "../../models/FileSystemNode";
import { UploadQueueProvider } from "../../uploads/UploadQueueProvider";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

interface TrashExplorerProps {
  nodes: FileSystemNode[];
  title: string;
  isLoading?: boolean;
}

/**
 * Same Sider+Content shell as SmartFileListExplorer, pero con TrashContentsPanel en vez de
 * FolderContentsPanel: los ítems de la papelera no aceptan mover/renombrar/compartir/favoritos,
 * solo restaurar, así que comparten muy poco con el panel de carpetas normal.
 */
export default function TrashExplorer({ nodes, title, isLoading }: TrashExplorerProps) {
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
        <TrashContentsPanel nodes={nodes} title={title} isLoading={isLoading} />
      </Content>
    </Layout>
    </UploadQueueProvider>
  );
}
