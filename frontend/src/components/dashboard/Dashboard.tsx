import { useState } from "react";
import { Box, Button, Container, Heading, Stack } from "@chakra-ui/react";
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
    <Box minH="100vh" bg="gray.950" color="gray.100">
      <Box bg="blue.700" color="white" p={4}>
        <Container
          maxW="container.xl"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Heading size="md">📦 Inventario TI</Heading>
            <Box fontSize="sm">
              Bienvenido, {user.nombre} ({user.rol})
            </Box>
          </Box>
          <Stack direction="row" gap={2}>
            <Button
              onClick={() => setView("inventory")}
              bg="white"
              color="blue.700"
              _hover={{ bg: "gray.100" }}
            >
              Inventario
            </Button>
            <Button
              onClick={() => setView("repairs")}
              bg="white"
              color="blue.700"
              _hover={{ bg: "gray.100" }}
            >
              Reparación
            </Button>
            <Button
              variant="outline"
              borderColor="white"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={onLogout}
            >
              Cerrar Sesión
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        {view === "home" && (
          <Box
            bg="gray.900"
            p={6}
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.800"
          >
            <Heading size="sm" mb={3}>
              Elige un módulo
            </Heading>
            <Stack direction={{ base: "column", md: "row" }} gap={3}>
              <Button
                onClick={() => setView("inventory")}
                bg="green.600"
                color="white"
                _hover={{ bg: "green.500" }}
              >
                📦 Inventario
              </Button>
              <Button
                onClick={() => setView("repairs")}
                bg="purple.600"
                color="white"
                _hover={{ bg: "purple.500" }}
              >
                🛠️ Reparación
              </Button>
            </Stack>
          </Box>
        )}

        {view === "inventory" && (
          <Box
            bg="gray.900"
            p={6}
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.800"
          >
            <InventoryTable />
          </Box>
        )}

        {view === "repairs" && (
          <Box
            bg="gray.900"
            p={6}
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.800"
          >
            <RepairsBoard />
          </Box>
        )}
      </Container>
    </Box>
  );
}
