import type { ReactElement } from "react";
import BookOutlined from "@ant-design/icons/BookOutlined";
import BulbOutlined from "@ant-design/icons/BulbOutlined";
import DollarOutlined from "@ant-design/icons/DollarOutlined";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import GiftOutlined from "@ant-design/icons/GiftOutlined";
import HeartOutlined from "@ant-design/icons/HeartOutlined";
import HomeOutlined from "@ant-design/icons/HomeOutlined";
import PictureOutlined from "@ant-design/icons/PictureOutlined";
import RocketOutlined from "@ant-design/icons/RocketOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";

/**
 * Fixed, closed set — not user-extensible. The backend stores whatever string it's given
 * (`FileService.setFolderCustomization` doesn't validate against a palette/icon set), so this is
 * purely a client-side concern: an unrecognized stored key/color just falls back to the default.
 */
export const FOLDER_ICON_OPTIONS: { key: string; icon: ReactElement }[] = [
  { key: "folder", icon: <FolderOutlined /> },
  { key: "picture", icon: <PictureOutlined /> },
  { key: "book", icon: <BookOutlined /> },
  { key: "team", icon: <TeamOutlined /> },
  { key: "dollar", icon: <DollarOutlined /> },
  { key: "heart", icon: <HeartOutlined /> },
  { key: "rocket", icon: <RocketOutlined /> },
  { key: "bulb", icon: <BulbOutlined /> },
  { key: "home", icon: <HomeOutlined /> },
  { key: "gift", icon: <GiftOutlined /> },
];

export const FOLDER_COLOR_OPTIONS: string[] = [
  "#2f6b4c", // green
  "#4a6fa5", // blue
  "#6e5a9e", // violet
  "#a24a42", // red
  "#9c7327", // gold
  "#2f8fa5", // cyan
  "#a54a8f", // magenta
  "#5a6472", // slate
];

export function getFolderIcon(iconKey: string | null): ReactElement {
  return FOLDER_ICON_OPTIONS.find((o) => o.key === iconKey)?.icon ?? <FolderOutlined />;
}
