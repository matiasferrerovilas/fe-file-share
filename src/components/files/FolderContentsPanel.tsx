import { useMemo, useState } from "react";
import { Breadcrumb, Col, Dropdown, Grid, Space, type MenuProps } from "antd";
import { useNavigate } from "@tanstack/react-router";
import FolderAddOutlined from "@ant-design/icons/FolderAddOutlined";
import { useFileSystemTree } from "../../hooks/useFileSystemTree";
import { findNode, findPath } from "../../utils/fileSystemTree";
import { ROOT_FOLDER_ID } from "../../api/foldersApi";
import FolderContentCard from "./FolderContentCard";
import CreateFolderModal from "./CreateFolderModal";

interface FolderContentsPanelProps {
  folderId: string;
}

const contextMenuItems: MenuProps["items"] = [
  { key: "create-folder", label: "Crear carpeta", icon: <FolderAddOutlined /> },
];

const { useBreakpoint } = Grid;

export default function FolderContentsPanel({ folderId }: FolderContentsPanelProps) {
  const navigate = useNavigate();
  const { data: tree = [] } = useFileSystemTree();
  const [creatingFolder, setCreatingFolder] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const rows = useMemo(() => {
    // El primer nodo es la carpeta raíz del backend — al verla se muestran
    // directamente sus hijos en vez de listarla como si fuera una carpeta más.
    if (folderId === ROOT_FOLDER_ID) return tree[0]?.children ?? [];
    return findNode(tree, folderId)?.children ?? [];
  }, [tree, folderId]);

  const ancestors = useMemo(() => {
    if (folderId === ROOT_FOLDER_ID) return [];
    // Busca desde los hijos de la raíz: el nodo raíz ya se muestra como el
    // primer item del breadcrumb, no hace falta repetirlo en ancestors.
    return findPath(tree[0]?.children ?? [], folderId);
  }, [tree, folderId]);

  const goToFolder = (id: string) => navigate({ to: "/files/$folderId", params: { folderId: id } });

  const breadcrumbItems = [
    { title: <a onClick={() => goToFolder(ROOT_FOLDER_ID)}>{tree[0]?.name}</a> },
    ...ancestors.map((node, index) => ({
      title:
        index === ancestors.length - 1 ? (
          node.name
        ) : (
          <a onClick={() => goToFolder(node.id)}>{node.name}</a>
        ),
    })),
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
      <Dropdown
        menu={{ items: contextMenuItems, onClick: () => setCreatingFolder(true) }}
        trigger={["contextMenu"]}
      >
        <div style={{ flex: 1, minHeight: "60vh" }}>
          <Space wrap style={isMobile ? { width: "100%", justifyContent: "center" } : undefined}>
            {rows.map((node, index) => (
              <Col
                xs={24}
                sm={12}
                lg={8}
                key={node.id}
                style={{ marginBottom: 16, animationDelay: `${(index + 2) * 80}ms` }}
                className="fade-in-up"
              >
                <FolderContentCard key={node.id} node={node} />
              </Col>
            ))}
          </Space>
        </div>
      </Dropdown>
      <CreateFolderModal
        folderId={folderId}
        open={creatingFolder}
        onClose={() => setCreatingFolder(false)}
      />
    </>
  );
}
