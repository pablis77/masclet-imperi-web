import {b5 as u} from "./vendor.CwhrWGr6.js";

// Forzamos modo producción y configuramos para servidor externo
let f = "production";
let i = "";

const h = {
    development: {
        protocol: "http",
        host: "127.0.0.1",
        port: "8000",
        path: "/api/v1"
    },
    production: {
        protocol: "http",  
        host: "34.253.203.194",  // URL pública en vez de masclet-api
        port: "8000",
        path: "/api/v1"
    }
};

// Simplificamos la función de obtención de URL base
const m = () => {
    const r = h.production;
    console.log(`[ApiService] Host: ${typeof window !== "undefined" ? window.location.hostname : "server"}, Modo producción: true`);
    return `${r.protocol}://${r.host}${r.port ? ":" + r.port : ""}${r.path}`;
};

// Establecemos la URL base
i = m();
console.log(`[ApiService] URL de backend: ${i}`);

// Creamos la instancia de Axios
const s = u.create({
    baseURL: i,
    headers: {"Content-Type": "application/json"}
});

// Interceptor para añadir token de autenticación
s.interceptors.request.use(e => {
    typeof localStorage !== "undefined" && localStorage.getItem("token") && 
        (e.headers.Authorization = `Bearer ${localStorage.getItem("token")}`);
    e.withCredentials = false;
    console.log(`[API] Petición a: ${e.baseURL}${e.url || ""}`);
    return e;
}, e => Promise.reject(e));

// Interceptor alternativo como backup 
s.interceptors.request.use(e => {
    if (typeof window !== "undefined" && window.localStorage) {
        try {
            const t = localStorage.getItem("token");
            t && (e.headers.Authorization = `Bearer ${t}`);
        } catch (t) {
            console.warn("No se pudo acceder a localStorage:", t);
        }
    }
    return e;
}, e => Promise.reject(e));

// Ninguna funcionalidad de proxy o túnel
const p = false;

// Configurar API con una nueva URL base
function y(e, t = false) {
    i = e;
    s.defaults.baseURL = e;
}

// Función GET con manejo de errores simplificado
async function w(e) {
    try {
        const t = e.startsWith("/") ? e : `/${e}`;
        const a = !t.includes("?") && t.endsWith("/") ? t.slice(0, -1) : t;
        const r = await s.get(a);
        return r.data === void 0 || r.data === null ? 
            Array.isArray(r.data) ? [] : {} : r.data;
    } catch (t) {
        if (u.isAxiosError(t)) {
            console.error(`❌ Error en petición GET a ${e}: ${t.message} (${t.response?.status || "sin status"})`);
        } else {
            console.error(`❌ Error no relacionado con Axios en ${e}: ${t}`);
        }
        
        if (e.includes("list") || e.includes("all") || 
            e.includes("explotacions") || e.includes("animales")) {
            return [];
        }
        return {};
    }
}

// Función POST
async function b(e, t) {
    try {
        const a = e.startsWith("/") ? e : `/${e}`;
        return (await s.post(a, t)).data;
    } catch (a) {
        throw console.error(`Error en petición POST a ${e}:`, a), a;
    }
}

// Función PUT
async function v(e, t) {
    try {
        const a = e.startsWith("/") ? e : `/${e}`;
        return (await s.put(a, t)).data;
    } catch (a) {
        throw console.error(`Error en petición PUT a ${e}:`, a), a;
    }
}

// Función PATCH
async function $(e, t) {
    try {
        const a = e.startsWith("/") ? e : `/${e}`;
        console.log(`Realizando petición PATCH a ${i}${a}`);
        console.log("Datos enviados:", t);
        return (await s.patch(a, t)).data;
    } catch (a) {
        throw console.error(`Error en petición PATCH a ${e}:`, a), a;
    }
}

// Función DELETE
async function U(e) {
    try {
        const t = e.startsWith("/") ? e : `/${e}`;
        return (await s.delete(t)).data;
    } catch (t) {
        throw console.error(`Error en petición DELETE a ${e}:`, t), t;
    }
}

// Funciones de autenticación
async function g() {
    try {
        return typeof window !== "undefined" && window.localStorage ? 
            !!localStorage.getItem("token") : false;
    } catch (e) {
        return console.error("Error al verificar autenticación:", e), false;
    }
}

async function R() {
    try {
        return await g() ? await w("/users/me") : null;
    } catch (e) {
        return console.error("Error al obtener información del usuario:", e), null;
    }
}

// Función de login - IMPORTANTE: NO usa URL externa
async function E(e, t) {
    try {
        const a = new URLSearchParams;
        a.append("username", e);
        a.append("password", t);
        a.append("grant_type", "password");
        
        const r = "/auth/login";
        console.log(`Realizando login a: ${s.defaults.baseURL}${r}`);
        
        // No se usa ninguna URL externa aquí
        const c = await s.post(r, a, {
            headers: {"Content-Type": "application/x-www-form-urlencoded"}
        });
        
        typeof window !== "undefined" && window.localStorage && 
            c.data.access_token && localStorage.setItem("token", c.data.access_token);
        
        return c;
    } catch (a) {
        throw console.error("Error al iniciar sesión:", a), a;
    }
}

// Funciones exportadas
const L = () => i;
const S = {
    get: w,
    post: b,
    put: v,
    patch: $, 
    del: U,
    isAuthenticated: g,
    getUserInfo: R,
    login: E,
    configureApi: y,
    getBaseUrl: L
};

export {S as a, E as l};
