export interface ConsoleNavLink {
	label: string;     // Nombre del enlace
	icon?: string;     // Icono opcional
	route?: string;    // Ruta para la navegación (opcional)
	clickHandler?: () => void; // Función para manejar clics (opcional)
  }
