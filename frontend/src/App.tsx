import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, Container } from "@chakra-ui/react";
import { LoginForm } from "./components/auth/LoginForm.tsx";
import { RegisterForm } from "./components/auth/RegisterForm.tsx";
import { Dashboard } from "./components/dashboard/Dashboard";
import { UploadImage } from "./components/inventory/UploadImage.tsx";
import "./App.css";

interface User {
  nombre: string;
  email: string;
  rol: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Verificar si hay usuario autenticado al cargar
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLoginSuccess = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  };

  const handleRegisterSuccess = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Routes>
      {/* Ruta pública para subir imágenes desde QR */}
      <Route path="/upload-image/:itemId" element={<UploadImage />} />

      {/* Rutas principales */}
      <Route
        path="/*"
        element={
          isAuthenticated && user ? (
            <Dashboard onLogout={handleLogout} user={user} />
          ) : (
            <Box
              position="fixed"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgGradient="linear(to-br, gray.950, gray.900, black)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
            >
              {/* Decorative Background - Dark Mode */}
              <Box
                position="absolute"
                top="-20%"
                right="-5%"
                width={{ base: "500px", md: "700px" }}
                height={{ base: "500px", md: "700px" }}
                bgGradient="radial(blue.500, purple.600, transparent)"
                borderRadius="50%"
                filter="blur(120px)"
                opacity={0.15}
                zIndex={0}
              />
              <Box
                position="absolute"
                bottom="-20%"
                left="-5%"
                width={{ base: "450px", md: "650px" }}
                height={{ base: "450px", md: "650px" }}
                bgGradient="radial(cyan.500, blue.600, transparent)"
                borderRadius="50%"
                filter="blur(120px)"
                opacity={0.12}
                zIndex={0}
              />
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                width={{ base: "600px", md: "900px" }}
                height={{ base: "600px", md: "900px" }}
                bgGradient="radial(purple.500, transparent)"
                borderRadius="50%"
                filter="blur(140px)"
                opacity={0.08}
                zIndex={0}
              />

              <Container
                maxW={{ base: "95%", md: "90%", lg: "85%", xl: "1200px" }}
                position="relative"
                zIndex={1}
                px={{ base: 4, md: 0 }}
                py={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Box w="100%">
                  {showRegister ? (
                    <RegisterForm
                      onSwitchToLogin={() => setShowRegister(false)}
                      onRegisterSuccess={handleRegisterSuccess}
                    />
                  ) : (
                    <LoginForm
                      onSwitchToRegister={() => setShowRegister(true)}
                      onLoginSuccess={handleLoginSuccess}
                    />
                  )}
                </Box>
              </Container>
            </Box>
          )
        }
      />
    </Routes>
  );
}

export default App;
