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
  const { message } = AntdApp.useApp();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const uploadProps: UploadProps = {
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      const reason = getUploadRejectionReason(file);
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
          Subí tus primeros archivos para empezar.
        </Text>
        <Text type="secondary" style={{ display: "block" }}>
          Podés agregarlos más adelante si preferís continuar sin nada.
        </Text>
      </div>

      <Upload {...uploadProps}>
        <Button icon={<PlusOutlined />}>Seleccionar archivos</Button>
      </Upload>

      <Row gutter={[16, 10]} style={{ marginTop: 20 }}>
        <Col xs={12}>
          <Button block type="default" onClick={onPrev} disabled={isLoading}>
            Volver
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
            Finalizar
          </Button>
        </Col>
      </Row>
    </Space>
  );
}
