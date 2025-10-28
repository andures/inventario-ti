import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  Badge,
  Grid,
} from "@chakra-ui/react";
import { InventoryTable } from "../inventory/InventoryTable";
import { RepairsBoard } from "../repairs/RepairsBoard";

type View = "home" | "inventory" | "repairs";

interface DashboardProps {
  onLogout: () => void;
  user: { nombre: string; rol: string };
}

export function Dashboard({ onLogout, user }: DashboardProps) {
  const [view, setView] = useState<View>("home");

  return (
    <Box minH="100vh" bg="#0a0a0f" color="gray.100">
      {/* Header mejorado con gradiente más vibrante */}
      <Box
        bgGradient="linear(to-r, #3b82f6, #8b5cf6, #d946ef)"
        color="white"
        py={5}
        boxShadow="0 4px 30px rgba(139, 92, 246, 0.4)"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container
          maxW="container.xl"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Heading size="xl" mb={2} fontWeight="bold" letterSpacing="tight">
              📦 Inventario TI
            </Heading>
            <Text fontSize="md" color="whiteAlpha.900" mt={1}>
              Bienvenido, <strong>{user.nombre}</strong>
              <Badge
                ml={2}
                bg="rgba(255, 255, 255, 0.25)"
                color="white"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight="bold"
                backdropFilter="blur(10px)"
              >
                {user.rol}
              </Badge>
            </Text>
          </Box>
          <Stack direction="row" gap={3} display={{ base: "none", md: "flex" }}>
            <Button
              onClick={() => setView("inventory")}
              bg={view === "inventory" ? "white" : "rgba(255, 255, 255, 0.15)"}
              color={view === "inventory" ? "#8b5cf6" : "white"}
              _hover={{
                bg:
                  view === "inventory"
                    ? "gray.100"
                    : "rgba(255, 255, 255, 0.25)",
                transform: "translateY(-2px)",
              }}
              fontWeight="bold"
              transition="all 0.3s"
              px={6}
              boxShadow={
                view === "inventory"
                  ? "0 4px 15px rgba(255,255,255,0.3)"
                  : "none"
              }
            >
              📦 Inventario
            </Button>
            <Button
              onClick={() => setView("repairs")}
              bg={view === "repairs" ? "white" : "rgba(255, 255, 255, 0.15)"}
              color={view === "repairs" ? "#8b5cf6" : "white"}
              _hover={{
                bg:
                  view === "repairs" ? "gray.100" : "rgba(255, 255, 255, 0.25)",
                transform: "translateY(-2px)",
              }}
              fontWeight="bold"
              transition="all 0.3s"
              px={6}
              boxShadow={
                view === "repairs" ? "0 4px 15px rgba(255,255,255,0.3)" : "none"
              }
            >
              🛠️ Reparaciones
            </Button>
            <Button
              variant="outline"
              borderColor="white"
              borderWidth="2px"
              color="white"
              _hover={{
                bg: "rgba(255, 255, 255, 0.15)",
                transform: "translateY(-2px)",
              }}
              onClick={onLogout}
              fontWeight="bold"
              px={6}
              transition="all 0.3s"
            >
              🚪 Cerrar Sesión
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        {view === "home" && (
          <Box>
            <Heading size="2xl" mb={8} color="white" fontWeight="bold">
              Panel de Control
            </Heading>

            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={8}
            >
              {/* Card Inventario - más vibrante */}
              <Box
                bgGradient="linear(135deg, #10b981, #059669)"
                p={10}
                borderRadius="3xl"
                cursor="pointer"
                onClick={() => setView("inventory")}
                transition="all 0.3s"
                _hover={{
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(16, 185, 129, 0.4)",
                }}
                position="relative"
                overflow="hidden"
                border="2px solid"
                borderColor="green.400"
              >
                <Box
                  position="absolute"
                  top="-20"
                  right="-20"
                  fontSize="250px"
                  opacity={0.15}
                >
                  📦
                </Box>
                <Box position="relative" zIndex={1}>
                  <Box
                    bg="rgba(255, 255, 255, 0.2)"
                    w="fit-content"
                    p={4}
                    borderRadius="2xl"
                    mb={4}
                    backdropFilter="blur(10px)"
                  >
                    <Text fontSize="5xl">📦</Text>
                  </Box>
                  <Heading size="2xl" mb={3} color="white" fontWeight="bold">
                    Inventario
                  </Heading>
                  <Text color="white" fontSize="lg" mb={4} opacity={0.95}>
                    Gestiona todos los equipos y dispositivos del sistema.
                    Agregar, editar y consultar el estado del inventario.
                  </Text>
                  <Button
                    mt={2}
                    bg="white"
                    color="green.600"
                    _hover={{ bg: "green.50", transform: "scale(1.05)" }}
                    size="lg"
                    fontWeight="bold"
                    px={8}
                    boxShadow="0 4px 15px rgba(255,255,255,0.3)"
                    transition="all 0.2s"
                  >
                    Ver Inventario →
                  </Button>
                </Box>
              </Box>

              {/* Card Reparaciones - más vibrante */}
              <Box
                bgGradient="linear(135deg, #8b5cf6, #7c3aed)"
                p={10}
                borderRadius="3xl"
                cursor="pointer"
                onClick={() => setView("repairs")}
                transition="all 0.3s"
                _hover={{
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)",
                }}
                position="relative"
                overflow="hidden"
                border="2px solid"
                borderColor="purple.400"
              >
                <Box
                  position="absolute"
                  top="-20"
                  right="-20"
                  fontSize="250px"
                  opacity={0.15}
                >
                  🛠️
                </Box>
                <Box position="relative" zIndex={1}>
                  <Box
                    bg="rgba(255, 255, 255, 0.2)"
                    w="fit-content"
                    p={4}
                    borderRadius="2xl"
                    mb={4}
                    backdropFilter="blur(10px)"
                  >
                    <Text fontSize="5xl">🛠️</Text>
                  </Box>
                  <Heading size="2xl" mb={3} color="white" fontWeight="bold">
                    Reparaciones
                  </Heading>
                  <Text color="white" fontSize="lg" mb={4} opacity={0.95}>
                    Administra el flujo de reparaciones. Desde la recepción
                    hasta la entrega de equipos.
                  </Text>
                  <Button
                    mt={2}
                    bg="white"
                    color="purple.600"
                    _hover={{ bg: "purple.50", transform: "scale(1.05)" }}
                    size="lg"
                    fontWeight="bold"
                    px={8}
                    boxShadow="0 4px 15px rgba(255,255,255,0.3)"
                    transition="all 0.2s"
                  >
                    Ver Reparaciones →
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Accesos rápidos móvil */}
            <Box display={{ base: "block", md: "none" }} mt={6}>
              <Stack gap={4}>
                <Button
                  onClick={() => setView("inventory")}
                  bgGradient="linear(to-r, #10b981, #059669)"
                  color="white"
                  _hover={{ transform: "scale(1.02)" }}
                  size="lg"
                  w="100%"
                  fontWeight="bold"
                  py={7}
                  fontSize="lg"
                  boxShadow="0 4px 20px rgba(16, 185, 129, 0.3)"
                >
                  📦 Inventario
                </Button>
                <Button
                  onClick={() => setView("repairs")}
                  bgGradient="linear(to-r, #8b5cf6, #7c3aed)"
                  color="white"
                  _hover={{ transform: "scale(1.02)" }}
                  size="lg"
                  w="100%"
                  fontWeight="bold"
                  py={7}
                  fontSize="lg"
                  boxShadow="0 4px 20px rgba(139, 92, 246, 0.3)"
                >
                  🛠️ Reparaciones
                </Button>
                <Button
                  onClick={onLogout}
                  variant="outline"
                  borderColor="gray.500"
                  borderWidth="2px"
                  color="gray.300"
                  _hover={{ bg: "gray.800", borderColor: "gray.400" }}
                  size="lg"
                  w="100%"
                  fontWeight="bold"
                  py={7}
                  fontSize="lg"
                >
                  🚪 Cerrar Sesión
                </Button>
              </Stack>
            </Box>
          </Box>
        )}

        {view === "inventory" && (
          <Box>
            <Box
              mb={6}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Heading size="2xl" color="white" fontWeight="bold" mb={2}>
                  📦 Gestión de Inventario
                </Heading>
                <Text color="gray.400" fontSize="md">
                  Administra todos los equipos del sistema
                </Text>
              </Box>
              <Button
                onClick={() => setView("home")}
                variant="outline"
                borderColor="gray.600"
                borderWidth="2px"
                color="gray.300"
                _hover={{ bg: "gray.800", borderColor: "gray.500" }}
                display={{ base: "none", md: "flex" }}
                fontWeight="bold"
                px={6}
              >
                ← Volver
              </Button>
            </Box>
            <Box
              bg="#1a1a24"
              p={6}
              borderRadius="2xl"
              border="2px solid"
              borderColor="#2a2a3a"
              boxShadow="0 10px 40px rgba(0,0,0,0.5)"
            >
              <InventoryTable />
            </Box>
          </Box>
        )}

        {view === "repairs" && (
          <Box>
            <Box
              mb={6}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Heading size="2xl" color="white" fontWeight="bold" mb={2}>
                  🛠️ Sistema de Reparaciones
                </Heading>
                <Text color="gray.400" fontSize="md">
                  Gestiona el flujo de reparaciones
                </Text>
              </Box>
              <Button
                onClick={() => setView("home")}
                variant="outline"
                borderColor="gray.600"
                borderWidth="2px"
                color="gray.300"
                _hover={{ bg: "gray.800", borderColor: "gray.500" }}
                display={{ base: "none", md: "flex" }}
                fontWeight="bold"
                px={6}
              >
                ← Volver
              </Button>
            </Box>
            <Box
              bg="#1a1a24"
              p={6}
              borderRadius="2xl"
              border="2px solid"
              borderColor="#2a2a3a"
              boxShadow="0 10px 40px rgba(0,0,0,0.5)"
            >
              <RepairsBoard />
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
