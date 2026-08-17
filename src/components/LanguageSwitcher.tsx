import { Segmented } from "antd";
import { useTranslation } from "react-i18next";

/** ES/EN toggle, same shape as the light/dark Segmented in NavHeader. */
export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage === "en" ? "en" : "es";

  return (
    <Segmented
      value={current}
      onChange={(value) => {
        if (value !== current) void i18n.changeLanguage(value as string);
      }}
      shape="round"
      options={[
        { label: "ES", value: "es" },
        { label: "EN", value: "en" },
      ]}
    />
  );
}
