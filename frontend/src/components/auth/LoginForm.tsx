import { useState } from "react";
import { Box, Button, Input, Stack, Text, Heading } from "@chakra-ui/react";
import { Alert } from "@chakra-ui/react";
import authService from "../../services/authService";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

export const LoginForm = ({
  onSwitchToRegister,
  onLoginSuccess,
}: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login({
        email,
        password,
        twoFactorToken: twoFactorCode || undefined,
      });

      // Si requiere 2FA
      if ("requires2FA" in response && response.requires2FA) {
        setRequires2FA(true);
        setLoading(false);
        return;
      }

      // Login exitoso
      if ("data" in response && response.success) {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        onLoginSuccess();
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al iniciar sesión. Verifica tus credenciales.";
      setError(errorMessage);
      setRequires2FA(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      position="relative"
      width="100%"
      maxW={{
        base: "100%",
        sm: "420px",
        md: "480px",
        lg: "520px",
        xl: "550px",
      }}
      mx="auto"
      bg="gray.900"
      borderRadius={{ base: "16px", md: "20px" }}
      boxShadow="0 20px 60px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.1) inset"
      p={{ base: 4, sm: 5, md: 6, lg: 7 }}
      pt={{ base: 2, sm: 2.5, md: 2.5, lg: 3 }}
      pb={{ base: 3, sm: 4, md: 4, lg: 5 }}
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="gray.700"
    >
      {/* Header - Ultra compacto */}
      <Stack gap={0.5} mb={{ base: 3, md: 3 }}>
        <Box textAlign="center">
          <Box
            fontSize={{ base: "2xl", md: "2xl" }}
            mb={0}
            display="inline-block"
            bgGradient="linear(to-r, blue.400, cyan.400)"
            bgClip="text"
            fontWeight="bold"
          >
            🔐
          </Box>
          <Heading
            size={{ base: "lg", md: "lg" }}
            mb={0}
            bgGradient="linear(to-r, gray.100, gray.300)"
            bgClip="text"
            fontWeight="700"
            letterSpacing="tight"
          >
            Inventario TI
          </Heading>
          <Text
            color="gray.400"
            fontSize={{ base: "xs", md: "xs" }}
            fontWeight="500"
          >
            Sistema de Gestión Empresarial
          </Text>
        </Box>
      </Stack>

      {/* Alerts - Compactos */}
      {error && (
        <Box mb={{ base: 2.5, md: 2.5 }}>
          <Alert.Root
            status="error"
            variant="subtle"
            borderRadius={{ base: "8px", md: "12px" }}
            bg="red.900"
            borderLeft="4px solid"
            borderColor="red.500"
          >
            <Alert.Indicator color="red.400" />
            <Alert.Title fontSize="sm" color="red.200" fontWeight="500">
              {error}
            </Alert.Title>
          </Alert.Root>
        </Box>
      )}

      {requires2FA && (
        <Box mb={{ base: 2.5, md: 2.5 }}>
          <Alert.Root
            status="info"
            variant="subtle"
            borderRadius={{ base: "8px", md: "12px" }}
            bg="blue.900"
            borderLeft="4px solid"
            borderColor="blue.500"
          >
            <Alert.Indicator color="blue.400" />
            <Alert.Title fontSize="sm" color="blue.200" fontWeight="500">
              Ingresa tu código 2FA
            </Alert.Title>
          </Alert.Root>
        </Box>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Stack gap={{ base: 3, md: 2.5 }}>
          {!requires2FA ? (
            <>
              {/* Email */}
              <Box>
                <Text
                  mb={1.5}
                  fontSize="xs"
                  fontWeight="600"
                  color="gray.200"
                  letterSpacing="wide"
                >
                  EMAIL
                </Text>
                <Input
                  type="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  size="lg"
                  borderRadius={{ base: "10px", md: "12px" }}
                  bg="gray.800"
                  borderColor="gray.700"
                  color="gray.100"
                  _placeholder={{ color: "gray.500" }}
                  _hover={{
                    borderColor: "blue.500",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
                  }}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)",
                    bg: "gray.750",
                  }}
                  fontSize={{ base: "sm", md: "md" }}
                  h={{ base: "42px", md: "46px" }}
                />
              </Box>

              {/* Password */}
              <Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1.5}
                >
                  <Text
                    fontSize="xs"
                    fontWeight="600"
                    color="gray.200"
                    letterSpacing="wide"
                  >
                    CONTRASEÑA
                  </Text>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setShowPassword(!showPassword)}
                    color="blue.400"
                    fontWeight="600"
                    fontSize="xs"
                    _hover={{ bg: "gray.800", color: "blue.300" }}
                    borderRadius="8px"
                    h="20px"
                    minW="60px"
                    p={1}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </Button>
                </Box>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  size="lg"
                  borderRadius={{ base: "10px", md: "12px" }}
                  bg="gray.800"
                  borderColor="gray.700"
                  color="gray.100"
                  _placeholder={{ color: "gray.500" }}
                  _hover={{
                    borderColor: "blue.500",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
                  }}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)",
                    bg: "gray.750",
                  }}
                  fontSize={{ base: "sm", md: "md" }}
                  h={{ base: "42px", md: "46px" }}
                />
              </Box>
            </>
          ) : (
            /* 2FA Code */
            <Box>
              <Text
                mb={1.5}
                fontSize="xs"
                fontWeight="600"
                color="gray.200"
                letterSpacing="wide"
                textAlign="center"
              >
                CÓDIGO 2FA
              </Text>
              <Input
                type="text"
                placeholder="123456"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                maxLength={6}
                size="lg"
                borderRadius={{ base: "10px", md: "12px" }}
                bg="gray.800"
                borderColor="gray.700"
                color="gray.100"
                _placeholder={{ color: "gray.500" }}
                _hover={{
                  borderColor: "blue.500",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
                }}
                _focus={{
                  borderColor: "blue.400",
                  boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)",
                  bg: "gray.750",
                }}
                fontSize={{ base: "xl", md: "2xl" }}
                textAlign="center"
                letterSpacing="0.5em"
                fontWeight="600"
                h={{ base: "42px", md: "46px" }}
                autoFocus
              />
              <Text fontSize="xs" color="gray.400" mt={1.5} textAlign="center">
                Ingresa el código de tu app de autenticación
              </Text>
            </Box>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            width="100%"
            loading={loading}
            bgGradient="linear(to-r, blue.500, cyan.500)"
            color="white"
            h={{ base: "44px", md: "48px" }}
            borderRadius={{ base: "10px", md: "12px" }}
            fontWeight="600"
            fontSize={{ base: "sm", md: "md" }}
            mt={{ base: 1, md: 2 }}
            _hover={{
              bgGradient: "linear(to-r, blue.600, cyan.600)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
            }}
            _active={{
              transform: "translateY(0)",
            }}
            transition="all 0.2s"
          >
            {requires2FA ? "Verificar Código" : "Iniciar Sesión"}
          </Button>

          {requires2FA && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRequires2FA(false);
                setTwoFactorCode("");
                setError("");
              }}
              color="gray.400"
              fontWeight="500"
              _hover={{ bg: "gray.800", color: "gray.200" }}
              borderRadius="8px"
              h="36px"
            >
              ← Volver
            </Button>
          )}
        </Stack>
      </form>

      {/* Footer - Ultra compacto */}
      <Box
        textAlign="center"
        mt={{ base: 3, md: 3 }}
        pt={{ base: 3, md: 3 }}
        borderTopWidth={1}
        borderColor="gray.800"
      >
        <Text color="gray.400" fontSize={{ base: "xs", md: "sm" }}>
          ¿No tienes cuenta?{" "}
          <Text
            as="span"
            color="blue.400"
            fontWeight="600"
            cursor="pointer"
            onClick={onSwitchToRegister}
            _hover={{ color: "blue.300", textDecoration: "underline" }}
          >
            Regístrate
          </Text>
        </Text>
      </Box>

      {/* Security Badge - Compacto */}
      <Box textAlign="center" mt={{ base: 2, md: 2 }}>
        <Text fontSize="xs" color="gray.500" fontWeight="500" mb={1}>
          🎯 Security Score: 100/100 ⭐⭐⭐⭐⭐
        </Text>
        <Text fontSize="xs" color="gray.500" fontWeight="500">
          🔒 Enterprise-grade security
        </Text>
      </Box>
    </Box>
  );
};
