import type { TFunction } from "i18next";

export interface HelpSection {
  key: string;
  title: string;
  icon: string; // Nombre del icono de Ant Design
  content: HelpParagraph[];
}

export interface HelpParagraph {
  type: "text" | "list" | "tip";
  content: string | string[];
}

/**
 * Arma la lista de secciones de ayuda a partir de las traducciones — se llama con el `t`
 * del componente en vez de mantener el contenido hardcodeado, así el Centro de Ayuda
 * respeta el idioma elegido igual que el resto de la app.
 */
export function getHelpSections(t: TFunction): HelpSection[] {
  return [
    {
      key: "workspace",
      title: t("help.sections.workspace.title"),
      icon: "TeamOutlined",
      content: [
        { type: "text", content: t("help.sections.workspace.text") },
        { type: "list", content: t("help.sections.workspace.list", { returnObjects: true }) as string[] },
        { type: "tip", content: t("help.sections.workspace.tip") },
      ],
    },
    {
      key: "navigation",
      title: t("help.sections.navigation.title"),
      icon: "FolderOutlined",
      content: [
        { type: "text", content: t("help.sections.navigation.text") },
        { type: "list", content: t("help.sections.navigation.list", { returnObjects: true }) as string[] },
        { type: "tip", content: t("help.sections.navigation.tip") },
      ],
    },
    {
      key: "upload",
      title: t("help.sections.upload.title"),
      icon: "UploadOutlined",
      content: [
        { type: "text", content: t("help.sections.upload.text") },
        { type: "list", content: t("help.sections.upload.list1", { returnObjects: true }) as string[] },
        { type: "list", content: t("help.sections.upload.list2", { returnObjects: true }) as string[] },
        { type: "tip", content: t("help.sections.upload.tipMedia") },
        { type: "tip", content: t("help.sections.upload.tip") },
      ],
    },
    {
      key: "organize",
      title: t("help.sections.organize.title"),
      icon: "FolderAddOutlined",
      content: [
        { type: "list", content: t("help.sections.organize.list", { returnObjects: true }) as string[] },
        { type: "tip", content: t("help.sections.organize.tip") },
      ],
    },
    {
      key: "selection",
      title: t("help.sections.selection.title"),
      icon: "CheckSquareOutlined",
      content: [
        { type: "text", content: t("help.sections.selection.text") },
        { type: "list", content: t("help.sections.selection.list", { returnObjects: true }) as string[] },
        { type: "tip", content: t("help.sections.selection.tip") },
      ],
    },
    {
      key: "share",
      title: t("help.sections.share.title"),
      icon: "ShareAltOutlined",
      content: [
        { type: "text", content: t("help.sections.share.text") },
        { type: "list", content: t("help.sections.share.list", { returnObjects: true }) as string[] },
        { type: "tip", content: t("help.sections.share.tip") },
      ],
    },
    {
      key: "favorites",
      title: t("help.sections.favorites.title"),
      icon: "StarOutlined",
      content: [
        { type: "text", content: t("help.sections.favorites.text") },
        { type: "list", content: t("help.sections.favorites.list", { returnObjects: true }) as string[] },
        { type: "tip", content: t("help.sections.favorites.tip") },
      ],
    },
    {
      key: "recent",
      title: t("help.sections.recent.title"),
      icon: "HistoryOutlined",
      content: [
        { type: "text", content: t("help.sections.recent.text") },
        { type: "list", content: t("help.sections.recent.list", { returnObjects: true }) as string[] },
      ],
    },
    {
      key: "trash",
      title: t("help.sections.trash.title"),
      icon: "DeleteOutlined",
      content: [
        { type: "text", content: t("help.sections.trash.text") },
        { type: "list", content: t("help.sections.trash.list", { returnObjects: true }) as string[] },
        { type: "tip", content: t("help.sections.trash.tip") },
      ],
    },
  ];
}
