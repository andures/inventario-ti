import type { InventoryItem, RepairTicket } from "../types";
import apiClient from "./apiClient";
import config from "../config/config";

/**
 * Servicio para gestionar el inventario
 */
export const inventoryService = {
  /**
   * Listar todos los items del inventario
   */
  async list(filters?: {
    estado?: string;
    cliente?: string;
    search?: string;
  }): Promise<InventoryItem[]> {
    const params = new URLSearchParams();
    if (filters?.estado) params.append("estado", filters.estado);
    if (filters?.cliente) params.append("cliente", filters.cliente);
    if (filters?.search) params.append("search", filters.search);

    const url = `${config.endpoints.inventario.list}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await apiClient.get<{
      success: boolean;
      data: InventoryItem[];
    }>(url);
    return response.data.data;
  },

  /**
   * Obtener un item por ID
   */
  async getById(id: string): Promise<InventoryItem> {
    const response = await apiClient.get<{
      success: boolean;
      data: InventoryItem;
    }>(config.endpoints.inventario.byId(id));
    return response.data.data;
  },

  /**
   * Crear nuevo item
   */
  async create(data: Omit<InventoryItem, "id">): Promise<InventoryItem> {
    const response = await apiClient.post<{
      success: boolean;
      data: InventoryItem;
    }>(config.endpoints.inventario.create, data);
    return response.data.data;
  },

  /**
   * Actualizar item existente
   */
  async update(
    id: string,
    data: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    const response = await apiClient.put<{
      success: boolean;
      data: InventoryItem;
    }>(config.endpoints.inventario.update(id), data);
    return response.data.data;
  },

  /**
   * Eliminar item
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(config.endpoints.inventario.delete(id));
  },
};

/**
 * Servicio para gestionar reparaciones
 */
export const repairsService = {
  /**
   * Listar todos los tickets de reparación
   */
  async list(filters?: {
    estado?: string;
    prioridad?: string;
    cliente?: string;
    search?: string;
  }): Promise<RepairTicket[]> {
    const params = new URLSearchParams();
    if (filters?.estado) params.append("estado", filters.estado);
    if (filters?.prioridad) params.append("prioridad", filters.prioridad);
    if (filters?.cliente) params.append("cliente", filters.cliente);
    if (filters?.search) params.append("search", filters.search);

    const url = `${config.endpoints.reparaciones.list}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await apiClient.get<{
      success: boolean;
      data: RepairTicket[];
    }>(url);
    return response.data.data;
  },

  /**
   * Obtener un ticket por ID
   */
  async getById(id: string): Promise<RepairTicket> {
    const response = await apiClient.get<{
      success: boolean;
      data: RepairTicket;
    }>(config.endpoints.reparaciones.byId(id));
    return response.data.data;
  },

  /**
   * Crear nuevo ticket
   */
  async create(data: Omit<RepairTicket, "id">): Promise<RepairTicket> {
    const response = await apiClient.post<{
      success: boolean;
      data: RepairTicket;
    }>(config.endpoints.reparaciones.create, data);
    return response.data.data;
  },

  /**
   * Actualizar ticket existente
   */
  async update(id: string, data: Partial<RepairTicket>): Promise<RepairTicket> {
    const response = await apiClient.put<{
      success: boolean;
      data: RepairTicket;
    }>(config.endpoints.reparaciones.update(id), data);
    return response.data.data;
  },

  /**
   * Eliminar ticket
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(config.endpoints.reparaciones.delete(id));
  },
};

// Mantener export anterior para compatibilidad con código existente (se eliminará después)
const KEYS = {
  repairs: "repairsStore",
  inventory: "inventoryStore",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const localRepo = {
  // Repairs
  listRepairs(): RepairTicket[] {
    return read<RepairTicket[]>(KEYS.repairs, []);
  },
  saveRepairs(items: RepairTicket[]) {
    write(KEYS.repairs, items);
  },

  // Inventory
  listInventory(): InventoryItem[] {
    return read<InventoryItem[]>(KEYS.inventory, []);
  },
  saveInventory(items: InventoryItem[]) {
    write(KEYS.inventory, items);
  },
};
