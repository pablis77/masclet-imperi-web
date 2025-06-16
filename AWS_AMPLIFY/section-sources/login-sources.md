# Estructura de Archivos - Sección LOGIN

*Captura directa de la pestaña Sources del navegador*

## Estructura Completa

```
top/
├── localhost:3000/
│   ├── @fs/C:/Proyectos/claude/masclet-imperi-web/frontend/
│   │   └── entrypoint.js?v=5e89932e
│   ├── @id/
│   │   └── astroscripts/
│   │       ├── _x00_astrotoolbarinternal
│   │       └── _x00_astrotoolbarinternal
│   ├── @vite/
│   │   ├── client
│   │   └── client
│   ├── images/
│   │   ├── logo_masclet.jpg
│   │   ├── logo_masclet.png
│   │   └── vaca_blanca.png
│   ├── node_modules/
│   ├── src/
│   │   ├── components/modals/
│   │   │   ├── PasswordErrorModal.tsx
│   │   │   └── PasswordErrorModal.tsx
│   │   ├── config/
│   │   │   ├── apiConfig.centralizado.ts
│   │   │   └── apiConfig.centralizado.ts
│   │   ├── pages/
│   │   │   ├── login.astro
│   │   │   └── login.astro?astro&type=script...
│   │   ├── services/
│   │   │   ├── apiConfigAdapter.ts
│   │   │   ├── apiConfigAdapter.ts
│   │   │   ├── apiService.ts
│   │   │   └── apiService.ts
│   │   └── styles/
│   │       ├── global.css
│   │       └── lemon-squeezy.css
│   └── login  <!-- Archivo sin extensión visible en la captura -->
└── @react-refresh
    └── @react-refresh
```

## Observaciones importantes

1. El archivo `login` aparece sin extensión visible en la captura
2. La página principal es `login.astro` ubicada en `src/pages/`
3. Los estilos están distribuidos entre:
   - El archivo `login` a nivel raíz de localhost:3000
   - Los archivos CSS en `src/styles/` (global.css y lemon-squeezy.css)
4. No se observa un archivo específico `login.css` con esa nomenclatura exacta

## Implicaciones para create-index.cjs

La detección de `loginCss` debe actualizarse para considerar:
1. El archivo `login` sin extensión visible
2. Posible uso de estilos integrados dentro de `login.astro` sin CSS externo
3. Uso de estilos globales desde `global.css` y `lemon-squeezy.css`
