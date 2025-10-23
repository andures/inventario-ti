/**
 * Configuración centralizada de la aplicación
 */

const config = {
  // URL del API Backend
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",

  // Información de la aplicación
  appName: import.meta.env.VITE_APP_NAME || "Inventario TI",
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",

  // Endpoints del API
  endpoints: {
    auth: {
      login: "/auth/login",
      register: "/auth/registrar",
      logout: "/auth/logout",
      me: "/auth/me",
      refreshToken: "/auth/refresh-token",
      forgotPassword: "/auth/olvide-password",
      resetPassword: "/auth/reset-password",
    },
    users: {
      list: "/users",
      byId: (id: string) => `/users/${id}`,
      updateRole: (id: string) => `/users/${id}/rol`,
      updateStatus: (id: string) => `/users/${id}/estado`,
      delete: (id: string) => `/users/${id}`,
    },
    inventario: {
      list: "/inventario",
      byId: (id: string) => `/inventario/${id}`,
      create: "/inventario",
      update: (id: string) => `/inventario/${id}`,
      delete: (id: string) => `/inventario/${id}`,
    },
    reparaciones: {
      list: "/reparaciones",
      byId: (id: string) => `/reparaciones/${id}`,
      create: "/reparaciones",
      update: (id: string) => `/reparaciones/${id}`,
      delete: (id: string) => `/reparaciones/${id}`,
    },
  },

  // Configuración de tokens
  tokenKey: "accessToken",
  refreshTokenKey: "refreshToken",
  userKey: "user",

  // Tiempo de espera para requests (ms)
  requestTimeout: 30000,

  // Roles de usuario
  roles: {
    ADMIN: "administrador_ti",
    TI: "ti",
  },
};

export default config;
