export type Role = "administrador_ti" | "ti";

export type RepairStatus = "pendiente" | "proceso" | "finalizado";
export type Priority = "baja" | "media" | "alta";

export interface RepairTicket {
  id: string;
  titulo: string;
  descripcion?: string;
  cliente?: string;
  dispositivo?: string;
  serie?: string;
  prioridad: Priority;
  estado: RepairStatus;
  fechaCreacion: string; // ISO
  fechaEntrega?: string; // ISO (due date)
}

export type InventoryState =
  | "almacen"
  | "en_reparacion"
  | "entregado"
  | "prestado";

export interface InventoryItem {
  id: string;
  nombre: string;
  categoria?: string;
  serie?: string;
  estado: InventoryState;
  cliente?: string;
  fechaIngreso: string; // ISO
  prestadoA?: string;
  fechaPrestamo?: string; // ISO
  fechaDevolucionEstimada?: string; // ISO
  imagen?: string; // base64 o URL
}
