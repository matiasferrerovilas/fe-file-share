import { Divider, Select, Space, Typography, theme } from "antd";
import SwapOutlined from "@ant-design/icons/SwapOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import AppstoreOutlined from "@ant-design/icons/AppstoreOutlined";
import { useNavigate } from "@tanstack/react-router";
import { useCurrentWorkspace } from "../workspace/WorkspaceContext";
import CreateWorkspaceModal from "./modals/CreateWorkspaceModal";

const { Text } = Typography;

interface WorkspaceSelectorProps {
  /** Modo compacto para el drawer mobile */
  compact?: boolean;
}

export default function WorkspaceSelector({ compact = false }: WorkspaceSelectorProps) {
  const { currentWorkspace, workspaces, setCurrentWorkspace, isLoading } = useCurrentWorkspace();
  const { token } = theme.useToken();
  const navigate = useNavigate();

  if (isLoading || workspaces.length === 0) {
    return null;
  }

  const workspaceOptions = workspaces.map((ws) => ({
    value: ws.workspaceId,
    label: ws.workspaceName,
  }));

  const handleWorkspaceChange = (value: number) => {
    setCurrentWorkspace(value);
    navigate({ to: "/" });
  };

  if (compact) {
    return (
      <CreateWorkspaceModal>
        {(openModal) => (
          <div style={{ padding: "0 16px", marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Workspace activo
            </Text>
            <Select
              value={currentWorkspace?.workspaceId}
              onChange={handleWorkspaceChange}
              style={{ width: "100%" }}
              loading={isLoading}
              suffixIcon={<SwapOutlined />}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <div
                    style={{ padding: "4px 8px", cursor: "pointer" }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={openModal}
                  >
                    <Space>
                      <PlusOutlined />
                      <span>Crear workspace</span>
                    </Space>
                  </div>
                </>
              )}
              options={workspaceOptions}
            />
          </div>
        )}
      </CreateWorkspaceModal>
    );
  }

  return (
    <CreateWorkspaceModal>
      {(openModal) => (
        <div
          style={{
            background: token.colorFillSecondary,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            padding: "4px 8px 4px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AppstoreOutlined style={{ color: token.colorTextSecondary, fontSize: 14 }} />
          <Select
            value={currentWorkspace?.workspaceId}
            onChange={handleWorkspaceChange}
            style={{ minWidth: 140 }}
            loading={isLoading}
            suffixIcon={<SwapOutlined />}
            variant="borderless"
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: "8px 0" }} />
                <div
                  style={{ padding: "4px 8px", cursor: "pointer" }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={openModal}
                >
                  <Space>
                    <PlusOutlined />
                    <span>Crear workspace</span>
                  </Space>
                </div>
              </>
            )}
            options={workspaceOptions}
          />
        </div>
      )}
    </CreateWorkspaceModal>
  );
}
