import type React from "react";

// Importar solo los iconos que usamos en AVAILABLE_ICONS
// Esto evita importar los 800+ iconos de @ant-design/icons
import {
  // Hogar y vida diaria
  HomeOutlined,
  BulbOutlined,
  FireOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  ScissorOutlined,
  DashboardOutlined,
  // Alimentación
  ShoppingCartOutlined,
  CoffeeOutlined,
  ShopOutlined,
  GiftOutlined,
  AppleOutlined,
  // Transporte
  CarOutlined,
  RocketOutlined,
  EnvironmentOutlined,
  CompassOutlined,
  // Entretenimiento
  VideoCameraOutlined,
  PlayCircleOutlined,
  CustomerServiceOutlined,
  SoundOutlined,
  TrophyOutlined,
  CrownOutlined,
  // Tecnología
  LaptopOutlined,
  MobileOutlined,
  TabletOutlined,
  WifiOutlined,
  CloudOutlined,
  GlobalOutlined,
  ApiOutlined,
  // Ropa y accesorios
  SkinOutlined,
  ShoppingOutlined,
  HeartOutlined,
  StarOutlined,
  // Salud y bienestar
  MedicineBoxOutlined,
  ExperimentOutlined,
  EyeOutlined,
  SmileOutlined,
  // Educación y trabajo
  BookOutlined,
  ReadOutlined,
  BankOutlined,
  IdcardOutlined,
  SafetyOutlined,
  FundOutlined,
  // Comunicación y redes sociales
  MessageOutlined,
  MailOutlined,
  PhoneOutlined,
  WechatOutlined,
  WhatsAppOutlined,
  // Otros
  CalendarOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  SettingOutlined,
  FileTextOutlined,
  FolderOutlined,
  PictureOutlined,
  CameraOutlined,
  PrinterOutlined,
  TagOutlined,
  TagsOutlined,
  PushpinOutlined,
  DollarOutlined,
  EuroOutlined,
  PoundOutlined,
  CreditCardOutlined,
  WalletOutlined,
  KeyOutlined,
  LockOutlined,
  UnlockOutlined,
  BellOutlined,
  FlagOutlined,
  WarningOutlined,
  QuestionOutlined,
  // Iconos adicionales usados en la app pero no en AVAILABLE_ICONS
  QuestionCircleOutlined,
  TeamOutlined,
  UserAddOutlined,
  PieChartOutlined,
} from "@ant-design/icons";

type IconComponent = React.ComponentType<{ style?: React.CSSProperties }>;

/**
 * Mapa de iconos disponibles.
 * Solo incluye los iconos que realmente usamos en la aplicación.
 */
const ICON_MAP: Record<string, IconComponent> = {
  // Hogar y vida diaria
  HomeOutlined,
  BulbOutlined,
  FireOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  ScissorOutlined,
  DashboardOutlined,
  // Alimentación
  ShoppingCartOutlined,
  CoffeeOutlined,
  ShopOutlined,
  GiftOutlined,
  AppleOutlined,
  // Transporte
  CarOutlined,
  RocketOutlined,
  EnvironmentOutlined,
  CompassOutlined,
  // Entretenimiento
  VideoCameraOutlined,
  PlayCircleOutlined,
  CustomerServiceOutlined,
  SoundOutlined,
  TrophyOutlined,
  CrownOutlined,
  // Tecnología
  LaptopOutlined,
  MobileOutlined,
  TabletOutlined,
  WifiOutlined,
  CloudOutlined,
  GlobalOutlined,
  ApiOutlined,
  // Ropa y accesorios
  SkinOutlined,
  ShoppingOutlined,
  HeartOutlined,
  StarOutlined,
  // Salud y bienestar
  MedicineBoxOutlined,
  ExperimentOutlined,
  EyeOutlined,
  SmileOutlined,
  // Educación y trabajo
  BookOutlined,
  ReadOutlined,
  BankOutlined,
  IdcardOutlined,
  SafetyOutlined,
  FundOutlined,
  // Comunicación y redes sociales
  MessageOutlined,
  MailOutlined,
  PhoneOutlined,
  WechatOutlined,
  WhatsAppOutlined,
  // Otros
  CalendarOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  SettingOutlined,
  FileTextOutlined,
  FolderOutlined,
  PictureOutlined,
  CameraOutlined,
  PrinterOutlined,
  TagOutlined,
  TagsOutlined,
  PushpinOutlined,
  DollarOutlined,
  EuroOutlined,
  PoundOutlined,
  CreditCardOutlined,
  WalletOutlined,
  KeyOutlined,
  LockOutlined,
  UnlockOutlined,
  BellOutlined,
  FlagOutlined,
  WarningOutlined,
  QuestionOutlined,
  // Iconos adicionales usados en la app
  QuestionCircleOutlined,
  TeamOutlined,
  UserAddOutlined,
  PieChartOutlined,
};

/**
 * Obtiene el componente de ícono de Ant Design por su nombre.
 * Si el nombre no existe, retorna QuestionOutlined por defecto.
 *
 * @param iconName Nombre del ícono (ej: "HomeOutlined")
 * @returns Componente React del ícono
 *
 * @example
 * const IconComponent = getIconComponent("HomeOutlined");
 * return <IconComponent />;
 */
export const getIconComponent = (iconName?: string | null): IconComponent => {
  if (!iconName) {
    return QuestionOutlined;
  }

  const IconComponent = ICON_MAP[iconName];

  if (!IconComponent) {
    console.warn(
      `Ícono "${iconName}" no encontrado en el mapa de iconos. Usando QuestionOutlined por defecto.`,
    );
    return QuestionOutlined;
  }

  return IconComponent;
};
