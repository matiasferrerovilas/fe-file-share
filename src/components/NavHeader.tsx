import { Avatar, Dropdown, Flex, type MenuProps, theme, Typography } from "antd";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import MoonOutlined from "@ant-design/icons/MoonOutlined";
import SunOutlined from "@ant-design/icons/SunOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { useKeycloak } from "@react-keycloak/web";
import { Header } from "antd/es/layout/layout";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useTheme } from "../theme/ThemeContext";
import { getUserDisplayName } from "../utils/userDisplayName";
import WorkspaceSelector from "./WorkspaceSelector";

const { Text } = Typography;

export default function NavHeader() {
  const { keycloak } = useKeycloak();
  const { token } = theme.useToken();
  const { isDark, toggleTheme } = useTheme();
  const { data: currentUser } = useCurrentUser();

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

  return (
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
      <Flex align="center" gap={12}>
        <img src="/logo.png" alt="Logo" style={{ height: 44, width: 44, borderRadius: 10 }} />
        <WorkspaceSelector />
      </Flex>
      <Dropdown
        menu={{ items: dropdownItems }}
        placement="bottomRight"
        styles={{ root: { marginTop: 8 } }}
        trigger={["click"]}
      >
        <Flex align="center" gap={10} style={{ cursor: "pointer" }}>
          <Flex vertical align="flex-end">
            <Text style={{ fontSize: 12, fontWeight: 500 }}>{displayName || email}</Text>
          </Flex>
          <Avatar
            size={36}
            icon={<UserOutlined />}
            style={{ backgroundColor: token.colorPrimary, flexShrink: 0 }}
          />
        </Flex>
      </Dropdown>
    </Header>
  );
}
