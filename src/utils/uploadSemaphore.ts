import { Semaphore } from "./semaphore";

// Como mucho 4 subidas en simultáneo — protege al Pi y al pool de conexiones del
// browser. Compartido entre todos los puntos de entrada de upload (dropzone, botón
// de la sidebar, etc.) para que el límite sea global y no por componente.
export const uploadSemaphore = new Semaphore(4);
