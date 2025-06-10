import { e as renderers, j as createExports } from './chunks/vendor_Cou4nW0F.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_DXbaK8mS.mjs';
import { manifest } from './manifest_DSM2wWkE.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/animals/edit/_id_.astro.mjs');
const _page2 = () => import('./pages/animals/new.astro.mjs');
const _page3 = () => import('./pages/animals/partos/edit/_id_.astro.mjs');
const _page4 = () => import('./pages/animals/update/_id_.astro.mjs');
const _page5 = () => import('./pages/animals/_id_.astro.mjs');
const _page6 = () => import('./pages/animals.astro.mjs');
const _page7 = () => import('./pages/api/auth-proxy.astro.mjs');
const _page8 = () => import('./pages/api/auth-proxy.astro2.mjs');
const _page9 = () => import('./pages/api/auth-proxy.astro3.mjs');
const _page10 = () => import('./pages/api/proxy.astro.mjs');
const _page11 = () => import('./pages/backup.astro.mjs');
const _page12 = () => import('./pages/dashboard.astro.mjs');
const _page13 = () => import('./pages/dashboard-direct.astro.mjs');
const _page14 = () => import('./pages/dashboard-simple.astro.mjs');
const _page15 = () => import('./pages/dashboard-test.astro.mjs');
const _page16 = () => import('./pages/dashboard2.astro.mjs');
const _page17 = () => import('./pages/diagnostico.astro.mjs');
const _page18 = () => import('./pages/diagnostico-api.astro.mjs');
const _page19 = () => import('./pages/explotaciones-react.astro.mjs');
const _page20 = () => import('./pages/imports.astro.mjs');
const _page21 = () => import('./pages/listados/editar/_id_.astro.mjs');
const _page22 = () => import('./pages/listados/nuevo.astro.mjs');
const _page23 = () => import('./pages/listados/_id_.astro.mjs');
const _page24 = () => import('./pages/listados.astro.mjs');
const _page25 = () => import('./pages/login.astro.mjs');
const _page26 = () => import('./pages/login-test.astro.mjs');
const _page27 = () => import('./pages/logout.astro.mjs');
const _page28 = () => import('./pages/notifications.astro.mjs');
const _page29 = () => import('./pages/partos.astro.mjs');
const _page30 = () => import('./pages/profile.astro.mjs');
const _page31 = () => import('./pages/settings.astro.mjs');
const _page32 = () => import('./pages/test-api.astro.mjs');
const _page33 = () => import('./pages/users.astro.mjs');
const _page34 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/animals/edit/[id].astro", _page1],
    ["src/pages/animals/new.astro", _page2],
    ["src/pages/animals/partos/edit/[id].astro", _page3],
    ["src/pages/animals/update/[id].astro", _page4],
    ["src/pages/animals/[id].astro", _page5],
    ["src/pages/animals/index.astro", _page6],
    ["src/pages/api/auth-proxy/index.ts", _page7],
    ["src/pages/api/auth-proxy.js", _page8],
    ["src/pages/api/auth-proxy.ts", _page9],
    ["src/pages/api/proxy.js", _page10],
    ["src/pages/backup/index.astro", _page11],
    ["src/pages/dashboard.astro", _page12],
    ["src/pages/dashboard-direct.astro", _page13],
    ["src/pages/dashboard-simple.astro", _page14],
    ["src/pages/dashboard-test.astro", _page15],
    ["src/pages/dashboard2.astro", _page16],
    ["src/pages/diagnostico.astro", _page17],
    ["src/pages/diagnostico-api.astro", _page18],
    ["src/pages/explotaciones-react/index.astro", _page19],
    ["src/pages/imports/index.astro", _page20],
    ["src/pages/listados/editar/[id].astro", _page21],
    ["src/pages/listados/nuevo.astro", _page22],
    ["src/pages/listados/[id].astro", _page23],
    ["src/pages/listados/index.astro", _page24],
    ["src/pages/login.astro", _page25],
    ["src/pages/login-test.astro", _page26],
    ["src/pages/logout.astro", _page27],
    ["src/pages/notifications.astro", _page28],
    ["src/pages/partos/index.astro", _page29],
    ["src/pages/profile/index.astro", _page30],
    ["src/pages/settings.astro", _page31],
    ["src/pages/test-api.astro", _page32],
    ["src/pages/users/index.astro", _page33],
    ["src/pages/index.astro", _page34]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "host": "0.0.0.0",
    "port": 3000,
    "client": "file:///C:/Proyectos/claude/masclet-imperi-web/frontend/dist/client/",
    "server": "file:///C:/Proyectos/claude/masclet-imperi-web/frontend/dist/server/",
    "assets": "_astro"
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
