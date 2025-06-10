const __vite__mapDeps = (i, m=__vite__mapDeps, d=(m.f || (m.f = ["_astro/vendor-charts.BepbI3ou.js", "_astro/vendor.CwhrWGr6.js", "_astro/vendor-react.BjakChMs.js"]))) => i.map(i => d[i]);
import {j as e, r as d, B, P as k} from "./vendor-react.BjakChMs.js";
import {a as S} from "./apiService.CS3_UAep.js";
import {b4 as D} from "./vendor.CwhrWGr6.js";
import {t as i, getCurrentLanguage as J} from "./config.DUTcyYPh.js";

// Eliminamos la importación directa que causa el problema
// import {C as Y, l as U, p as G, m as H} from "./vendor-charts.BepbI3ou.js";

const K = typeof window < "u";
let I = {};
let chartComponentsLoaded = false;

async function z() {
    if (!K) {
        console.log("⏩ Saltando registro de Chart.js en entorno SSR");
        return false;
    }
    try {
        const r = await D( () => import("./vendor-charts.BepbI3ou.js").then(s => s.n), __vite__mapDeps([0, 1, 2]));
        I = r.Chart,
        I.register(r.CategoryScale, r.LinearScale, r.PointElement, r.LineElement, r.BarElement, r.ArcElement, r.DoughnutController, r.PieController, r.BarController, r.LineController, r.ScatterController, r.RadarController, r.TimeScale, r.Tooltip, r.Legend);
        
        // Ahora registramos los componentes directamente aquí
        if (r.C && r.l && r.p && r.m) {
            r.C.register(r.l, r.p, r.m);
        }
        chartComponentsLoaded = true;
        console.log("✅ Componentes de Chart.js registrados correctamente");
        return true;
    } catch (r) {
        console.error("Error al cargar Chart.js:", r);
        return false;
    }
}

const F = ({title: r, value: s, color: o, darkMode: l, translationKey: t}) => {
    const a = localStorage.getItem("userLanguage") || "es"
      , m = t ? i(t, a) : r;
    return e.jsxs("div", {
        className: `${o}`,
        style: {
            width: "100%",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginBottom: "0.5rem",
            border: l ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
        },
        children: [e.jsx("h3", {
            style: {
                color: "white",
                fontWeight: "bold",
                marginBottom: "0.25rem"
            },
            children: m
        }), e.jsx("p", {
            style: {
                color: "white",
                fontSize: "1.75rem",
                fontWeight: "bold",
                margin: "0",
                padding: "0"
            },
            children: s
        })]
    })
};

const M = ({number: r, title: s, darkMode: o=!1, translationKey: l}) => {
    const t = localStorage.getItem("userLanguage") || "es"
      , a = l ? i(l, t) : s;
    return e.jsxs("div", {
        className: "section-header",
        style: {
            display: "flex",
            alignItems: "center",
            marginBottom: "1rem",
            marginTop: "1.5rem",
            borderBottom: o ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
            paddingBottom: "0.5rem"
        },
        children: [e.jsx("div", {
            style: {
                backgroundColor: "var(--color-primary)",
                color: "white",
                width: "1.75rem",
                height: "1.75rem",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginRight: "0.75rem",
                fontWeight: "bold"
            },
            children: r
        }), e.jsx("h2", {
            style: {
                margin: "0",
                fontSize: "1.25rem",
                fontWeight: "bold",
                color: o ? "#fff" : "#333"
            },
            children: a
        })]
    })
};

// Resto del archivo sigue igual...
// ...

// IMPORTANTE: Eliminamos la línea problemática:
// Y.register(U, G, H);

const re = ({darkMode: r=!1}) => {
    const s = J()
      , [o,l] = d.useState(null)
      , [t,a] = d.useState(null)
      , [m,f] = d.useState(null)
      , [n,c] = d.useState(!0)
      , [u,h] = d.useState(null);
    if (d.useEffect( () => {
        (async () => {
            try {
                c(!0),
                console.log("Obteniendo datos para ResumenOriginalCard desde endpoint optimizado...");
                const w = await S.get("/dashboard/resumen-card");
                l(w.stats),
                a(w.animales_detallados),
                f(w.periodo),
                console.log("Datos obtenidos correctamente desde endpoint optimizado"),
                c(!1),
                h(null)
            } catch (w) {
                console.error("Error al obtener datos para ResumenOriginalCard:", w),
                c(!1),
                h(w)
            }
        }
        )()
    }, []),
    n)
        return e.jsx("div", {
            className: "card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md w-full mb-5 animate-pulse",
            children: e.jsx("div", {
                className: "h-32 bg-gray-200 dark:bg-gray-700 rounded w-full"
            })
        });
    if (u)
        return e.jsx("div", {
            className: "card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md w-full mb-5",
            children: e.jsx("div", {
                className: "text-red-500 dark:text-red-400",
                children: "Error al cargar datos"
            })
        });
    const g = o?.por_genero || {}
      , p = o?.por_estado || {}
      , v = o?.por_explotacion || []
      , E = o?.alletar || {}
      , N = o?.partos || {}
      , T = m?.mes || ""
      , $ = m?.anyo || ""
      , C = t?.detalles || {}
      , V = {
        labels: v?.map(w => w.explotacion) || [],
        datasets: [{
            label: "Animales por explotación",
            data: v?.map(w => w.total) || [],
            backgroundColor: ["rgba(54, 162, 235, 0.8)", "rgba(255, 99, 132, 0.8)", "rgba(255, 206, 86, 0.8)", "rgba(75, 192, 192, 0.8)", "rgba(153, 102, 255, 0.8)"],
            borderWidth: 1
        }]
    };
    return e.jsxs("div", {
        className: "p-1",
        children: [e.jsxs("div", {
            className: "flex flex-wrap gap-2 items-center justify-between mb-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow",
            children: [e.jsx("h2", {
                className: "text-xl font-bold flex-1 md:text-2xl dark:text-white",
                children: s === "ca" ? "Resum d'explotació" : "Resumen de explotación"
            }), e.jsxs("span", {
                className: "text-sm text-gray-500 dark:text-gray-400 font-medium",
                children: [s === "ca" ? "Dades de " : "Datos de ", e.jsx("span", {
                    className: "font-semibold",
                    children: `${T} ${$}`
                })]
            })]
        }), e.jsxs("div", {
            className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-5",
            children: [e.jsx("div", {
                className: "stats-card bg-gradient-to-r from-green-500 to-green-700",
                children: e.jsx(F, {
                    title: "Total de animales",
                    value: o?.total || 0,
                    color: "text-white",
                    translationKey: "dashboard.total_animals"
                })
            }), e.jsx("div", {
                className: "stats-card bg-gradient-to-r from-blue-500 to-blue-700",
                children: e.jsx(F, {
                    title: "Explotaciones activas",
                    value: o?.explotaciones || 0,
                    color: "text-white",
                    translationKey: "dashboard.active_farms"
                })
            }), e.jsx("div", {
                className: "stats-card bg-gradient-to-r from-purple-500 to-purple-700",
                children: e.jsx(F, {
                    title: "Total de partos",
                    value: o?.total_partos || 0,
                    color: "text-white",
                    translationKey: "dashboard.total_births"
                })
            })]
        }), e.jsx(M, {
            number: "1",
            title: "Resumen general",
            darkMode: r,
            translationKey: "dashboard.summary"
        }), e.jsx("div", {
            className: "stats-grid-lg",
            children: e.jsx(re, {
                darkMode: r
            })
        }), e.jsx(M, {
            number: "2",
            title: "Análisis de Partos",
            darkMode: r,
            translationKey: "dashboard.partos_analysis"
        }), e.jsxs("div", {
            className: "combined-stats-grid",
            children: [e.jsx("div", {
                style: {
                    display: "contents"
                },
                children: e.jsx(ee, {
                    statsData: o,
                    partosData: N,
                    darkMode: r,
                    loading: n,
                    error: u
                })
            }), e.jsx("div", {})]
        })]
    })
}
;

const le = ({}) => {
    z(); // Aseguramos que se llama a la inicialización de Chart.js
    
    const [s,o] = d.useState(!1)
      , l = J()
      , [t,a] = d.useState(null)
      , [m,f] = d.useState(null)
      , [n,c] = d.useState(null)
      , [u,h] = d.useState({
        stats: !0,
        partos: !0,
        explotaciones: !0
    })
      , [g,p] = d.useState({
        stats: null,
        partos: null,
        explotaciones: null
    });
    
    // Resto del archivo sigue igual...
    // ...
    
    return e.jsx("div", {
        className: "px-4 py-4",
        children: e.jsxs("div", {
            className: "max-w-7xl mx-auto",
            children: [e.jsx(M, {
                number: "1",
                title: "Estadísticas",
                darkMode: s,
                translationKey: "dashboard.statistics"
            }), e.jsx("div", {
                className: "stats-grid",
                children: e.jsx(Q, {
                    statsData: t,
                    darkMode: s,
                    loading: u.stats,
                    error: g.stats
                })
            }), e.jsx(M, {
                number: "2",
                title: "Distribución por Género",
                darkMode: s,
                translationKey: "dashboard.gender_distribution"
            }), e.jsx("div", {
                className: "stats-grid",
                children: e.jsx(x, {
                    statsData: t,
                    darkMode: s,
                    loading: u.stats,
                    error: g.stats
                })
            }), e.jsx(M, {
                number: "3",
                title: "Distribución por Estado",
                darkMode: s,
                translationKey: "dashboard.status_distribution"
            }), e.jsx("div", {
                className: "stats-grid",
                children: e.jsx(Z, {
                    statsData: t,
                    darkMode: s,
                    loading: u.stats,
                    error: g.stats
                })
            }), e.jsx(M, {
                number: "4",
                title: "Explotaciones",
                darkMode: s,
                translationKey: "dashboard.farms"
            }), e.jsx("div", {
                className: "stats-grid",
                children: e.jsx(O, {
                    explotacionesData: m,
                    darkMode: s,
                    loading: u.explotaciones,
                    error: g.explotaciones
                })
            }), e.jsx(M, {
                number: "5",
                title: "Estado de Amamantamiento",
                darkMode: s,
                translationKey: "dashboard.nursing_status"
            }), e.jsx("div", {
                className: "stats-grid",
                children: e.jsx(R, {
                    statsData: t,
                    darkMode: s,
                    loading: u.stats,
                    error: g.stats
                })
            }), e.jsx(M, {
                number: "6",
                title: "Resumen general",
                darkMode: s,
                translationKey: "dashboard.summary"
            }), e.jsx("div", {
                className: "stats-grid-lg",
                children: e.jsx(re, {
                    darkMode: s
                })
            }), e.jsx(M, {
                number: "2",
                title: "Análisis de Partos",
                darkMode: s,
                translationKey: "dashboard.partos_analysis"
            }), e.jsxs("div", {
                className: "combined-stats-grid",
                children: [e.jsx("div", {
                    style: {
                        display: "contents"
                    },
                    children: e.jsx(ee, {
                        statsData: t,
                        partosData: n,
                        darkMode: s,
                        loading: u.stats || u.partos,
                        error: g.stats || g.partos
                    })
                }), e.jsx("div", {})]
            })]
        })
    })
}
;
export {le as default};
