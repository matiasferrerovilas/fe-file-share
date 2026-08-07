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

export const HELP_SECTIONS: HelpSection[] = [
  {
    key: "workspace",
    title: "¿Qué es un Workspace?",
    icon: "TeamOutlined",
    content: [
      {
        type: "text",
        content:
          'Un Workspace es un espacio de archivos independiente, con su propia carpeta raíz. Pensalo como un "disco" separado: lo que subís en un workspace no se mezcla con lo que subís en otro.',
      },
      {
        type: "list",
        content: [
          "Cada usuario tiene un workspace por defecto al registrarse",
          "Podés crear varios workspaces para separar contextos (por ejemplo, personal y trabajo)",
          "Las carpetas y archivos de cada workspace son independientes entre sí",
        ],
      },
      {
        type: "tip",
        content:
          'Cambiá de workspace desde el selector en la barra superior, junto al logo. Para crear uno nuevo, elegí "Crear workspace" al final del listado.',
      },
    ],
  },
  {
    key: "navigation",
    title: "Navegar carpetas",
    icon: "FolderOutlined",
    content: [
      {
        type: "text",
        content:
          "El explorador de archivos muestra el árbol completo de carpetas a la izquierda y el contenido de la carpeta actual a la derecha.",
      },
      {
        type: "list",
        content: [
          'Hacé click en una carpeta del árbol lateral, o en una tarjeta de carpeta, para entrar en ella',
          "El breadcrumb en la parte superior muestra dónde estás parado y te permite volver a una carpeta anterior",
          "En mobile, el árbol de carpetas se abre con el botón \"Carpetas\"",
        ],
      },
      {
        type: "tip",
        content:
          "Usá el buscador de la barra superior para saltar directo a un archivo o carpeta por nombre, sin navegar carpeta por carpeta.",
      },
    ],
  },
  {
    key: "upload",
    title: "Subir archivos",
    icon: "UploadOutlined",
    content: [
      {
        type: "text",
        content:
          "Hay varias formas de subir archivos a la carpeta en la que estás parado.",
      },
      {
        type: "list",
        content: [
          'Botón "Subir archivo" en la barra lateral de carpetas',
          "Arrastrar y soltar uno o varios archivos sobre la pantalla",
          "En mobile, tocar el fondo vacío del panel de contenido abre el selector de archivos",
        ],
      },
      {
        type: "list",
        content: [
          "No se permiten imágenes ni videos",
          "Cada archivo tiene un tamaño máximo permitido",
          "Las subidas se procesan de a varias a la vez, pero con un límite de simultáneas para no saturar el servidor",
        ],
      },
      {
        type: "tip",
        content:
          "Si subís muchos archivos a la vez y algunos fallan, vas a ver un aviso indicando cuántos no se pudieron subir sin afectar al resto.",
      },
    ],
  },
  {
    key: "organize",
    title: "Organizar: crear, mover, renombrar y eliminar",
    icon: "FolderAddOutlined",
    content: [
      {
        type: "list",
        content: [
          'Click derecho sobre el fondo de una carpeta y elegí "Crear carpeta" para agregar una subcarpeta',
          "Arrastrá una tarjeta de archivo o carpeta y soltala sobre otra carpeta (en el panel o en el árbol lateral) para moverla",
          'Click derecho sobre un archivo o carpeta para "Renombrar", "Descargar" o "Eliminar"',
        ],
      },
      {
        type: "tip",
        content:
          "Eliminar una carpeta borra también todo su contenido. Esta acción no se puede deshacer, así que la app te pide confirmación antes de aplicarla.",
      },
    ],
  },
  {
    key: "selection",
    title: "Selección múltiple",
    icon: "CheckSquareOutlined",
    content: [
      {
        type: "text",
        content:
          "Podés seleccionar varios archivos o carpetas a la vez para descargarlos o eliminarlos juntos.",
      },
      {
        type: "list",
        content: [
          "Pasá el mouse sobre una tarjeta (o tocala en mobile) para ver el checkbox de selección en la esquina superior izquierda",
          "Con al menos un elemento seleccionado aparece una barra con las acciones disponibles: Descargar, Eliminar y una opción para limpiar la selección",
        ],
      },
      {
        type: "tip",
        content:
          "Al cambiar de carpeta, la selección se limpia automáticamente.",
      },
    ],
  },
  {
    key: "share",
    title: "Compartir archivos",
    icon: "ShareAltOutlined",
    content: [
      {
        type: "text",
        content:
          "Un archivo puede compartirse con otras aplicaciones para que accedan a él directamente, sin tener que descargarlo y volver a subirlo a mano.",
      },
      {
        type: "list",
        content: [
          'Click derecho sobre un archivo y elegí "Compartir con"',
          "Elegí la aplicación de destino en el submenú",
          "Un pequeño avatar sobre la tarjeta del archivo indica con qué apps está compartido",
        ],
      },
      {
        type: "tip",
        content:
          'Esta opción solo aparece para usuarios con rol de administrador.',
      },
    ],
  },
];
