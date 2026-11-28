# WaraVita

Aplicación web para cuidar y coleccionar plantas nativas colombianas.  
Combina kits de siembra, jardín digital, fichas de cultivo y diagnóstico por foto con IA.  
MVP universitario con datos de demostración en una base real y pagos simulados.

**App publicada:** https://pixel-perfect-picture-7195.lovable.app

## Funcionalidades

| Funcionalidad | Estado |
|---|---|
| Registro, ingreso y cierre de sesión por correo/contraseña | Implementado con autenticación real. |
| Catálogo, búsqueda y filtros | Implementado; ocho especies y ocho kits de ejemplo en base real. |
| Carrito y confirmación de pedido | Carrito local; pedido y plantas persistentes; pago simulado. |
| Mi jardín, herbario y ficha editable | Implementado con datos reales del usuario. |
| Diagnóstico por foto con IA | Integración real con Lovable AI Gateway; modelo configurado `openai/gpt-6-astra`; resultado orientativo. |
| Registro fotográfico y guardado de cuidados | Implementado; fotos privadas y registros en base de datos. |
| Premium | Cambio de plan implementado; COP 15.000/mes mostrado, sin cobro ni renovación real. |
| Recordatorios Premium | Lista real de tareas; envío de notificaciones No implementado. |
| Pasarela de pagos, logística y app móvil nativa | No implementado. |

«Implementado» describe evidencia del código y servicios conectados; no certifica una nueva prueba integral. Para esta revisión pasaron las seis pruebas existentes de reglas y ruta inicial.

## Tecnologías

React 19, TypeScript, TanStack Start/Router v1, TanStack Query v5, Vite, Tailwind CSS v4, componentes shadcn/Radix, Lovable Cloud (PostgreSQL, autenticación y almacenamiento), AI SDK, Zod y Vitest. Gestor de paquetes: Bun. Drizzle Kit está configurado para migraciones SQL; no se usa ORM en las consultas funcionales de la app.

## Instalación y ejecución

Requisitos: Bun compatible con `bun.lock`, internet y configuración del servicio de Lovable Cloud. La versión mínima exacta de Bun es **No determinado**.

Desde la raíz del repositorio:

```bash
bun install --frozen-lockfile
bun run dev
```

Abrir la dirección indicada por Vite. Configurar las variables descritas en la documentación; el diagnóstico necesita `LOVABLE_API_KEY` solo en servidor. La instalación no crea por sí sola las tablas ni el almacenamiento de imágenes.

```bash
bun run test
bun run lint
bun run build
bun run preview
```

**Seguridad:** el README anterior publicaba una contraseña. Aquí se eliminó del texto, pero permanece en el historial; se recomienda cambiarla. No publicar secretos ni credenciales de cuentas.

## Documentación completa

[Documentación del MVP: pantallas, flujo, IA, datos, configuración y limitaciones](docs/MVP_DOCUMENTACION.md).

## Equipo

| Integrante | Rol |
|---|---|
| Diego Martínez | Desarrollador Backend |
| Karol Torres | Frontend y diseño UI/UX |
| Jhoan Galeano | Finanzas y sistemas |
| Juan Duarte | Marketing |
