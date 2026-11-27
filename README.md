WaraVita

Ecosistema que une un kit de siembra con una aplicación web/móvil para identificar, cuidar y coleccionar plantas nativas colombianas, con diagnóstico asistido por inteligencia artificial.

Proyecto de la materia Proyecto en Innovación y Emprendimiento en TI, Pontificia Universidad Javeriana (Ingeniería de Sistemas).

Enlaces
App publicada (probar sin instalar): https://pixel-perfect-picture-7195.lovable.app
Repositorio: 
¿Qué es WaraVita?

Muchas personas pierden sus plantas porque no saben qué especie tienen ni cómo cuidarla. WaraVita acompaña al usuario desde la siembra: compra un kit, registra su planta en una enciclopedia digital coleccionable y usa la cámara del celular para recibir un diagnóstico de salud y recomendaciones de cuidado.
Tecnologías

Según la estructura del proyecto:

TanStack Start (React) con TypeScript y Vite
Bun como gestor de paquetes (bun.lock)
Supabase como backend (carpeta supabase) y Drizzle ORM (carpeta drizzle)
Vitest, ESLint y Prettier para pruebas y calidad de código
Construido con Lovable
Instalación local

Requisitos: Node.js (versión 18 o superior) o Bun.
git clone https://github.com/JhoGaleano23/pixel-perfect-picture-7195.git
cd pixel-perfect-picture-7195
npm install      # o: bun install
npm run dev      # o: bun run dev
El archivo .env incluido en el repositorio contiene la configuración necesaria para conectar con el backend.

Cómo probar la demo
Abrir la app publicada: https://pixel-perfect-picture-7195.lovable.app
[CONFIRMAR: si hace falta registrarse, indicar usuario y contraseña de prueba]
Recorrer en este orden: Inicio, Tienda, Mi jardín, Ficha de planta y Diagnóstico con IA.
Para el diagnóstico, subir o tomar una foto de una hoja o planta.
Limitaciones del MVP
Es un prototipo para validar la idea, no un producto final.
 el pago es simulado]
los datos de especies y kits son de ejemplo]
[el diagnóstico de IA es orientativo y puede equivocarse]
Equipo
Integrante	Rol
Diego Martínez	Desarrollador Backend
Karol Torres	Frontend y diseño UI/UX
Jhoan Galeano	Desarrollador Fronted
Juan Duarte	Marketing
