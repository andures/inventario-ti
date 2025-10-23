import { useEffect, useState, useRef } from "react";
import { Box, Button, Input, Table, Image } from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";
import type { ChangeEvent } from "react";
import { inventoryService } from "../../services/localRepo";
import type { InventoryItem, InventoryState } from "../../types";

export function InventoryTable() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<InventoryItem>>({
    estado: "almacen",
  });

  // Refs para almacenar los timers de debounce por cada item
  const updateTimersRef = useRef<Map<string, number>>(new Map());

  // Cargar items del backend al montar
  useEffect(() => {
    loadItems();
  }, []);

  // Limpiar timers al desmontar
  useEffect(() => {
    const timers = updateTimersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  async function loadItems() {
    try {
      setLoading(true);
      const data = await inventoryService.list();
      // Mapear _id a id para compatibilidad con la interfaz
      setItems(
        data.map((item: { _id?: string; id?: string } & InventoryItem) => ({
          ...item,
          id: item._id || item.id || "",
        }))
      );
    } catch (error) {
      console.error("Error al cargar inventario:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addItem() {
    if (!form.nombre) return;
    try {
      setLoading(true);
      const payload = {
        nombre: form.nombre!,
        categoria: form.categoria || "",
        serie: form.serie || "",
        estado: (form.estado as InventoryState) || "almacen",
        cliente: form.cliente || "",
        fechaIngreso: new Date().toISOString(),
      };
      const newItem = await inventoryService.create(
        payload as Omit<InventoryItem, "id">
      );

      // Agregar al estado local
      const itemWithId = {
        ...newItem,
        id: (newItem as { _id?: string })._id || newItem.id,
      };
      setItems((prev) => [itemWithId, ...prev]);
      setForm({ estado: "almacen" });
    } catch (error) {
      console.error("Error al crear item:", error);
      alert("Error al crear el item");
    } finally {
      setLoading(false);
    }
  }

  async function updateItem(id: string, patch: Partial<InventoryItem>) {
    // Actualizar el estado local inmediatamente para feedback visual
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );

    // Cancelar el timer anterior para este item si existe
    const existingTimer = updateTimersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Crear nuevo timer con debounce de 800ms
    const timer = setTimeout(async () => {
      try {
        // Hacer la actualización en el backend
        await inventoryService.update(id, patch);
        console.log(`✅ Item ${id} actualizado en el backend`);
      } catch (error) {
        console.error("Error al actualizar item:", error);
        alert("Error al actualizar el item");
        // Recargar para sincronizar con el backend
        loadItems();
      } finally {
        // Remover el timer del Map
        updateTimersRef.current.delete(id);
      }
    }, 800); // Espera 800ms después del último cambio

    // Guardar el timer en el Map
    updateTimersRef.current.set(id, timer);
  }

  // Convertir imagen a base64
  function handleImageUpload(file: File, callback: (base64: string) => void) {
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen");
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen es demasiado grande. Máximo 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      callback(base64);
    };
    reader.readAsDataURL(file);
  }

  return (
    <Box>
      <Box display="flex" gap={2} flexWrap="wrap" mb={4}>
        <Input
          placeholder="Nombre"
          value={form.nombre || ""}
          onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          maxW="200px"
        />
        <Input
          placeholder="Categoría"
          value={form.categoria || ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, categoria: e.target.value }))
          }
          maxW="160px"
        />
        <Input
          placeholder="Serie"
          value={form.serie || ""}
          onChange={(e) => setForm((f) => ({ ...f, serie: e.target.value }))}
          maxW="160px"
        />
        <Input
          placeholder="Cliente"
          value={form.cliente || ""}
          onChange={(e) => setForm((f) => ({ ...f, cliente: e.target.value }))}
          maxW="200px"
        />
        <select
          value={(form.estado as InventoryState) || "almacen"}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setForm((f) => ({ ...f, estado: e.target.value as InventoryState }))
          }
          style={{
            height: "36px",
            padding: "0 8px",
            borderRadius: 8,
            backgroundColor: "#111827",
            border: "1px solid #374151",
            color: "#E5E7EB",
            maxWidth: 180,
          }}
        >
          <option value="almacen">Almacén</option>
          <option value="en_reparacion">En reparación</option>
          <option value="entregado">Entregado</option>
          <option value="prestado">Prestado</option>
        </select>
        {form.estado === "prestado" && (
          <>
            <Input
              placeholder="Prestado a..."
              value={form.prestadoA || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, prestadoA: e.target.value }))
              }
              maxW="200px"
            />
            <Input
              type="date"
              placeholder="Fecha préstamo"
              value={form.fechaPrestamo?.slice(0, 10) || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  fechaPrestamo: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined,
                }))
              }
              maxW="160px"
            />
            <Input
              type="date"
              placeholder="Devolución estimada"
              value={form.fechaDevolucionEstimada?.slice(0, 10) || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  fechaDevolucionEstimada: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined,
                }))
              }
              maxW="160px"
            />
          </>
        )}
        <Button
          onClick={addItem}
          bg="green.600"
          color="white"
          _hover={{ bg: "green.500" }}
          disabled={loading || !form.nombre}
        >
          {loading ? "Guardando..." : "Agregar"}
        </Button>
      </Box>

      <Table.Root size="sm" variant="outline" borderColor="gray.700">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Imagen</Table.ColumnHeader>
            <Table.ColumnHeader>Nombre</Table.ColumnHeader>
            <Table.ColumnHeader>Categoría</Table.ColumnHeader>
            <Table.ColumnHeader>Serie</Table.ColumnHeader>
            <Table.ColumnHeader>Estado</Table.ColumnHeader>
            <Table.ColumnHeader>Cliente</Table.ColumnHeader>
            <Table.ColumnHeader>Prestado a</Table.ColumnHeader>
            <Table.ColumnHeader>Fecha Préstamo</Table.ColumnHeader>
            <Table.ColumnHeader>QR</Table.ColumnHeader>
            <Table.ColumnHeader>Ingreso</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((it) => (
            <Table.Row key={it.id}>
              <Table.Cell>
                <Box position="relative" w="60px" h="60px">
                  {it.imagen ? (
                    <Image
                      src={it.imagen}
                      alt={it.nombre}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      borderRadius="4px"
                      cursor="pointer"
                      onClick={() => window.open(it.imagen, "_blank")}
                    />
                  ) : (
                    <Box
                      w="100%"
                      h="100%"
                      bg="gray.800"
                      borderRadius="4px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="xs"
                      color="gray.600"
                    >
                      Sin imagen
                    </Box>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    position="absolute"
                    top={0}
                    left={0}
                    w="100%"
                    h="100%"
                    opacity={0}
                    cursor="pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file, (base64) => {
                          updateItem(it.id, { imagen: base64 });
                        });
                      }
                    }}
                  />
                </Box>
              </Table.Cell>
              <Table.Cell>
                <Input
                  value={it.nombre}
                  onChange={(e) =>
                    updateItem(it.id, { nombre: e.target.value })
                  }
                  size="sm"
                />
              </Table.Cell>
              <Table.Cell>
                <Input
                  value={it.categoria || ""}
                  onChange={(e) =>
                    updateItem(it.id, { categoria: e.target.value })
                  }
                  size="sm"
                />
              </Table.Cell>
              <Table.Cell>
                <Input
                  value={it.serie || ""}
                  onChange={(e) => updateItem(it.id, { serie: e.target.value })}
                  size="sm"
                />
              </Table.Cell>
              <Table.Cell>
                <select
                  value={it.estado}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    updateItem(it.id, {
                      estado: e.target.value as InventoryState,
                    })
                  }
                  style={{
                    height: "28px",
                    padding: "0 6px",
                    borderRadius: 6,
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    color: "#E5E7EB",
                  }}
                >
                  <option value="almacen">Almacén</option>
                  <option value="en_reparacion">En reparación</option>
                  <option value="entregado">Entregado</option>
                  <option value="prestado">Prestado</option>
                </select>
              </Table.Cell>
              <Table.Cell>
                <Input
                  value={it.cliente || ""}
                  onChange={(e) =>
                    updateItem(it.id, { cliente: e.target.value })
                  }
                  size="sm"
                />
              </Table.Cell>
              <Table.Cell>
                <Input
                  value={it.prestadoA || ""}
                  onChange={(e) =>
                    updateItem(it.id, { prestadoA: e.target.value })
                  }
                  size="sm"
                  disabled={it.estado !== "prestado"}
                  placeholder={it.estado === "prestado" ? "Nombre..." : "-"}
                />
              </Table.Cell>
              <Table.Cell>
                <Input
                  type="date"
                  value={it.fechaPrestamo?.slice(0, 10) || ""}
                  onChange={(e) =>
                    updateItem(it.id, {
                      fechaPrestamo: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined,
                    })
                  }
                  size="sm"
                  disabled={it.estado !== "prestado"}
                />
              </Table.Cell>
              <Table.Cell>
                <Box
                  p={1}
                  bg="white"
                  borderRadius="4px"
                  display="inline-block"
                  cursor="pointer"
                  title="Escanea para subir foto desde celular"
                >
                  <QRCodeSVG
                    value={`${window.location.origin}/upload-image/${it.id}`}
                    size={50}
                    level="M"
                  />
                </Box>
              </Table.Cell>
              <Table.Cell>
                {new Date(it.fechaIngreso).toLocaleDateString()}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
