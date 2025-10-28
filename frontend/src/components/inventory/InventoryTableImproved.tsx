import { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Input,
  Table,
  Image,
  Card,
  Grid,
  Text,
} from "@chakra-ui/react";
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
  const [showForm, setShowForm] = useState(false);

  const updateTimersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    loadItems();
  }, []);

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

      const itemWithId = {
        ...newItem,
        id: (newItem as { _id?: string })._id || newItem.id,
      };
      setItems((prev) => [itemWithId, ...prev]);
      setForm({ estado: "almacen" });
      setShowForm(false);
    } catch (error) {
      console.error("Error al crear item:", error);
      alert("Error al crear el item");
    } finally {
      setLoading(false);
    }
  }

  async function updateItem(id: string, patch: Partial<InventoryItem>) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );

    const existingTimer = updateTimersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(async () => {
      try {
        await inventoryService.update(id, patch);
        console.log(`✅ Item ${id} actualizado en el backend`);
      } catch (error) {
        console.error("Error al actualizar item:", error);
        alert("Error al actualizar el item");
        loadItems();
      } finally {
        updateTimersRef.current.delete(id);
      }
    }, 800);

    updateTimersRef.current.set(id, timer);
  }

  function handleImageUpload(file: File, callback: (base64: string) => void) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("La imagen es demasiado grande. Máximo 10MB");
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
      {/* Header con botón agregar */}
      <Box
        mb={6}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Items del Inventario
          </Text>
          <Text color="gray.400" mt={1}>
            {items.length} equipos registrados
          </Text>
        </Box>
        <Button
          onClick={() => setShowForm(!showForm)}
          bg="green.600"
          color="white"
          _hover={{ bg: "green.500" }}
          size="lg"
          px={8}
          fontWeight="bold"
          boxShadow="0 4px 15px rgba(34, 197, 94, 0.3)"
        >
          {showForm ? "❌ Cancelar" : "➕ Agregar Equipo"}
        </Button>
      </Box>

      {/* Formulario de agregar (mejorado) */}
      {showForm && (
        <Card.Root
          bg="gray.800"
          border="1px solid"
          borderColor="green.600"
          borderRadius="xl"
          mb={6}
          boxShadow="0 4px 20px rgba(34, 197, 94, 0.2)"
        >
          <Card.Body p={6}>
            <Text fontSize="lg" fontWeight="bold" color="white" mb={4}>
              ➕ Nuevo Equipo
            </Text>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
              gap={4}
              mb={4}
            >
              <Box>
                <Text fontSize="sm" color="gray.400" mb={2}>
                  Nombre *
                </Text>
                <Input
                  placeholder="Ej: Laptop HP"
                  value={form.nombre || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nombre: e.target.value }))
                  }
                  bg="gray.900"
                  border="1px solid"
                  borderColor="gray.700"
                  _focus={{
                    borderColor: "green.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-green-500)",
                  }}
                />
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.400" mb={2}>
                  Categoría
                </Text>
                <Input
                  placeholder="Ej: Computadoras"
                  value={form.categoria || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, categoria: e.target.value }))
                  }
                  bg="gray.900"
                  border="1px solid"
                  borderColor="gray.700"
                  _focus={{
                    borderColor: "green.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-green-500)",
                  }}
                />
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.400" mb={2}>
                  Serie
                </Text>
                <Input
                  placeholder="Ej: ABC123456"
                  value={form.serie || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, serie: e.target.value }))
                  }
                  bg="gray.900"
                  border="1px solid"
                  borderColor="gray.700"
                  _focus={{
                    borderColor: "green.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-green-500)",
                  }}
                />
              </Box>
            </Grid>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={4}
              mb={4}
            >
              <Box>
                <Text fontSize="sm" color="gray.400" mb={2}>
                  Cliente
                </Text>
                <Input
                  placeholder="Ej: Empresa XYZ"
                  value={form.cliente || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cliente: e.target.value }))
                  }
                  bg="gray.900"
                  border="1px solid"
                  borderColor="gray.700"
                  _focus={{
                    borderColor: "green.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-green-500)",
                  }}
                />
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.400" mb={2}>
                  Estado
                </Text>
                <select
                  value={(form.estado as InventoryState) || "almacen"}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setForm((f) => ({
                      ...f,
                      estado: e.target.value as InventoryState,
                    }))
                  }
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "0 12px",
                    borderRadius: "6px",
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    color: "#E5E7EB",
                  }}
                >
                  <option value="almacen">🏢 Almacén</option>
                  <option value="en_reparacion">🔧 En reparación</option>
                  <option value="entregado">✅ Entregado</option>
                  <option value="prestado">📤 Prestado</option>
                </select>
              </Box>
            </Grid>

            {form.estado === "prestado" && (
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                gap={4}
                mb={4}
              >
                <Box>
                  <Text fontSize="sm" color="gray.400" mb={2}>
                    Prestado a
                  </Text>
                  <Input
                    placeholder="Nombre de la persona"
                    value={form.prestadoA || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, prestadoA: e.target.value }))
                    }
                    bg="gray.900"
                    border="1px solid"
                    borderColor="gray.700"
                    _focus={{
                      borderColor: "purple.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                    }}
                  />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.400" mb={2}>
                    Fecha préstamo
                  </Text>
                  <Input
                    type="date"
                    value={form.fechaPrestamo?.slice(0, 10) || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        fechaPrestamo: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : undefined,
                      }))
                    }
                    bg="gray.900"
                    border="1px solid"
                    borderColor="gray.700"
                    _focus={{
                      borderColor: "purple.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                    }}
                  />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.400" mb={2}>
                    Devolución estimada
                  </Text>
                  <Input
                    type="date"
                    value={form.fechaDevolucionEstimada?.slice(0, 10) || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        fechaDevolucionEstimada: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : undefined,
                      }))
                    }
                    bg="gray.900"
                    border="1px solid"
                    borderColor="gray.700"
                    _focus={{
                      borderColor: "purple.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                    }}
                  />
                </Box>
              </Grid>
            )}

            <Button
              onClick={addItem}
              bg="green.600"
              color="white"
              _hover={{ bg: "green.500" }}
              disabled={loading || !form.nombre}
              w="full"
              size="lg"
              fontWeight="bold"
            >
              {loading ? "⏳ Guardando..." : "✅ Agregar Equipo"}
            </Button>
          </Card.Body>
        </Card.Root>
      )}

      {/* Tabla mejorada */}
      <Box
        bg="gray.800"
        borderRadius="xl"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.700"
      >
        <Box overflowX="auto">
          <Table.Root size="sm" variant="outline" borderColor="gray.700">
            <Table.Header bg="gray.900">
              <Table.Row>
                <Table.ColumnHeader color="gray.300" fontWeight="bold">
                  Imagen
                </Table.ColumnHeader>
                <Table.ColumnHeader color="gray.300" fontWeight="bold">
                  Nombre
                </Table.ColumnHeader>
                <Table.ColumnHeader color="gray.300" fontWeight="bold">
                  Categoría
                </Table.ColumnHeader>
                <Table.ColumnHeader color="gray.300" fontWeight="bold">
                  Serie
                </Table.ColumnHeader>
                <Table.ColumnHeader color="gray.300" fontWeight="bold">
                  Estado
                </Table.ColumnHeader>
                <Table.ColumnHeader color="gray.300" fontWeight="bold">
                  Cliente
                </Table.ColumnHeader>
                <Table.ColumnHeader color="gray.300" fontWeight="bold">
                  Prestado a
                </Table.ColumnHeader>
                <Table.ColumnHeader color="gray.300" fontWeight="bold">
                  Fecha Préstamo
                </Table.ColumnHeader>
                <Table.ColumnHeader color="gray.300" fontWeight="bold">
                  QR
                </Table.ColumnHeader>
                <Table.ColumnHeader color="gray.300" fontWeight="bold">
                  Ingreso
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.map((it) => (
                <Table.Row
                  key={it.id}
                  _hover={{ bg: "gray.750" }}
                  transition="background 0.2s"
                >
                  <Table.Cell>
                    <Box position="relative" w="60px" h="60px">
                      {it.imagen ? (
                        <Image
                          src={it.imagen}
                          alt={it.nombre}
                          w="100%"
                          h="100%"
                          objectFit="cover"
                          borderRadius="8px"
                          cursor="pointer"
                          onClick={() => window.open(it.imagen, "_blank")}
                          border="2px solid"
                          borderColor="gray.700"
                          _hover={{ borderColor: "purple.500" }}
                        />
                      ) : (
                        <Box
                          w="100%"
                          h="100%"
                          bg="gray.900"
                          borderRadius="8px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="xs"
                          color="gray.600"
                          border="2px dashed"
                          borderColor="gray.700"
                        >
                          📷
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
                      bg="gray.900"
                      border="1px solid"
                      borderColor="gray.700"
                      _focus={{ borderColor: "purple.500" }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      value={it.categoria || ""}
                      onChange={(e) =>
                        updateItem(it.id, { categoria: e.target.value })
                      }
                      size="sm"
                      bg="gray.900"
                      border="1px solid"
                      borderColor="gray.700"
                      _focus={{ borderColor: "purple.500" }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      value={it.serie || ""}
                      onChange={(e) =>
                        updateItem(it.id, { serie: e.target.value })
                      }
                      size="sm"
                      bg="gray.900"
                      border="1px solid"
                      borderColor="gray.700"
                      _focus={{ borderColor: "purple.500" }}
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
                        height: "32px",
                        padding: "0 8px",
                        borderRadius: "6px",
                        backgroundColor: "#111827",
                        border: "1px solid #374151",
                        color: "#E5E7EB",
                      }}
                    >
                      <option value="almacen">🏢 Almacén</option>
                      <option value="en_reparacion">🔧 Reparación</option>
                      <option value="entregado">✅ Entregado</option>
                      <option value="prestado">📤 Prestado</option>
                    </select>
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      value={it.cliente || ""}
                      onChange={(e) =>
                        updateItem(it.id, { cliente: e.target.value })
                      }
                      size="sm"
                      bg="gray.900"
                      border="1px solid"
                      borderColor="gray.700"
                      _focus={{ borderColor: "purple.500" }}
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
                      bg="gray.900"
                      border="1px solid"
                      borderColor="gray.700"
                      _focus={{ borderColor: "purple.500" }}
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
                      bg="gray.900"
                      border="1px solid"
                      borderColor="gray.700"
                      _focus={{ borderColor: "purple.500" }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Box
                      p={2}
                      bg="white"
                      borderRadius="8px"
                      display="inline-block"
                      cursor="pointer"
                      title="Escanea para subir foto desde celular"
                      border="2px solid"
                      borderColor="purple.500"
                      _hover={{ boxShadow: "0 0 15px rgba(168, 85, 247, 0.5)" }}
                    >
                      <QRCodeSVG
                        value={`${window.location.origin}/upload-image/${it.id}`}
                        size={50}
                        level="M"
                      />
                    </Box>
                  </Table.Cell>
                  <Table.Cell>
                    <Text fontSize="sm" color="gray.400">
                      {new Date(it.fechaIngreso).toLocaleDateString()}
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>

      {items.length === 0 && !loading && (
        <Box textAlign="center" py={12}>
          <Text fontSize="6xl" mb={4}>
            📦
          </Text>
          <Text fontSize="xl" color="gray.400" mb={2}>
            No hay equipos registrados
          </Text>
          <Text color="gray.500">
            Haz clic en "Agregar Equipo" para comenzar
          </Text>
        </Box>
      )}
    </Box>
  );
}
