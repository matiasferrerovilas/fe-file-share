/**
 * Lista curada de iconos disponibles de Ant Design para categorías.
 * Cada icono tiene un nombre, keywords para búsqueda, y color sugerido.
 */
export interface AvailableIcon {
  name: string;
  keywords: string[];
  suggestedColor: string;
}

export const AVAILABLE_ICONS: AvailableIcon[] = [
  // Hogar y vida diaria
  { name: "HomeOutlined", keywords: ["casa", "hogar", "home", "vivienda"], suggestedColor: "#faad14" },
  { name: "BulbOutlined", keywords: ["luz", "electricidad", "bombilla", "energia"], suggestedColor: "#fadb14" },
  { name: "FireOutlined", keywords: ["fuego", "gas", "calefaccion"], suggestedColor: "#fa541c" },
  { name: "ThunderboltOutlined", keywords: ["electricidad", "energia", "luz", "rayo"], suggestedColor: "#faad14" },
  { name: "ToolOutlined", keywords: ["herramienta", "reparacion", "servicio", "mantenimiento"], suggestedColor: "#1890ff" },
  { name: "ScissorOutlined", keywords: ["cortar", "peluqueria", "salon"], suggestedColor: "#eb2f96" },
  { name: "DashboardOutlined", keywords: ["panel", "tablero", "control"], suggestedColor: "#2f54eb" },

  // Alimentación
  { name: "ShoppingCartOutlined", keywords: ["supermercado", "compras", "mercado", "alimentos"], suggestedColor: "#52c41a" },
  { name: "CoffeeOutlined", keywords: ["cafe", "restaurante", "bebida", "comida"], suggestedColor: "#fa541c" },
  { name: "ShopOutlined", keywords: ["tienda", "comercio", "negocio"], suggestedColor: "#13c2c2" },
  { name: "GiftOutlined", keywords: ["regalo", "presente", "sorpresa"], suggestedColor: "#eb2f96" },
  { name: "AppleOutlined", keywords: ["manzana", "fruta", "saludable", "comida"], suggestedColor: "#52c41a" },

  // Transporte
  { name: "CarOutlined", keywords: ["auto", "coche", "vehiculo", "transporte"], suggestedColor: "#9254de" },
  { name: "RocketOutlined", keywords: ["cohete", "viaje", "rapido", "avion"], suggestedColor: "#fa8c16" },
  { name: "EnvironmentOutlined", keywords: ["ubicacion", "lugar", "mapa", "direccion"], suggestedColor: "#1890ff" },
  { name: "CompassOutlined", keywords: ["brujula", "navegacion", "direccion", "viaje"], suggestedColor: "#13c2c2" },

  // Entretenimiento
  { name: "VideoCameraOutlined", keywords: ["video", "streaming", "pelicula", "netflix"], suggestedColor: "#13c2c2" },
  { name: "PlayCircleOutlined", keywords: ["reproducir", "video", "multimedia"], suggestedColor: "#722ed1" },
  { name: "CustomerServiceOutlined", keywords: ["auriculares", "musica", "audio", "servicio"], suggestedColor: "#2f54eb" },
  { name: "SoundOutlined", keywords: ["sonido", "musica", "audio"], suggestedColor: "#722ed1" },
  { name: "TrophyOutlined", keywords: ["trofeo", "premio", "logro", "deporte"], suggestedColor: "#faad14" },
  { name: "CrownOutlined", keywords: ["corona", "premium", "vip", "especial"], suggestedColor: "#faad14" },

  // Tecnología
  { name: "LaptopOutlined", keywords: ["computadora", "laptop", "pc", "tecnologia"], suggestedColor: "#2f54eb" },
  { name: "MobileOutlined", keywords: ["celular", "telefono", "movil"], suggestedColor: "#1890ff" },
  { name: "TabletOutlined", keywords: ["tablet", "dispositivo"], suggestedColor: "#13c2c2" },
  { name: "WifiOutlined", keywords: ["wifi", "internet", "conexion"], suggestedColor: "#1890ff" },
  { name: "CloudOutlined", keywords: ["nube", "almacenamiento", "cloud"], suggestedColor: "#13c2c2" },
  { name: "GlobalOutlined", keywords: ["global", "mundo", "internet", "web"], suggestedColor: "#2f54eb" },
  { name: "ApiOutlined", keywords: ["api", "conexion", "integracion"], suggestedColor: "#722ed1" },

  // Ropa y accesorios
  { name: "SkinOutlined", keywords: ["ropa", "vestimenta", "moda"], suggestedColor: "#722ed1" },
  { name: "ShoppingOutlined", keywords: ["compras", "shopping", "bolsa"], suggestedColor: "#eb2f96" },
  { name: "HeartOutlined", keywords: ["corazon", "favorito", "me gusta"], suggestedColor: "#f5222d" },
  { name: "StarOutlined", keywords: ["estrella", "favorito", "destacado"], suggestedColor: "#faad14" },

  // Salud y bienestar
  { name: "MedicineBoxOutlined", keywords: ["medicina", "salud", "farmacia", "hospital"], suggestedColor: "#f5222d" },
  { name: "ExperimentOutlined", keywords: ["laboratorio", "ciencia", "analisis"], suggestedColor: "#13c2c2" },
  { name: "EyeOutlined", keywords: ["ojo", "ver", "vision", "optica"], suggestedColor: "#1890ff" },
  { name: "SmileOutlined", keywords: ["sonrisa", "feliz", "emoji"], suggestedColor: "#faad14" },

  // Educación y trabajo
  { name: "BookOutlined", keywords: ["libro", "educacion", "estudio", "lectura"], suggestedColor: "#2f54eb" },
  { name: "ReadOutlined", keywords: ["leer", "libro", "educacion"], suggestedColor: "#722ed1" },
  { name: "BankOutlined", keywords: ["banco", "dinero", "finanzas"], suggestedColor: "#1890ff" },
  { name: "IdcardOutlined", keywords: ["identificacion", "tarjeta", "id"], suggestedColor: "#13c2c2" },
  { name: "SafetyOutlined", keywords: ["seguridad", "proteccion", "seguro"], suggestedColor: "#52c41a" },
  { name: "FundOutlined", keywords: ["finanzas", "inversion", "crecimiento"], suggestedColor: "#52c41a" },

  // Comunicación y redes sociales
  { name: "MessageOutlined", keywords: ["mensaje", "chat", "comunicacion"], suggestedColor: "#1890ff" },
  { name: "MailOutlined", keywords: ["correo", "email", "mail"], suggestedColor: "#13c2c2" },
  { name: "PhoneOutlined", keywords: ["telefono", "llamada", "contacto"], suggestedColor: "#52c41a" },
  { name: "WechatOutlined", keywords: ["wechat", "chat", "mensajeria"], suggestedColor: "#52c41a" },
  { name: "WhatsAppOutlined", keywords: ["whatsapp", "chat", "mensajeria"], suggestedColor: "#52c41a" },

  // Otros
  { name: "CalendarOutlined", keywords: ["calendario", "fecha", "agenda"], suggestedColor: "#fa8c16" },
  { name: "ClockCircleOutlined", keywords: ["reloj", "tiempo", "hora"], suggestedColor: "#1890ff" },
  { name: "FieldTimeOutlined", keywords: ["tiempo", "reloj", "cronometro", "viaje"], suggestedColor: "#fa8c16" },
  { name: "SettingOutlined", keywords: ["configuracion", "ajustes", "opciones"], suggestedColor: "#8c8c8c" },
  { name: "FileTextOutlined", keywords: ["archivo", "documento", "texto"], suggestedColor: "#1890ff" },
  { name: "FolderOutlined", keywords: ["carpeta", "archivos", "documentos"], suggestedColor: "#faad14" },
  { name: "PictureOutlined", keywords: ["imagen", "foto", "galeria"], suggestedColor: "#eb2f96" },
  { name: "CameraOutlined", keywords: ["camara", "foto", "fotografia"], suggestedColor: "#722ed1" },
  { name: "PrinterOutlined", keywords: ["impresora", "imprimir", "papel"], suggestedColor: "#8c8c8c" },
  { name: "TagOutlined", keywords: ["etiqueta", "tag", "categoria"], suggestedColor: "#722ed1" },
  { name: "TagsOutlined", keywords: ["etiquetas", "tags", "categorias"], suggestedColor: "#9254de" },
  { name: "PushpinOutlined", keywords: ["chincheta", "fijado", "pin"], suggestedColor: "#f5222d" },
  { name: "DollarOutlined", keywords: ["dolar", "dinero", "moneda"], suggestedColor: "#52c41a" },
  { name: "EuroOutlined", keywords: ["euro", "dinero", "moneda"], suggestedColor: "#1890ff" },
  { name: "PoundOutlined", keywords: ["libra", "dinero", "moneda"], suggestedColor: "#722ed1" },
  { name: "CreditCardOutlined", keywords: ["tarjeta", "credito", "pago"], suggestedColor: "#1890ff" },
  { name: "WalletOutlined", keywords: ["billetera", "dinero", "cartera"], suggestedColor: "#faad14" },
  { name: "KeyOutlined", keywords: ["llave", "clave", "seguridad"], suggestedColor: "#faad14" },
  { name: "LockOutlined", keywords: ["candado", "seguridad", "bloqueado"], suggestedColor: "#f5222d" },
  { name: "UnlockOutlined", keywords: ["desbloquear", "abierto"], suggestedColor: "#52c41a" },
  { name: "BellOutlined", keywords: ["campana", "notificacion", "alerta"], suggestedColor: "#fa8c16" },
  { name: "FlagOutlined", keywords: ["bandera", "marca", "destacado"], suggestedColor: "#f5222d" },
  { name: "WarningOutlined", keywords: ["advertencia", "alerta", "cuidado"], suggestedColor: "#faad14" },
  { name: "QuestionOutlined", keywords: ["pregunta", "ayuda", "desconocido", "sin categoria"], suggestedColor: "#d9d9d9" },
];

/**
 * Busca iconos que coincidan con un término de búsqueda.
 * @param searchTerm Término de búsqueda (case-insensitive)
 * @returns Array de iconos que coinciden con el término
 */
export const searchIcons = (searchTerm: string): AvailableIcon[] => {
  if (!searchTerm.trim()) {
    return AVAILABLE_ICONS;
  }

  const term = searchTerm.toLowerCase().trim();
  return AVAILABLE_ICONS.filter(
    (icon) =>
      icon.name.toLowerCase().includes(term) ||
      icon.keywords.some((keyword) => keyword.includes(term)),
  );
};

/**
 * Obtiene un ícono por su nombre exacto.
 * @param iconName Nombre del ícono (ej: "HomeOutlined")
 * @returns El ícono si existe, undefined si no
 */
export const getIconByName = (iconName: string): AvailableIcon | undefined => {
  return AVAILABLE_ICONS.find((icon) => icon.name === iconName);
};
