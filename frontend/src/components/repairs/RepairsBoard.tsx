import { useEffect, useMemo, useState, useRef } from "react";
import { Box, Button, Input, Stack, Text, Heading } from "@chakra-ui/react";
import { Dialog } from "@chakra-ui/react";
import type { ChangeEvent } from "react";
import { inventoryService, repairsService } from "../../services/localRepo";
import type {
  Priority,
  RepairStatus,
  RepairTicket,
  InventoryItem,
} from "../../types";

const columns: {
  key: RepairStatus;
  title: string;
  color: string;
  bg: string;
  borderColor: string;
}[] = [
  {
    key: "pendiente",
    title: "Pendientes",
    color: "#fbbf24",
    bg: "linear-gradient(135deg, #f59e0b, #d97706)",
    borderColor: "#fbbf24",
  },
  {
    key: "proceso",
    title: "En Proceso",
    color: "#3b82f6",
    bg: "linear-gradient(135deg, #3b82f6, #2563eb)",
    borderColor: "#3b82f6",
  },
  {
    key: "finalizado",
    title: "Finalizado",
    color: "#10b981",
    bg: "linear-gradient(135deg, #10b981, #059669)",
    borderColor: "#10b981",
  },
];

export function RepairsBoard() {
  const [items, setItems] = useState<RepairTicket[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<InventoryItem | null>(
    null
  );
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    cliente: "",
    prioridad: "media" as Priority,
    fechaEntrega: "",
  });

  // Refs para almacenar los timers de debounce por cada ticket
  const updateTimersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    loadData();
  }, []);

  // Limpiar timers al desmontar
  useEffect(() => {
    const timers = updateTimersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [repairs, inventory] = await Promise.all([
        repairsService.list(),
        inventoryService.list(),
      ]);
      setItems(
        repairs.map((item: { _id?: string; id?: string } & RepairTicket) => ({
          ...item,
          id: item._id || item.id || "",
        }))
      );
      setInventoryItems(
        inventory.map(
          (item: { _id?: string; id?: string } & InventoryItem) => ({
            ...item,
            id: item._id || item.id || "",
          })
        )
      );
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  }

  const grouped = useMemo(() => {
    return columns.reduce((acc, c) => {
      acc[c.key] = items.filter((t) => t.estado === c.key);
      return acc;
    }, {} as Record<RepairStatus, RepairTicket[]>);
  }, [items]);

  const filteredInventory = useMemo(() => {
    if (!searchTerm)
      return inventoryItems.filter((item) => item.estado === "almacen");
    const term = searchTerm.toLowerCase();
    return inventoryItems
      .filter((item) => item.estado === "almacen")
      .filter(
        (item) =>
          item.nombre.toLowerCase().includes(term) ||
          item.categoria?.toLowerCase().includes(term) ||
          item.serie?.toLowerCase().includes(term) ||
          item.cliente?.toLowerCase().includes(term)
      );
  }, [inventoryItems, searchTerm]);

  function openListModal() {
    setIsListModalOpen(true);
    setSearchTerm("");
    setSelectedDevice(null);
  }

  function closeListModal() {
    setIsListModalOpen(false);
    setSearchTerm("");
  }

  function handleDeviceSelect(device: InventoryItem) {
    setSelectedDevice(device);
    setFormData({
      titulo: `Reparación: ${device.nombre}`,
      descripcion: device.categoria || "",
      cliente: device.cliente || "",
      prioridad: "media",
      fechaEntrega: "",
    });
    setIsListModalOpen(false);
    setIsFormModalOpen(true);
  }

  function closeFormModal() {
    setIsFormModalOpen(false);
    setSelectedDevice(null);
    setFormData({
      titulo: "",
      descripcion: "",
      cliente: "",
      prioridad: "media",
      fechaEntrega: "",
    });
  }

  async function addTicket() {
    if (!selectedDevice || !formData.cliente) return;

    try {
      setLoading(true);
      const newTicket = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        cliente: formData.cliente,
        dispositivo: selectedDevice.nombre,
        serie: selectedDevice.serie,
        prioridad: formData.prioridad,
        estado: "pendiente" as RepairStatus,
        fechaCreacion: new Date().toISOString(),
        inventarioId: selectedDevice.id,
        fechaEntrega: formData.fechaEntrega
          ? new Date(formData.fechaEntrega).toISOString()
          : undefined,
      };

      const created = await repairsService.create(newTicket);
      const ticketWithId = {
        ...created,
        id: (created as { _id?: string })._id || created.id || "",
      };

      setItems((prev) => [ticketWithId, ...prev]);
      closeFormModal();
    } catch (error) {
      console.error("Error al crear reparación:", error);
      alert("Error al crear la reparación. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function updateTicket(id: string, patch: Partial<RepairTicket>) {
    // Actualizar el estado local inmediatamente para feedback visual
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

    // Cancelar el timer anterior para este ticket si existe
    const existingTimer = updateTimersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Crear nuevo timer con debounce de 800ms
    const timer = setTimeout(async () => {
      try {
        // Hacer la actualización en el backend
        await repairsService.update(id, patch);
        console.log(`✅ Ticket ${id} actualizado en el backend`);
      } catch (error) {
        console.error("Error al actualizar reparación:", error);
        alert("Error al actualizar la reparación.");
        // Recargar para sincronizar con el backend
        loadData();
      } finally {
        // Remover el timer del Map
        updateTimersRef.current.delete(id);
      }
    }, 800); // Espera 800ms después del último cambio

    // Guardar el timer en el Map
    updateTimersRef.current.set(id, timer);
  }

  function onDrop(e: React.DragEvent, target: RepairStatus) {
    const id = e.dataTransfer.getData("text/plain");
    updateTicket(id, { estado: target });
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={6}
        flexWrap="wrap"
        gap={4}
      >
        <Box>
          <Heading size="3xl" color="white" fontWeight="bold" mb={1}>
            Reparaciones
          </Heading>
          <Text color="#8b5cf6" fontWeight="semibold" fontSize="lg">
            {items.length} reparaciones totales
          </Text>
        </Box>
        <Button
          onClick={openListModal}
          bgGradient="linear(to-r, #8b5cf6, #7c3aed)"
          color="white"
          _hover={{
            transform: "scale(1.05)",
            boxShadow: "0 8px 25px rgba(139, 92, 246, 0.5)",
          }}
          size="lg"
          px={10}
          py={6}
          fontWeight="bold"
          fontSize="lg"
          boxShadow="0 6px 20px rgba(139, 92, 246, 0.4)"
          transition="all 0.3s"
          borderRadius="xl"
        >
          ➕ Nueva reparación
        </Button>
      </Box>

      {/* MODAL 1: Lista de dispositivos */}
      <Dialog.Root
        open={isListModalOpen}
        onOpenChange={(e) => (e.open ? openListModal() : closeListModal())}
        size="lg"
        placement="center"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="gray.900" borderColor="gray.700" color="gray.100">
            <Dialog.Header>
              <Dialog.Title color="purple.400" fontSize="xl" fontWeight="700">
                Seleccionar Dispositivo
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <Button
                  aria-label="Cerrar"
                  variant="ghost"
                  size="sm"
                  position="absolute"
                  top={2}
                  right={2}
                  color="gray.400"
                  fontSize="xl"
                  fontWeight="bold"
                  _hover={{ color: "white", bg: "gray.800" }}
                >
                  ✕
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <Box>
                <Text mb={3} color="gray.300" fontSize="sm">
                  Busca y selecciona el dispositivo del inventario:
                </Text>
                <Input
                  placeholder="Buscar por nombre, categoría, serie o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg="gray.800"
                  borderColor="gray.700"
                  color="gray.100"
                  mb={3}
                  _focus={{
                    borderColor: "purple.400",
                    boxShadow: "0 0 0 1px rgba(168, 85, 247, 0.6)",
                  }}
                />
                <Box
                  maxH="450px"
                  overflowY="auto"
                  border="1px solid"
                  borderColor="gray.700"
                  borderRadius="8px"
                  bg="gray.850"
                >
                  {filteredInventory.length === 0 ? (
                    <Box p={8} textAlign="center">
                      <Text color="gray.500" fontSize="lg" mb={2}>
                        {searchTerm
                          ? "No se encontraron dispositivos"
                          : "No hay dispositivos disponibles"}
                      </Text>
                      <Text color="gray.600" fontSize="sm">
                        {searchTerm
                          ? "Intenta con otros términos de búsqueda"
                          : "Crea dispositivos en el módulo de Inventario primero"}
                      </Text>
                    </Box>
                  ) : (
                    <>
                      <Box
                        p={2}
                        bg="gray.800"
                        borderBottom="1px solid"
                        borderColor="gray.700"
                        position="sticky"
                        top={0}
                        zIndex={1}
                      >
                        <Text fontSize="xs" color="gray.400" fontWeight="600">
                          {filteredInventory.length} dispositivo
                          {filteredInventory.length !== 1 ? "s" : ""} disponible
                          {filteredInventory.length !== 1 ? "s" : ""}
                        </Text>
                      </Box>
                      <Stack gap={0}>
                        {filteredInventory.map((device, index) => (
                          <Box
                            key={device.id}
                            p={4}
                            cursor="pointer"
                            borderBottom={
                              index !== filteredInventory.length - 1
                                ? "1px solid"
                                : "none"
                            }
                            borderColor="gray.700"
                            transition="all 0.2s"
                            _hover={{
                              bg: "purple.900",
                              borderLeftWidth: "3px",
                              borderLeftColor: "purple.400",
                              paddingLeft: "calc(1rem - 3px)",
                            }}
                            onClick={() => handleDeviceSelect(device)}
                          >
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="start"
                              mb={2}
                            >
                              <Text
                                fontWeight="700"
                                color="gray.100"
                                fontSize="md"
                              >
                                {device.nombre}
                              </Text>
                              {device.categoria && (
                                <Box
                                  px={2}
                                  py={0.5}
                                  bg="gray.800"
                                  borderRadius="4px"
                                  fontSize="xs"
                                  color="purple.300"
                                  fontWeight="600"
                                >
                                  {device.categoria}
                                </Box>
                              )}
                            </Box>
                            <Stack gap={1}>
                              {device.serie && (
                                <Text fontSize="sm" color="gray.400">
                                  <Text
                                    as="span"
                                    fontWeight="600"
                                    color="gray.500"
                                  >
                                    Serie:
                                  </Text>{" "}
                                  {device.serie}
                                </Text>
                              )}
                              {device.cliente && (
                                <Text fontSize="sm" color="gray.400">
                                  <Text
                                    as="span"
                                    fontWeight="600"
                                    color="gray.500"
                                  >
                                    Cliente:
                                  </Text>{" "}
                                  {device.cliente}
                                </Text>
                              )}
                              {!device.serie && !device.cliente && (
                                <Text
                                  fontSize="sm"
                                  color="gray.600"
                                  fontStyle="italic"
                                >
                                  Sin información adicional
                                </Text>
                              )}
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </>
                  )}
                </Box>
              </Box>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  onClick={closeListModal}
                  borderColor="gray.700"
                  color="gray.300"
                  _hover={{ bg: "gray.800" }}
                >
                  Cancelar
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* MODAL 2: Formulario de reparación */}
      <Dialog.Root
        open={isFormModalOpen}
        onOpenChange={(e) =>
          e.open ? setIsFormModalOpen(true) : closeFormModal()
        }
        size="lg"
        placement="center"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="gray.900" borderColor="gray.700" color="gray.100">
            <Dialog.Header>
              <Dialog.Title color="purple.400" fontSize="xl" fontWeight="700">
                Nueva Reparación
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <Button
                  aria-label="Cerrar"
                  variant="ghost"
                  size="sm"
                  position="absolute"
                  top={2}
                  right={2}
                  color="gray.400"
                  fontSize="xl"
                  fontWeight="bold"
                  _hover={{ color: "white", bg: "gray.800" }}
                >
                  ✕
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <Stack gap={4}>
                {selectedDevice && (
                  <Box
                    p={3}
                    bg="gray.800"
                    borderRadius="8px"
                    border="1px solid"
                    borderColor="gray.700"
                  >
                    <Text fontSize="sm" color="gray.400" mb={1}>
                      Dispositivo seleccionado:
                    </Text>
                    <Text fontWeight="700" color="purple.400" fontSize="lg">
                      {selectedDevice.nombre}
                    </Text>
                    <Text fontSize="sm" color="gray.300">
                      {selectedDevice.categoria &&
                        `${selectedDevice.categoria} • `}
                      {selectedDevice.serie && `Serie: ${selectedDevice.serie}`}
                    </Text>
                  </Box>
                )}

                <Box>
                  <Text
                    mb={1.5}
                    fontSize="xs"
                    fontWeight="600"
                    color="gray.300"
                    letterSpacing="wide"
                  >
                    TÍTULO *
                  </Text>
                  <Input
                    placeholder="Título de la reparación"
                    value={formData.titulo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        titulo: e.target.value,
                      }))
                    }
                    bg="gray.800"
                    borderColor="gray.700"
                    color="gray.100"
                    _focus={{
                      borderColor: "purple.400",
                      boxShadow: "0 0 0 1px rgba(168, 85, 247, 0.6)",
                    }}
                  />
                </Box>

                <Box>
                  <Text
                    mb={1.5}
                    fontSize="xs"
                    fontWeight="600"
                    color="gray.300"
                    letterSpacing="wide"
                  >
                    DESCRIPCIÓN
                  </Text>
                  <Input
                    placeholder="Descripción del problema"
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        descripcion: e.target.value,
                      }))
                    }
                    bg="gray.800"
                    borderColor="gray.700"
                    color="gray.100"
                    _focus={{
                      borderColor: "purple.400",
                      boxShadow: "0 0 0 1px rgba(168, 85, 247, 0.6)",
                    }}
                  />
                </Box>

                <Box>
                  <Text
                    mb={1.5}
                    fontSize="xs"
                    fontWeight="600"
                    color="gray.300"
                    letterSpacing="wide"
                  >
                    CLIENTE *
                  </Text>
                  <Input
                    placeholder="Nombre del cliente"
                    value={formData.cliente}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cliente: e.target.value,
                      }))
                    }
                    bg="gray.800"
                    borderColor="gray.700"
                    color="gray.100"
                    _focus={{
                      borderColor: "purple.400",
                      boxShadow: "0 0 0 1px rgba(168, 85, 247, 0.6)",
                    }}
                  />
                </Box>

                <Box>
                  <Text
                    mb={1.5}
                    fontSize="xs"
                    fontWeight="600"
                    color="gray.300"
                    letterSpacing="wide"
                  >
                    PRIORIDAD
                  </Text>
                  <select
                    value={formData.prioridad}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setFormData((prev) => ({
                        ...prev,
                        prioridad: e.target.value as Priority,
                      }))
                    }
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 12px",
                      borderRadius: 8,
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      color: "#E5E7EB",
                    }}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </Box>

                <Box>
                  <Text
                    mb={1.5}
                    fontSize="xs"
                    fontWeight="600"
                    color="gray.300"
                    letterSpacing="wide"
                  >
                    FECHA DE ENTREGA (ESTIMADA)
                  </Text>
                  <Input
                    type="date"
                    value={formData.fechaEntrega}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fechaEntrega: e.target.value,
                      }))
                    }
                    bg="gray.800"
                    borderColor="gray.700"
                    color="gray.100"
                    _focus={{
                      borderColor: "purple.400",
                      boxShadow: "0 0 0 1px rgba(168, 85, 247, 0.6)",
                    }}
                  />
                </Box>
              </Stack>
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={closeFormModal}
                borderColor="gray.700"
                color="gray.300"
                _hover={{ bg: "gray.800" }}
              >
                Cancelar
              </Button>
              <Button
                onClick={addTicket}
                bg="purple.600"
                color="white"
                _hover={{ bg: "purple.500" }}
                ml={2}
                disabled={!formData.titulo || !formData.cliente || loading}
                loading={loading}
              >
                {loading ? "Creando..." : "Crear reparación"}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      <Box
        display="grid"
        gridTemplateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
        gap={6}
      >
        {columns.map((col) => (
          <Box
            key={col.key}
            bg="#1a1a24"
            border="3px solid"
            borderColor={col.borderColor}
            borderRadius="2xl"
            p={5}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, col.key)}
            minH="300px"
            transition="all 0.3s"
            _hover={{
              boxShadow: `0 8px 30px ${col.borderColor}40`,
              transform: "translateY(-4px)",
            }}
          >
            <Box
              bgGradient={col.bg}
              p={4}
              borderRadius="xl"
              mb={4}
              boxShadow="0 4px 15px rgba(0,0,0,0.3)"
            >
              <Text
                fontWeight="900"
                color="white"
                fontSize="xl"
                textAlign="center"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                {col.title}
              </Text>
              <Text
                color="white"
                fontSize="2xl"
                fontWeight="bold"
                textAlign="center"
                mt={2}
              >
                {grouped[col.key]?.length ?? 0}
              </Text>
            </Box>
            <Stack gap={3}>
              {grouped[col.key]?.map((t) => (
                <Box
                  key={t.id}
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData("text/plain", t.id)
                  }
                  bg="#0d0d15"
                  border="2px solid"
                  borderColor="#2a2a3a"
                  borderRadius="xl"
                  p={4}
                  cursor="move"
                  transition="all 0.2s"
                  _hover={{
                    borderColor: col.borderColor,
                    boxShadow: `0 4px 15px ${col.borderColor}30`,
                    transform: "scale(1.02)",
                  }}
                >
                  <Input
                    variant="subtle"
                    value={t.titulo}
                    onChange={(e) =>
                      updateTicket(t.id, { titulo: e.target.value })
                    }
                    fontWeight="700"
                    color="white"
                    fontSize="md"
                    mb={3}
                    bg="#1a1a24"
                    border="2px solid"
                    borderColor="#2a2a3a"
                    _focus={{
                      borderColor: col.borderColor,
                      boxShadow: `0 0 0 1px ${col.borderColor}`,
                    }}
                  />
                  <Input
                    variant="subtle"
                    placeholder="Cliente"
                    value={t.cliente ?? ""}
                    onChange={(e) =>
                      updateTicket(t.id, { cliente: e.target.value })
                    }
                    bg="#1a1a24"
                    borderColor="#2a2a3a"
                    border="2px solid"
                    color="white"
                    size="sm"
                    mb={3}
                    _focus={{
                      borderColor: col.borderColor,
                      boxShadow: `0 0 0 1px ${col.borderColor}`,
                    }}
                    _placeholder={{ color: "gray.500" }}
                  />
                  <Stack direction="row" gap={2} align="center">
                    <select
                      value={t.prioridad}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        updateTicket(t.id, {
                          prioridad: e.target.value as Priority,
                        })
                      }
                      style={{
                        height: "36px",
                        padding: "0 10px",
                        borderRadius: "8px",
                        backgroundColor: "#1a1a24",
                        border: "2px solid #2a2a3a",
                        color: "#ffffff",
                        fontWeight: "600",
                        flex: 1,
                      }}
                    >
                      <option value="baja">🟢 Baja</option>
                      <option value="media">🟡 Media</option>
                      <option value="alta">🔴 Alta</option>
                    </select>
                    <Input
                      type="date"
                      value={t.fechaEntrega?.slice(0, 10) ?? ""}
                      onChange={(e) =>
                        updateTicket(t.id, {
                          fechaEntrega: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined,
                        })
                      }
                      size="sm"
                      bg="#1a1a24"
                      borderColor="#2a2a3a"
                      border="2px solid"
                      color="white"
                      flex={1}
                      _focus={{
                        borderColor: col.borderColor,
                        boxShadow: `0 0 0 1px ${col.borderColor}`,
                      }}
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
