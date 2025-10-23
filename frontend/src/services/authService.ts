import apiClient from "./apiClient";
import axios from "axios";
import config from "../config/config";

/**
 * Tipos de datos
 */
export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorToken?: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  rol?: "administrador_ti" | "ti";
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: "administrador_ti" | "ti";
  activo: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  requires2FA?: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface TwoFactorResponse {
  success: boolean;
  message: string;
  requires2FA: boolean;
  tempAuth?: {
    email: string;
    userId: string;
  };
}

/**
 * Servicio de Autenticación
 */
class AuthService {
  /**
   * Iniciar sesión
   */
  async login(
    credentials: LoginCredentials
  ): Promise<AuthResponse | TwoFactorResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        config.endpoints.auth.login,
        credentials
      );

      // Guardar tokens y usuario si es exitoso
      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken, user } = response.data.data;
        apiClient.setAuthToken(accessToken);
        apiClient.setRefreshToken(refreshToken);
        localStorage.setItem(config.userKey, JSON.stringify(user));
      }

      return response.data;
    } catch (error: unknown) {
      // Si es 206 (requiere 2FA), retornar la respuesta
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status: number; data: TwoFactorResponse };
        };
        if (axiosError.response?.status === 206) {
          return axiosError.response.data;
        }
      }
      // Mapear errores comunes a mensajes amigables
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data as { message?: string } | undefined;
        let message =
          data?.message ||
          "Error al iniciar sesión. Verifica tus credenciales.";

        switch (status) {
          case 400:
            // Validación u otros
            message = data?.message || "Solicitud inválida";
            break;
          case 401:
            // No autorizado: usuario no encontrado, password malo, 2FA inválido o usuario inactivo
            // El backend ya envía mensajes específicos; usarlos.
            message = data?.message || "Credenciales inválidas";
            break;
          case 403:
            message = data?.message || "Acceso denegado";
            break;
          case 429:
            message = "Demasiados intentos. Inténtalo más tarde.";
            break;
          case 0:
          default:
            if (error.code === "ERR_NETWORK") {
              message = "No se pudo conectar con el servidor.";
            }
            break;
        }

        throw new Error(message);
      }

      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Error al iniciar sesión");
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        config.endpoints.auth.register,
        data
      );

      // Guardar tokens y usuario
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        apiClient.setAuthToken(accessToken);
        apiClient.setRefreshToken(refreshToken);
        localStorage.setItem(config.userKey, JSON.stringify(user));
      }

      return response.data;
    } catch (error: unknown) {
      // Mapear el mensaje del servidor para mostrarlo en la UI
      let message = "Error al crear la cuenta. Intenta de nuevo.";

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        // Intentar obtener el mensaje específico del backend
        const data = error.response?.data as
          | {
              message?: string;
              errors?: Array<{ field?: string; message: string }>;
            }
          | undefined;
        const serverMessage = data?.message;
        if (serverMessage) {
          message = serverMessage;
          // Si vienen errores detallados de validación, intenta mostrar el primero
          if (data?.errors?.length) {
            const first = data.errors[0];
            if (first?.message) {
              message = first.message;
            }
          }
        } else if (status === 409 || status === 400) {
          // Caso común: email ya registrado
          message = "El email ya está registrado";
        } else if (error.message) {
          message = error.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      throw new Error(message);
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(config.endpoints.auth.logout);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      // Limpiar tokens y usuario del localStorage
      apiClient.clearAuth();
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>(
      config.endpoints.auth.me
    );

    // Actualizar usuario en localStorage
    if (response.data.success) {
      localStorage.setItem(config.userKey, JSON.stringify(response.data.data));
    }

    return response.data.data;
  }

  /**
   * Renovar access token
   */
  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = apiClient.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<{
      success: boolean;
      data: { accessToken: string; refreshToken: string };
    }>(config.endpoints.auth.refreshToken, { refreshToken });

    if (response.data.success) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      apiClient.setAuthToken(accessToken);
      apiClient.setRefreshToken(newRefreshToken);
    }

    return response.data.data;
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(config.endpoints.auth.forgotPassword, { email });
  }

  /**
   * Resetear contraseña
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.put(`${config.endpoints.auth.resetPassword}/${token}`, {
      password,
    });
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Obtener usuario del localStorage
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem(config.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Verificar si el usuario es administrador
   */
  isAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.rol === config.roles.ADMIN;
  }
}

// Exportar instancia única (singleton)
const authService = new AuthService();
export default authService;
