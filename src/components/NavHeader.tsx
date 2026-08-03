import { useState } from "react";
import {
  Avatar,
  Button,
  Divider,
  Drawer,
  Flex,
  Grid,
  Popover,
  Segmented,
  Tag,
  theme,
  Typography,
} from "antd";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import MenuOutlined from "@ant-design/icons/MenuOutlined";
import MoonOutlined from "@ant-design/icons/MoonOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import SunOutlined from "@ant-design/icons/SunOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { useKeycloak } from "@react-keycloak/web";
import { useNavigate } from "@tanstack/react-router";
import { Header } from "antd/es/layout/layout";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useTheme } from "../theme/ThemeContext";
import { getUserDisplayName } from "../utils/userDisplayName";
import { AppsGrid } from "./AppsGrid";
import FileSearch from "./files/FileSearch";
import WorkspaceSelector from "./WorkspaceSelector";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const USER_TYPE_COLOR: Record<string, string> = {
  PERSONAL: "blue",
  ENTERPRISE: "green",
};

interface ProfileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function ProfileMenuItem({ icon, label, onClick, danger }: ProfileMenuItemProps) {
  const { token } = theme.useToken();
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 16px",
        cursor: "pointer",
        color: danger ? token.colorError : token.colorText,
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = token.colorFillTertiary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ fontSize: 15, display: "flex" }}>{icon}</span>
      <Text style={{ fontSize: 13, color: "inherit" }}>{label}</Text>
    </div>
  );
}

function ProfileTile({ icon, label, onClick }: Omit<ProfileMenuItemProps, "danger">) {
  const { token } = theme.useToken();
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        width: 72,
        padding: 8,
        borderRadius: token.borderRadiusLG,
        cursor: "pointer",
        color: token.colorText,
        textAlign: "center",
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = token.colorFillTertiary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ fontSize: 20, display: "flex" }}>{icon}</span>
      <Text style={{ fontSize: 11 }}>{label}</Text>
    </div>
  );
}

export default function NavHeader() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const { token } = theme.useToken();
  const { isDark, toggleTheme } = useTheme();
  const { data: currentUser } = useCurrentUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = currentUser ? getUserDisplayName(currentUser) : null;
  const email = currentUser?.email;

  const closeProfile = () => setProfileOpen(false);

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

  const ProfilePopoverContent = (
    <div style={{ width: 220 }}>
      <div style={{ padding: "12px 16px" }}>
        <Text strong style={{ display: "block" }}>
          {displayName || email}
        </Text>
        {currentUser?.userType && (
          <Tag
            color={USER_TYPE_COLOR[currentUser.userType] ?? "default"}
            style={{ marginTop: 4, marginInlineEnd: 0 }}
          >
            {currentUser.userType}
          </Tag>
        )}
      </div>
      <Divider style={{ margin: 0 }} />
      <Flex gap={8} style={{ padding: "8px 16px" }}>
        <ProfileTile icon={<SettingOutlined />} label="Ajustes" onClick={closeProfile} />
        <ProfileTile
          icon={isDark ? <SunOutlined /> : <MoonOutlined />}
          label={isDark ? "Modo claro" : "Modo oscuro"}
          onClick={() => {
            toggleTheme();
            closeProfile();
          }}
        />
      </Flex>
      <Divider style={{ margin: 0 }} />
      <div style={{ padding: "12px 16px" }}>
        <Text type="secondary" style={{ fontSize: 11 }}>
          Apps
        </Text>
        <div style={{ marginTop: 8 }}>
          <AppsGrid />
        </div>
      </div>
      <Divider style={{ margin: 0 }} />
      <div style={{ padding: "4px 0" }}>
        <ProfileMenuItem
          icon={<LogoutOutlined />}
          label="Cerrar sesión"
          danger
          onClick={() => {
            closeProfile();
            keycloak.logout();
          }}
        />
      </div>
    </div>
  );

  const UserAvatar = (
    <Popover
      content={ProfilePopoverContent}
      placement="bottomRight"
      trigger="click"
      open={profileOpen}
      onOpenChange={setProfileOpen}
      styles={{ root: { marginTop: 8 }, content: { padding: 0 } }}
    >
      <Avatar
        size={36}
        icon={<UserOutlined />}
        style={{ backgroundColor: token.colorPrimary, flexShrink: 0, cursor: "pointer" }}
      />
    </Popover>
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
            {UserAvatar}
          </>
        ) : (
          <>
            <Flex style={{ flex: 1 }} align="center" gap={12}>
              <img src="/logo.png" alt="Logo" style={{ height: 44, width: 44, borderRadius: 10 }} />
              <WorkspaceSelector />
            </Flex>
            <Flex style={{ flex: 1 }} align="center" gap={12}>
              <FileSearch />
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
        <div style={{ padding: "12px 16px" }}>
          <FileSearch onNavigate={() => setDrawerOpen(false)} />
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
