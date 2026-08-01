import { Divider, Select, Space, theme } from "antd";
import SwapOutlined from "@ant-design/icons/SwapOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import AppstoreOutlined from "@ant-design/icons/AppstoreOutlined";
import { useCurrentWorkspace } from "../workspace/WorkspaceContext";
import CreateWorkspaceModal from "./modals/CreateWorkspaceModal";

export default function WorkspaceSelector() {
  const { currentWorkspace, workspaces, setCurrentWorkspace, isLoading } = useCurrentWorkspace();
  const { token } = theme.useToken();

  if (isLoading || workspaces.length === 0) {
    return null;
  }

  const workspaceOptions = workspaces.map((ws) => ({
    value: ws.workspaceId,
    label: ws.workspaceName,
  }));

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
            onChange={(value) => setCurrentWorkspace(value)}
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
