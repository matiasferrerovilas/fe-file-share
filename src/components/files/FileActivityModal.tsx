import { Empty, List, Modal, Tag, Typography, theme } from "antd";
import UploadOutlined from "@ant-design/icons/UploadOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DragOutlined from "@ant-design/icons/DragOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import UndoOutlined from "@ant-design/icons/UndoOutlined";
import ShareAltOutlined from "@ant-design/icons/ShareAltOutlined";
import StopOutlined from "@ant-design/icons/StopOutlined";
import { useTranslation } from "react-i18next";
import { useFileActivity } from "../../hooks/useFileActivity";
import { FileActivityAction, type FileActivity } from "../../models/FileActivity";

const { Text } = Typography;

interface FileActivityModalProps {
  node: { id: string; name: string } | null;
  onClose: () => void;
}

const ACTIVITY_ICON: Record<FileActivityAction, React.ReactNode> = {
  [FileActivityAction.UPLOADED]: <UploadOutlined />,
  [FileActivityAction.RENAMED]: <EditOutlined />,
  [FileActivityAction.MOVED]: <DragOutlined />,
  [FileActivityAction.DELETED]: <DeleteOutlined />,
  [FileActivityAction.RESTORED]: <UndoOutlined />,
  [FileActivityAction.SHARED]: <ShareAltOutlined />,
  [FileActivityAction.UNSHARED]: <StopOutlined />,
};

function ActivityRow({ activity }: { activity: FileActivity }) {
  const { t, i18n } = useTranslation();
  const { token } = theme.useToken();
  const formattedDate = new Date(activity.createdAt).toLocaleString(i18n.language, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <List.Item>
      <List.Item.Meta
        avatar={
          <span style={{ color: token.colorPrimary, fontSize: 16 }}>{ACTIVITY_ICON[activity.action]}</span>
        }
        title={
          <span>
            {t(`files.activity.verb.${activity.action}`, { email: activity.actorEmail })}{" "}
            <Tag style={{ marginInlineStart: 4 }}>{activity.fileName}</Tag>
          </span>
        }
        description={
          <>
            {activity.detail && (
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                {activity.detail}
              </Text>
            )}
            <Text type="secondary" style={{ fontSize: 11 }}>
              {formattedDate}
            </Text>
          </>
        }
      />
    </List.Item>
  );
}

export default function FileActivityModal({ node, onClose }: FileActivityModalProps) {
  const { t } = useTranslation();
  const activityQuery = useFileActivity(node?.id ?? null);
  const activity = activityQuery.data ?? [];

  return (
    <Modal
      open={node !== null}
      onCancel={onClose}
      title={node ? t("files.activity.title", { name: node.name }) : ""}
      width={480}
      destroyOnHidden
      footer={null}
    >
      <List
        loading={activityQuery.isLoading}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("files.activity.empty")} /> }}
        dataSource={activity}
        renderItem={(item) => <ActivityRow key={item.id} activity={item} />}
      />
    </Modal>
  );
}
