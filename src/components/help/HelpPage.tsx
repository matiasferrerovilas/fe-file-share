import React, { useMemo } from "react";
import { Col, Collapse, Flex, Row, theme, Typography } from "antd";
import CheckSquareOutlined from "@ant-design/icons/CheckSquareOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import FolderAddOutlined from "@ant-design/icons/FolderAddOutlined";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import HistoryOutlined from "@ant-design/icons/HistoryOutlined";
import QuestionCircleOutlined from "@ant-design/icons/QuestionCircleOutlined";
import ShareAltOutlined from "@ant-design/icons/ShareAltOutlined";
import StarOutlined from "@ant-design/icons/StarOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import UploadOutlined from "@ant-design/icons/UploadOutlined";
import { useTranslation } from "react-i18next";
import { getHelpSections, type HelpParagraph, type HelpSection } from "./helpContent";

const { Title, Text, Paragraph } = Typography;

const ICON_MAP: Record<string, React.ReactNode> = {
  TeamOutlined: <TeamOutlined />,
  FolderOutlined: <FolderOutlined />,
  UploadOutlined: <UploadOutlined />,
  FolderAddOutlined: <FolderAddOutlined />,
  CheckSquareOutlined: <CheckSquareOutlined />,
  ShareAltOutlined: <ShareAltOutlined />,
  StarOutlined: <StarOutlined />,
  HistoryOutlined: <HistoryOutlined />,
  DeleteOutlined: <DeleteOutlined />,
};

function HelpParagraphRenderer({ paragraph, tipLabel }: { paragraph: HelpParagraph; tipLabel: string }) {
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
        <Text style={{ color: token.colorPrimary, fontWeight: 500 }}>{tipLabel}</Text>
        <Text style={{ color: token.colorText }}>{paragraph.content as string}</Text>
      </div>
    );
  }

  return null;
}

function HelpSectionContent({ section, tipLabel }: { section: HelpSection; tipLabel: string }) {
  return (
    <div>
      {section.content.map((paragraph, idx) => (
        <HelpParagraphRenderer key={idx} paragraph={paragraph} tipLabel={tipLabel} />
      ))}
    </div>
  );
}

export function HelpPage() {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const tipLabel = t("help.tipLabel");

  const helpSections = useMemo(() => getHelpSections(t), [t]);

  const collapseItems = useMemo(
    () =>
      helpSections.map((section) => ({
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
        children: <HelpSectionContent section={section} tipLabel={tipLabel} />,
      })),
    [helpSections, tipLabel, token.colorPrimary],
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
              {t("help.pageTitle")}
            </Title>
            <Text type="secondary">{t("help.pageSubtitle")}</Text>
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
            {t("help.footer")}
          </Text>
        </Flex>
      </Col>
    </Row>
  );
}
