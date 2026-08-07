import React, { useMemo } from "react";
import { Col, Collapse, Flex, Row, theme, Typography } from "antd";
import CheckSquareOutlined from "@ant-design/icons/CheckSquareOutlined";
import FolderAddOutlined from "@ant-design/icons/FolderAddOutlined";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import QuestionCircleOutlined from "@ant-design/icons/QuestionCircleOutlined";
import ShareAltOutlined from "@ant-design/icons/ShareAltOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import UploadOutlined from "@ant-design/icons/UploadOutlined";
import { HELP_SECTIONS, type HelpParagraph, type HelpSection } from "./helpContent";

const { Title, Text, Paragraph } = Typography;

const ICON_MAP: Record<string, React.ReactNode> = {
  TeamOutlined: <TeamOutlined />,
  FolderOutlined: <FolderOutlined />,
  UploadOutlined: <UploadOutlined />,
  FolderAddOutlined: <FolderAddOutlined />,
  CheckSquareOutlined: <CheckSquareOutlined />,
  ShareAltOutlined: <ShareAltOutlined />,
};

function HelpParagraphRenderer({ paragraph }: { paragraph: HelpParagraph }) {
  const { token } = theme.useToken();

  if (paragraph.type === "text") {
    return (
      <Paragraph style={{ marginBottom: 16, color: token.colorText }}>
        {paragraph.content as string}
      </Paragraph>
    );
  }

  if (paragraph.type === "list") {
    return (
      <ul
        style={{
          marginBottom: 16,
          paddingLeft: 20,
          color: token.colorText,
        }}
      >
        {(paragraph.content as string[]).map((item, idx) => (
          <li key={idx} style={{ marginBottom: 6 }}>
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (paragraph.type === "tip") {
    return (
      <div
        style={{
          padding: "12px 16px",
          borderRadius: 8,
          background: token.colorPrimaryBg,
          borderLeft: `3px solid ${token.colorPrimary}`,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: token.colorPrimary, fontWeight: 500 }}>Tip: </Text>
        <Text style={{ color: token.colorText }}>{paragraph.content as string}</Text>
      </div>
    );
  }

  return null;
}

function HelpSectionContent({ section }: { section: HelpSection }) {
  return (
    <div>
      {section.content.map((paragraph, idx) => (
        <HelpParagraphRenderer key={idx} paragraph={paragraph} />
      ))}
    </div>
  );
}

export function HelpPage() {
  const { token } = theme.useToken();

  const collapseItems = useMemo(
    () =>
      HELP_SECTIONS.map((section) => ({
        key: section.key,
        label: (
          <Flex align="center" gap={10}>
            <span
              style={{
                fontSize: 18,
                color: token.colorPrimary,
                display: "flex",
                alignItems: "center",
              }}
            >
              {ICON_MAP[section.icon] ?? <QuestionCircleOutlined />}
            </span>
            <Text strong style={{ fontSize: 15 }}>
              {section.title}
            </Text>
          </Flex>
        ),
        children: <HelpSectionContent section={section} />,
      })),
    [token.colorPrimary],
  );

  return (
    <Row justify="center" style={{ paddingTop: 30 }}>
      <Col
        xs={24}
        sm={22}
        md={18}
        lg={14}
        xl={12}
        className="fade-in-up"
        style={{ animationDelay: "0ms" }}
      >
        <Flex align="center" gap={12} style={{ marginBottom: 24, paddingInline: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 12px ${token.colorPrimaryBorder}`,
            }}
          >
            <QuestionCircleOutlined style={{ color: "#fff", fontSize: 24 }} />
          </div>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Centro de Ayuda
            </Title>
            <Text type="secondary">Aprendé a usar todas las funciones de FileShare</Text>
          </div>
        </Flex>

        <Collapse
          accordion
          defaultActiveKey={["workspace"]}
          expandIconPosition="end"
          style={{
            background: token.colorBgContainer,
            borderRadius: 12,
            border: `1px solid ${token.colorBorderSecondary}`,
            marginInline: 16,
          }}
          items={collapseItems}
        />

        <Flex
          justify="center"
          style={{
            marginTop: 32,
            paddingBottom: 32,
          }}
        >
          <Text type="secondary" style={{ fontSize: 13 }}>
            Esta es tu instancia personal de FileShare
          </Text>
        </Flex>
      </Col>
    </Row>
  );
}
