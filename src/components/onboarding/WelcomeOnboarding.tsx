import PlusOutlined from "@ant-design/icons/PlusOutlined";
import {
  App as AntdApp,
  Button,
  Row,
  Col,
  Space,
  Typography,
  Upload,
  type UploadFile,
  type UploadProps,
} from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { OnboardingForm } from "../../api/onboarding/onboardinApi";
import { getUploadRejectionReason } from "../../utils/uploadValidation";

const { Text } = Typography;

interface Props {
  initialValues: Partial<OnboardingForm>;
  onFinish: (values: Pick<OnboardingForm, "filesToAdd">) => void;
  onPrev: () => void;
  isLoading?: boolean;
}

export default function WelcomeOnboarding({ onFinish, onPrev, isLoading }: Props) {
  const { t } = useTranslation();
  const { message } = AntdApp.useApp();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const uploadProps: UploadProps = {
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      const reason = getUploadRejectionReason(file, t);
      if (reason) {
        message.error(reason);
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onChange: ({ fileList: newFileList }) => setFileList(newFileList),
  };

  const handleFinish = () => {
    const files: File[] = [];
    for (const file of fileList) {
      if (file.originFileObj) files.push(file.originFileObj);
    }
    onFinish({ filesToAdd: files });
  };

  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text type="secondary" style={{ display: "block" }}>
          {t("onboarding.welcomeStep.intro1")}
        </Text>
        <Text type="secondary" style={{ display: "block" }}>
          {t("onboarding.welcomeStep.intro2")}
        </Text>
      </div>

      <Upload {...uploadProps}>
        <Button icon={<PlusOutlined />}>{t("onboarding.welcomeStep.selectFiles")}</Button>
      </Upload>

      <Row gutter={[16, 10]} style={{ marginTop: 20 }}>
        <Col xs={12}>
          <Button block type="default" onClick={onPrev} disabled={isLoading}>
            {t("onboarding.welcomeStep.back")}
          </Button>
        </Col>
        <Col xs={12}>
          <Button
            block
            color="geekblue"
            variant="filled"
            loading={isLoading}
            onClick={handleFinish}
          >
            {t("onboarding.welcomeStep.finish")}
          </Button>
        </Col>
      </Row>
    </Space>
  );
}
