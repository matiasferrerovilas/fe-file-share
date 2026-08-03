import { useState } from "react";
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  type MenuProps,
  Segmented,
  theme,
  Typography,
} from "antd";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import MenuOutlined from "@ant-design/icons/MenuOutlined";
import MoonOutlined from "@ant-design/icons/MoonOutlined";
import SunOutlined from "@ant-design/icons/SunOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { useKeycloak } from "@react-keycloak/web";
import { useNavigate } from "@tanstack/react-router";
import { Header } from "antd/es/layout/layout";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useTheme } from "../theme/ThemeContext";
import { getUserDisplayName } from "../utils/userDisplayName";
import WorkspaceSelector from "./WorkspaceSelector";

const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function NavHeader() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const { token } = theme.useToken();
  const { isDark, toggleTheme } = useTheme();
  const { data: currentUser } = useCurrentUser();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const displayName = currentUser ? getUserDisplayName(currentUser) : null;
  const email = currentUser?.email;

  const dropdownItems: MenuProps["items"] = [
    {
      key: "theme",
      label: isDark ? "Modo claro" : "Modo oscuro",
      icon: isDark ? <SunOutlined /> : <MoonOutlined />,
      onClick: toggleTheme,
    },
    { type: "divider" as const },
    {
      key: "logout",
      label: "Cerrar sesión",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => keycloak.logout(),
    },
  ];

  const ThemeToggle = (
    <Segmented
      value={isDark ? "dark" : "light"}
      onChange={(v) => {
        if (v !== (isDark ? "dark" : "light")) toggleTheme();
      }}
      shape="round"
      options={[
        { label: <SunOutlined />, value: "light" },
        { label: <MoonOutlined />, value: "dark" },
      ]}
    />
  );

  const UserAvatar = (
    <Dropdown
      menu={{ items: dropdownItems }}
      placement="bottomRight"
      styles={{ root: { marginTop: 8 } }}
      trigger={["click"]}
    >
      <Flex align="center" gap={10} style={{ cursor: "pointer" }}>
        {!isMobile && (
          <Text style={{ fontSize: 12, fontWeight: 500 }}>{displayName || email}</Text>
        )}
        <Avatar
          size={36}
          icon={<UserOutlined />}
          style={{ backgroundColor: token.colorPrimary, flexShrink: 0 }}
        />
      </Flex>
    </Dropdown>
  );

  return (
    <>
      <Header
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          zIndex: 100,
          background: token.colorBgContainer,
          padding: "0 16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}
      >
        {isMobile ? (
          <>
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20 }} />}
              onClick={() => setDrawerOpen(true)}
            />
            <button
              onClick={() => navigate({ to: "/" })}
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                borderRadius: token.borderRadiusSM,
              }}
            >
              <img src="/logo.png" alt="Logo" style={{ height: 36, width: 36, borderRadius: 8 }} />
            </button>
            <Flex align="center" gap={4}>
              {UserAvatar}
            </Flex>
          </>
        ) : (
          <>
            <Flex style={{ flex: 1 }} align="center" gap={12}>
              <img src="/logo.png" alt="Logo" style={{ height: 44, width: 44, borderRadius: 10 }} />
              <WorkspaceSelector />
            </Flex>
            <Flex style={{ flex: 1 }} justify="flex-end" align="center">
              {UserAvatar}
            </Flex>
          </>
        )}
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <Flex vertical>
            <Text strong>{displayName || email}</Text>
            {displayName && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {email}
              </Text>
            )}
          </Flex>
        }
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size={240}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ paddingTop: 8 }}>
          <WorkspaceSelector compact />
        </div>
        <div style={{ padding: "16px 16px 0" }}>
          <Flex gap={8} style={{ marginBottom: 16 }}>
            {ThemeToggle}
            <Text type="secondary" style={{ lineHeight: "32px", fontSize: 13 }}>
              {isDark ? "Modo oscuro" : "Modo claro"}
            </Text>
          </Flex>
          <Button
            block
            danger
            icon={<LogoutOutlined />}
            onClick={() => {
              setDrawerOpen(false);
              keycloak.logout();
            }}
          >
            Cerrar sesión
          </Button>
        </div>
      </Drawer>
    </>
  );
}
