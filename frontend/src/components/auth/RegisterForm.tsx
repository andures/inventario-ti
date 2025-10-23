import { useState } from "react";
import { Box, Button, Input, Stack, Text, Heading } from "@chakra-ui/react";
import { Alert } from "@chakra-ui/react";
import authService from "../../services/authService";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterForm = ({
  onSwitchToLogin,
  onRegisterSuccess,
}: RegisterFormProps) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rol, setRol] = useState("ti");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validar fuerza de contraseña
  const validatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 15;
    if (/[A-Z]/.test(pwd)) strength += 15;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[!@#$%^&*]/.test(pwd)) strength += 30;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    validatePasswordStrength(pwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones locales
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 12) {
      setError("La contraseña debe tener al menos 12 caracteres");
      return;
    }

    if (!/[!@#$%^&*]/.test(password)) {
      setError(
        "La contraseña debe contener al menos un caracter especial (!@#$%^&*)"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        nombre,
        email,
        password,
        rol: rol as "ti" | "administrador_ti",
      });

      // Registro exitoso - guardar tokens
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setSuccess("¡Cuenta creada exitosamente!");

      setTimeout(() => {
        onRegisterSuccess();
      }, 1500);
    } catch (err: unknown) {
      let errorMessage = "Error al crear la cuenta. Intenta de nuevo.";
      if (err instanceof Error && err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "red.500";
    if (passwordStrength < 70) return "yellow.500";
    return "green.500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return "Débil";
    if (passwordStrength < 70) return "Media";
    return "Fuerte";
  };

  return (
    <Box
      position="relative"
      width="100%"
      maxW={{
        base: "100%",
        sm: "480px",
        md: "650px",
        lg: "780px",
        xl: "850px",
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
            bgGradient="linear(to-r, purple.400, pink.400)"
            bgClip="text"
            fontWeight="bold"
          >
            📝
          </Box>
          <Heading
            size={{ base: "lg", md: "lg" }}
            mb={0}
            bgGradient="linear(to-r, gray.100, gray.300)"
            bgClip="text"
            fontWeight="700"
            letterSpacing="tight"
          >
            Crear Cuenta
          </Heading>
          <Text
            color="gray.400"
            fontSize={{ base: "xs", md: "xs" }}
            fontWeight="500"
          >
            Sistema de Inventario TI
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

      {success && (
        <Box mb={{ base: 2.5, md: 2.5 }}>
          <Alert.Root
            status="success"
            variant="subtle"
            borderRadius={{ base: "8px", md: "12px" }}
            bg="green.900"
            borderLeft="4px solid"
            borderColor="green.500"
          >
            <Alert.Indicator color="green.400" />
            <Alert.Title fontSize="sm" color="green.200" fontWeight="500">
              {success}
            </Alert.Title>
          </Alert.Root>
        </Box>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Stack gap={{ base: 3, md: 2.5 }}>
          {/* Grid de 2 columnas para escritorio */}
          <Box
            display="grid"
            gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
            gap={{ base: 3, md: 4 }}
          >
            {/* Nombre */}
            <Box>
              <Text
                mb={1.5}
                fontSize="xs"
                fontWeight="600"
                color="gray.200"
                letterSpacing="wide"
              >
                NOMBRE COMPLETO
              </Text>
              <Input
                type="text"
                placeholder="Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                size="lg"
                borderRadius={{ base: "10px", md: "12px" }}
                bg="gray.800"
                borderColor="gray.700"
                color="gray.100"
                _placeholder={{ color: "gray.500" }}
                _hover={{
                  borderColor: "purple.500",
                  boxShadow: "0 4px 12px rgba(168, 85, 247, 0.2)",
                }}
                _focus={{
                  borderColor: "purple.400",
                  boxShadow: "0 0 0 3px rgba(168, 85, 247, 0.2)",
                  bg: "gray.750",
                }}
                fontSize={{ base: "sm", md: "md" }}
                h={{ base: "42px", md: "46px" }}
              />
            </Box>

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
                placeholder="juan@empresa.com"
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
                  borderColor: "purple.500",
                  boxShadow: "0 4px 12px rgba(168, 85, 247, 0.2)",
                }}
                _focus={{
                  borderColor: "purple.400",
                  boxShadow: "0 0 0 3px rgba(168, 85, 247, 0.2)",
                  bg: "gray.750",
                }}
                fontSize={{ base: "sm", md: "md" }}
                h={{ base: "42px", md: "46px" }}
              />
            </Box>
          </Box>

          {/* Rol - Ancho completo */}
          <Box>
            <Text
              mb={1.5}
              fontSize="xs"
              fontWeight="600"
              color="gray.200"
              letterSpacing="wide"
            >
              ROL
            </Text>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              style={{
                width: "100%",
                height: window.innerWidth < 768 ? "42px" : "46px",
                padding: "0 1rem",
                borderRadius: window.innerWidth < 768 ? "10px" : "12px",
                border: "1px solid #374151",
                fontSize: window.innerWidth < 768 ? "0.875rem" : "1rem",
                color: "#F3F4F6",
                backgroundColor: "#1F2937",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="ti">👤 Personal TI</option>
              <option value="administrador_ti">👨‍💼 Administrador TI</option>
            </select>
          </Box>

          {/* Grid de 2 columnas para contraseñas */}
          <Box
            display="grid"
            gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
            gap={{ base: 3, md: 4 }}
          >
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
                  color="purple.400"
                  fontWeight="600"
                  fontSize="xs"
                  _hover={{ bg: "gray.800", color: "purple.300" }}
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
                placeholder="Mínimo 12 caracteres"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                size="lg"
                borderRadius={{ base: "10px", md: "12px" }}
                bg="gray.800"
                borderColor="gray.700"
                color="gray.100"
                _placeholder={{ color: "gray.500" }}
                _hover={{
                  borderColor: "purple.500",
                  boxShadow: "0 4px 12px rgba(168, 85, 247, 0.2)",
                }}
                _focus={{
                  borderColor: "purple.400",
                  boxShadow: "0 0 0 3px rgba(168, 85, 247, 0.2)",
                  bg: "gray.750",
                }}
                fontSize={{ base: "sm", md: "md" }}
                h={{ base: "42px", md: "46px" }}
              />
            </Box>

            {/* Confirmar Password */}
            <Box>
              <Text
                mb={1.5}
                fontSize="xs"
                fontWeight="600"
                color="gray.200"
                letterSpacing="wide"
              >
                CONFIRMAR CONTRASEÑA
              </Text>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                size="lg"
                borderRadius={{ base: "10px", md: "12px" }}
                bg="gray.800"
                borderColor="gray.700"
                color="gray.100"
                _placeholder={{ color: "gray.500" }}
                _hover={{
                  borderColor: "purple.500",
                  boxShadow: "0 4px 12px rgba(168, 85, 247, 0.2)",
                }}
                _focus={{
                  borderColor: "purple.400",
                  boxShadow: "0 0 0 3px rgba(168, 85, 247, 0.2)",
                  bg: "gray.750",
                }}
                fontSize={{ base: "sm", md: "md" }}
                h={{ base: "42px", md: "46px" }}
              />
            </Box>
          </Box>

          {/* Password Strength - Ancho completo */}
          {password && (
            <Box mt={-1}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Text fontSize="xs" color="gray.400" fontWeight="600">
                  Fuerza de contraseña
                </Text>
                <Text
                  fontSize="xs"
                  color={getPasswordStrengthColor()}
                  fontWeight="700"
                >
                  {getPasswordStrengthText()}
                </Text>
              </Box>
              <Box
                width="100%"
                height="4px"
                bg="gray.800"
                borderRadius="full"
                overflow="hidden"
              >
                <Box
                  width={`${passwordStrength}%`}
                  height="100%"
                  bg={getPasswordStrengthColor()}
                  transition="all 0.3s ease"
                  borderRadius="full"
                />
              </Box>
              <Text fontSize="xs" color="gray.400" mt={1.5}>
                Debe contener: 12+ caracteres, mayúsculas, números y símbolos
              </Text>
            </Box>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            width="100%"
            loading={loading}
            disabled={passwordStrength < 70}
            bgGradient="linear(to-r, purple.500, pink.500)"
            color="white"
            h={{ base: "44px", md: "48px" }}
            borderRadius={{ base: "10px", md: "12px" }}
            fontWeight="600"
            fontSize={{ base: "sm", md: "md" }}
            mt={{ base: 1, md: 2 }}
            _hover={{
              bgGradient: "linear(to-r, purple.600, pink.600)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(168, 85, 247, 0.4)",
            }}
            _active={{
              transform: "translateY(0)",
            }}
            _disabled={{
              opacity: 0.5,
              cursor: "not-allowed",
              _hover: {
                transform: "none",
                boxShadow: "none",
              },
            }}
            transition="all 0.2s"
          >
            Crear Cuenta
          </Button>
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
          ¿Ya tienes cuenta?{" "}
          <Text
            as="span"
            color="purple.400"
            fontWeight="600"
            cursor="pointer"
            onClick={onSwitchToLogin}
            _hover={{ color: "purple.300", textDecoration: "underline" }}
          >
            Inicia sesión
          </Text>
        </Text>
      </Box>

      {/* Security Info - Compacto */}
      <Box textAlign="center" mt={{ base: 2, md: 2 }}>
        <Text fontSize="xs" color="gray.500" fontWeight="500" mb={1}>
          🔒 Contraseñas encriptadas con bcrypt
        </Text>
        <Text fontSize="xs" color="gray.500" fontWeight="500">
          ⏱️ Fuerza bruta: 34,000 años
        </Text>
      </Box>
    </Box>
  );
};
