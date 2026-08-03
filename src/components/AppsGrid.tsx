import { Flex, Typography, theme } from "antd";

const { Text } = Typography;

interface ExternalApp {
  key: string;
  name: string;
  icon: string;
  url: string;
}

const EXTERNAL_APPS: ExternalApp[] = [
  { key: "movements", name: "Movements", icon: "/apis/logo_movments.png", url: "https://movement.eva-core.com" },
];

export function AppsGrid() {
  const { token } = theme.useToken();

  if (EXTERNAL_APPS.length === 0) return null;

  return (
    <Flex gap={8} wrap style={{ maxWidth: 168 }}>
      {EXTERNAL_APPS.map((app) => (
        <a
          key={app.key}
          href={app.url}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            width: 72,
            padding: 8,
            borderRadius: token.borderRadiusLG,
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
          <img src={app.icon} alt={app.name} style={{ width: 36, height: 36, borderRadius: 8 }} />
          <Text style={{ fontSize: 11 }}>{app.name}</Text>
        </a>
      ))}
    </Flex>
  );
}
