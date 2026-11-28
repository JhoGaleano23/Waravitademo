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

## Cómo probar la demo

La forma recomendada de probar WaraVita es abrir la aplicación publicada, sin instalar nada:

https://pixel-perfect-picture-7195.lovable.app

Los datos de la cuenta de prueba están en el archivo GithubRepo.txt incluido en la entrega. También se puede crear una cuenta propia desde la pantalla de registro.

## Ejecución local (opcional)

El equipo desarrolló y probó la aplicación en su versión publicada; la ejecución local no fue probada. Para intentarla se necesita Bun (https://bun.sh).

bun install --frozen-lockfile
bun run dev

Abrir la dirección que indica la terminal. La aplicación se conecta a un servicio externo (Lovable Cloud) para la base de datos, la autenticación y las fotos, y el diagnóstico con IA necesita una clave privada (LOVABLE_API_KEY) que no se incluye en el repositorio. Sin esa clave, el diagnóstico con IA no funcionará en una ejecución local.


## Documentación completa

[Documentación del MVP: pantallas, flujo, IA, datos, configuración y limitaciones](docs/MVP_DOCUMENTACION.md).

## Equipo

| Integrante | Rol |
|---|---|
| Diego Martínez | Desarrollador Backend |
| Karol Torres | Frontend y diseño UI/UX |
| Jhoan Galeano | Finanzas y sistemas |
| Juan Duarte | Marketing |
