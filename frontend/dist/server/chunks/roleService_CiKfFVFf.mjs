import { jwtDecode } from 'jwt-decode';
import { e as getCurrentUser } from './Footer_CbdEWwuE.mjs';

const getToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return localStorage.getItem("token");
  } catch (e) {
    console.warn("Error al acceder a localStorage:", e);
    return null;
  }
};
function extractRoleFromToken() {
  try {
    const token = getToken();
    if (!token) {
      console.warn("No hay token JWT disponible");
      return "usuario";
    }
    const decoded = jwtDecode(token);
    console.log("Token decodificado:", decoded);
    if (decoded.username && decoded.username.toLowerCase() === "ramon") {
      console.log("⭐ USUARIO RAMON DETECTADO por username, asignando rol Ramon");
      return "Ramon";
    }
    if (decoded.sub && decoded.sub.toLowerCase() === "ramon") {
      console.log("⭐ USUARIO RAMON DETECTADO por sub, asignando rol Ramon");
      return "Ramon";
    }
    if (decoded.sub && decoded.sub.toLowerCase() === "admin") {
      console.log("Usuario admin detectado en sub, asignando rol administrador");
      return "administrador";
    }
    if (decoded.username === "admin") {
      console.log("Usuario admin detectado en username, asignando rol administrador");
      return "administrador";
    }
    if (decoded.role) {
      console.log("Rol en el token (sin procesar):", decoded.role, `(tipo: ${typeof decoded.role})`);
      if (typeof decoded.role === "string" && decoded.role.includes("UserRole.")) {
        console.log("Detectado formato UserRole.XXXX");
        const rolePart = decoded.role.split(".")[1];
        console.log("Parte del rol extraída:", rolePart);
        if (rolePart === "ADMIN") {
          console.log("Mapeando ADMIN a administrador");
          return "administrador";
        }
        if (rolePart === "GERENTE" || rolePart === "RAMON") {
          console.log("Mapeando GERENTE/RAMON a Ramon");
          return "Ramon";
        }
        if (rolePart === "EDITOR") {
          console.log("Mapeando EDITOR a editor");
          return "editor";
        }
        if (rolePart === "USER") {
          console.log("Mapeando USER a usuario");
          return "usuario";
        }
      }
      if (["administrador", "Ramon", "editor", "usuario"].includes(decoded.role)) {
        console.log("Rol ya normalizado:", decoded.role);
        return decoded.role;
      }
      if (decoded.role === "gerente") {
        console.log("Convertiendo gerente a Ramon");
        return "Ramon";
      }
    }
    if (decoded.sub) {
      console.log("Intentando inferir rol a partir de sub:", decoded.sub);
      if (decoded.sub === "admin") {
        console.log("Usuario admin detectado en sub, asignando rol administrador");
        return "administrador";
      }
      if (decoded.sub === "ramon" || decoded.sub === "Ramon") {
        console.log("Usuario Ramon detectado en sub, asignando rol Ramon");
        return "Ramon";
      }
    }
    console.warn("No se pudo determinar el rol a partir del token, usando valor por defecto");
    return "usuario";
  } catch (error) {
    console.error("Error al extraer rol del token:", error);
    return "usuario";
  }
}
function getCurrentRole() {
  if (typeof window !== "undefined") {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole && ["administrador", "Ramon", "editor", "usuario"].includes(storedRole)) {
      console.log("Rol obtenido de localStorage.userRole:", storedRole);
      return storedRole;
    }
  }
  const tokenRole = extractRoleFromToken();
  console.log("Rol extraído del token JWT:", tokenRole);
  if (tokenRole !== "usuario") {
    return tokenRole;
  }
  const user = getCurrentUser();
  console.log("Usuario actual:", user);
  if (user?.username === "admin") {
    console.log("Usuario admin detectado, asignando rol administrador directamente");
    return "administrador";
  }
  if (user?.role) {
    console.log("Rol del usuario actual:", user.role);
    if (typeof user.role === "string" && user.role.includes("UserRole.")) {
      const rolePart = user.role.split(".")[1];
      if (rolePart === "ADMIN") return "administrador";
      if (rolePart === "GERENTE") return "Ramon";
      if (rolePart === "EDITOR") return "editor";
      if (rolePart === "USER") return "usuario";
    }
    if (typeof user.role === "string" && ["administrador", "Ramon", "editor", "usuario"].includes(user.role)) {
      return user.role;
    }
  }
  if (user?.username) {
    console.log("Determinando rol por nombre de usuario:", user.username);
    if (user.username === "admin") {
      console.log("Usuario admin detectado, asignando rol administrador");
      return "administrador";
    }
    if (user.username === "ramon") return "Ramon";
    if (user.username.includes("editor")) return "editor";
  }
  console.log("No se pudo determinar el rol, usando valor por defecto: usuario");
  return "usuario";
}

export { getCurrentRole as g };
//# sourceMappingURL=roleService_CiKfFVFf.mjs.map
