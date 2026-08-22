import { useState, type DragEvent } from "react";
import axios from "axios";
import { App as AntdApp, type MenuProps } from "antd";
import { useTranslation } from "react-i18next";
import BgColorsOutlined from "@ant-design/icons/BgColorsOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import DownloadOutlined from "@ant-design/icons/DownloadOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import HistoryOutlined from "@ant-design/icons/HistoryOutlined";
import ShareAltOutlined from "@ant-design/icons/ShareAltOutlined";
import UsergroupAddOutlined from "@ant-design/icons/UsergroupAddOutlined";
import { useNavigate } from "@tanstack/react-router";
import { FileSystemNodeType, type FileSystemNode } from "../models/FileSystemNode";
import { useDeleteFolder } from "./useDeleteFolder";
import { useDownloadFile } from "./useDownloadFile";
import { useMoveNode, MOVE_NODE_DATA_TYPE } from "./useMoveNode";
import { useUserRoles } from "./useUserRoles";
import { useShareFile } from "./useShareFile";
import { useRevokeShare } from "./useRevokeShare";
import { useToggleFavorite } from "./useFavorites";
import { SharePermission } from "../models/FileShare";
import { isPreviewableContentType } from "../utils/filePreview";
import { getFileTypeIcon } from "../utils/getFileTypeIcon";

// "api-movements", con "s" — tiene que coincidir exacto con el nombre real de la app (así se
// llama en Keycloak/AppFileShare), si no el share nunca matchea del lado de api-keep.
const SHARE_TARGETS = [{ key: "api-movements", label: "api-movements" }];

/**
 * Shared behavior behind both the grid card (FolderContentCard) and the list row
 * (FolderContentRow) so context-menu actions, drag&drop and delete/rename/preview stay in sync
 * between the two view modes instead of drifting apart.
 */
export function useFolderContentActions(node: FileSystemNode) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { message, modal } = AntdApp.useApp();
  const { isAdmin } = useUserRoles();
  const deleteMutation = useDeleteFolder();
  const downloadMutation = useDownloadFile();
  const shareMutation = useShareFile();
  const revokeShareMutation = useRevokeShare();
  const toggleFavoriteMutation = useToggleFavorite();
  const { moveIfValid } = useMoveNode();
  const [renaming, setRenaming] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [sharingWithPerson, setSharingWithPerson] = useState(false);
  const [viewingActivity, setViewingActivity] = useState(false);
  const [dragDepth, setDragDepth] = useState(0);

  const isFolder = node.metadata.type === FileSystemNodeType.FOLDER;
  const previewable = !isFolder && isPreviewableContentType(node.name, node.metadata.contentType);
  const fileTypeIcon = getFileTypeIcon(node.metadata.contentType);
  const isFavorite = node.metadata.favorite;

  const handleToggleFavorite = (domEvent: { stopPropagation: () => void }) => {
    domEvent.stopPropagation();
    toggleFavoriteMutation.mutate(
      { nodeId: node.id, favorite: !isFavorite },
      {
        onError: () => message.error(t("files.favoriteToggleFailed", { name: node.name })),
      },
    );
  };

  const handleDelete = () => {
    modal.confirm({
      title: t("files.deleteConfirmTitle", { name: node.name }),
      content: isFolder ? t("files.deleteConfirmFolderContent") : t("files.deleteConfirmFileContent"),
      okText: t("files.delete"),
      okButtonProps: { danger: true },
      cancelText: t("files.cancel"),
      onOk: () =>
        deleteMutation.mutateAsync(node.id).catch(() => {
          message.error(t("files.deleteFailed", { name: node.name }));
        }),
    });
  };

  const menuItems: MenuProps["items"] = [
    ...(previewable ? [{ key: "preview", label: t("files.preview"), icon: <EyeOutlined /> }] : []),
    { key: "download", label: t("files.download"), icon: <DownloadOutlined /> },
    { key: "rename", label: t("files.rename"), icon: <EditOutlined /> },
    { key: "activity", label: t("files.activity.menuLabel"), icon: <HistoryOutlined /> },
    ...(isFolder ? [{ key: "customize", label: t("files.customize"), icon: <BgColorsOutlined /> }] : []),
    ...(isAdmin
      ? [
          {
            key: "share",
            label: t("files.shareWith"),
            icon: <ShareAltOutlined />,
            children: SHARE_TARGETS.map((target) => {
              const isShared = node.shareWith?.includes(target.key) ?? false;
              return isShared
                ? { key: `unshare:${target.key}`, label: t("files.unshareWith", { apiName: target.label }) }
                : { key: `share:${target.key}`, label: target.label };
            }),
          },
          {
            key: "share-with-person",
            label: t("files.shareWithPerson.menuLabel"),
            icon: <UsergroupAddOutlined />,
          },
        ]
      : []),
    { key: "delete", label: t("files.delete"), icon: <DeleteOutlined />, danger: true },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key, domEvent }) => {
    domEvent.stopPropagation();
    if (key === "preview") setPreviewing(true);
    if (key === "download") {
      downloadMutation.mutate(node.id, {
        onError: () => message.error(t("files.downloadFailed", { name: node.name })),
      });
    }
    if (key === "rename") setRenaming(true);
    if (key === "activity") setViewingActivity(true);
    if (key === "customize") setCustomizing(true);
    if (key === "share-with-person") setSharingWithPerson(true);
    if (key === "delete") handleDelete();
    if (key.startsWith("unshare:")) {
      const apiName = key.slice("unshare:".length);
      revokeShareMutation.mutate(
        { fileId: node.id, apiName },
        {
          onSuccess: () => message.success(t("files.unsharedSuccess", { name: node.name, apiName })),
          onError: () => message.error(t("files.unsharedFailed", { name: node.name, apiName })),
        },
      );
    } else if (key.startsWith("share:")) {
      const apiName = key.slice("share:".length);
      shareMutation.mutate(
        { fileId: node.id, apiName, permission: SharePermission.READ_WRITE },
        {
          onSuccess: () => message.success(t("files.sharedSuccess", { name: node.name, apiName })),
          onError: (error) => {
            const alreadyShared = axios.isAxiosError(error) && error.response?.status === 409;
            message.error(
              t(alreadyShared ? "files.sharedAlready" : "files.sharedFailed", { name: node.name, apiName }),
            );
          },
        },
      );
    }
  };

  const handleActivate = () => {
    if (isFolder) {
      navigate({ to: "/files/$folderId", params: { folderId: node.id } });
    } else if (previewable) {
      setPreviewing(true);
    }
  };

  const dragHandlers = {
    onDragStart: (e: DragEvent) => {
      e.dataTransfer.setData(MOVE_NODE_DATA_TYPE, node.id);
      e.dataTransfer.effectAllowed = "move";
    },
    onDragEnter: (e: DragEvent) => {
      if (!isFolder) return;
      e.preventDefault();
      setDragDepth((d) => d + 1);
    },
    onDragOver: (e: DragEvent) => {
      if (!isFolder) return;
      e.preventDefault();
    },
    onDragLeave: (e: DragEvent) => {
      if (!isFolder) return;
      e.preventDefault();
      setDragDepth((d) => Math.max(0, d - 1));
    },
    onDrop: (e: DragEvent) => {
      if (!isFolder) return;
      e.preventDefault();
      setDragDepth(0);
      const draggedId = e.dataTransfer.getData(MOVE_NODE_DATA_TYPE);
      moveIfValid(draggedId, node.id);
    },
  };

  return {
    isFolder,
    previewable,
    fileTypeIcon,
    menuItems,
    handleMenuClick,
    handleActivate,
    dragDepth,
    dragHandlers,
    renaming,
    setRenaming,
    previewing,
    setPreviewing,
    customizing,
    setCustomizing,
    sharingWithPerson,
    setSharingWithPerson,
    viewingActivity,
    setViewingActivity,
    isFavorite,
    handleToggleFavorite,
  };
}
