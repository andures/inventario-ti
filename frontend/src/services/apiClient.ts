import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import config from "../config/config";

/**
 * Cliente HTTP con configuración centralizada
 * Maneja tokens, interceptores y errores
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    // Log de la URL base para debugging
    console.log("🔧 API Base URL:", config.apiUrl);
    console.log("🔧 VITE_API_URL:", import.meta.env.VITE_API_URL);

    // Crear instancia de axios con configuración base
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: config.requestTimeout,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Importante para CORS con credentials
    });

    // Configurar interceptores
    this.setupInterceptors();
  }

  /**
   * Configurar interceptores de request y response
   */
  private setupInterceptors() {
    // Request interceptor - Agregar token a cada petición
    this.client.interceptors.request.use(
      (requestConfig) => {
        const token = localStorage.getItem(config.tokenKey);

        if (token && requestConfig.headers) {
          requestConfig.headers.Authorization = `Bearer ${token}`;
        }

        // Log en desarrollo
        if (import.meta.env.DEV) {
          console.log(
            `🌐 ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`
          );
        }

        return requestConfig;
      },
      (error) => {
        console.error("❌ Error en request:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Manejar respuestas y errores
    this.client.interceptors.response.use(
      (response) => {
        // Log en desarrollo
        if (import.meta.env.DEV) {
          console.log(
            `✅ ${response.config.method?.toUpperCase()} ${
              response.config.url
            }`,
            response.data
          );
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Si el error es 401 y no es el endpoint de login
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Intentar renovar el token
            const refreshToken = localStorage.getItem(config.refreshTokenKey);

            if (refreshToken) {
              const response = await this.post(
                config.endpoints.auth.refreshToken,
                {
                  refreshToken,
                }
              );

              const { accessToken, refreshToken: newRefreshToken } =
                response.data.data;

              // Guardar nuevos tokens
              localStorage.setItem(config.tokenKey, accessToken);
              localStorage.setItem(config.refreshTokenKey, newRefreshToken);

              // Reintentar la petición original
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Si falla el refresh, limpiar tokens y redirigir al login
            this.clearAuth();
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }

        // Log del error
        console.error("❌ Error en response:", {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url,
        });

        return Promise.reject(error);
      }
    );
  }

  /**
   * Métodos HTTP
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get<T = any>(
    url: string,
    requestConfig?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, requestConfig);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async post<T = any>(
    url: string,
    data?: unknown,
    requestConfig?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, requestConfig);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async put<T = any>(
    url: string,
    data?: unknown,
    requestConfig?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, requestConfig);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async delete<T = any>(
    url: string,
    requestConfig?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, requestConfig);
  }

  /**
   * Métodos de utilidad para autenticación
   */
  setAuthToken(token: string) {
    localStorage.setItem(config.tokenKey, token);
  }

  setRefreshToken(token: string) {
    localStorage.setItem(config.refreshTokenKey, token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem(config.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(config.refreshTokenKey);
  }

  clearAuth() {
    localStorage.removeItem(config.tokenKey);
    localStorage.removeItem(config.refreshTokenKey);
    localStorage.removeItem(config.userKey);
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Exportar instancia única (singleton)
const apiClient = new ApiClient();
export default apiClient;
