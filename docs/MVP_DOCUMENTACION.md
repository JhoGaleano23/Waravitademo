# Documentación del MVP de WaraVita

**Entrega universitaria — revisión del 28 de noviembre de 2026.**

## Alcance y evidencia

Documento del MVP de WaraVita. Describe las pantallas, el flujo de servicios, el diagnóstico con IA, el modelo de datos, la configuración y las limitaciones del prototipo.

**Estados:** «Funciona» significa que hay implementación conectada a datos o servicios reales, no una maqueta; no equivale a certificar una nueva prueba completa de usuario en esta revisión. «Simulado» identifica acciones sin operación comercial real. «No implementado» indica ausencia en el código revisado. Cuando no hay evidencia suficiente se usa «No determinado».

## A. Descripción general

WaraVita es una aplicación web para acompañar el cuidado y la colección de plantas nativas colombianas.  
Combina un catálogo de kits de siembra con un jardín digital, fichas de cultivo y registro fotográfico.  
Busca reducir la incertidumbre sobre la especie y el cuidado de una planta mediante recomendaciones asistidas por IA.  
El MVP permite simular la compra de kits y activar un plan Premium, sin realizar cobros reales.

## B. Pantallas implementadas

Las rutas indicadas son las URL del usuario: `_authenticated` es un agrupador interno sin segmento visible. Inicio, tienda, carrito, jardín, ficha, diagnóstico, perfil y recordatorios requieren sesión.

| Pantalla | Ruta | Qué puede hacer el usuario | De dónde salen los datos | Estado |
|---|---|---|---|---|
| Presentación pública | `/` | Leer la propuesta, ver el equipo y acceder a la cuenta; con sesión se redirige a Inicio. | Texto, cifras e imágenes de ejemplo en `Landing.tsx`; sesión del servicio de autenticación. | Funciona; cifras informativas sin fuente confirmada. |
| Sobre WaraVita | `/nosotros` | Ver la misma presentación y el equipo; entrar a la app. | Contenido estático de `Landing.tsx` y sesión real. | Funciona. |
| Inicio de sesión | `/auth` | Ingresar con correo y contraseña; cambiar al formulario de registro. | Servicio real de autenticación de Lovable Cloud. | Funciona. |
| Registro | `/auth` (modo registro) | Enviar nombre, correo y contraseña; ver aviso de confirmación si no se devuelve sesión. | Autenticación real; `handle_new_user()` crea `profiles`. Entrega efectiva del correo en esta revisión: No determinado. | Funciona como integración; confirmación depende de la configuración del servicio. |
| Inicio | `/inicio` | Buscar en la tienda, ver kits destacados, agregarlos al carrito y abrir accesos rápidos. | Base de datos real: `kits` y `especies`, con datos iniciales de ejemplo; imágenes locales. | Funciona. |
| Tienda | `/tienda` | Buscar kits/especies, filtrar por ecosistema y endémicas, agregar kits. | Base de datos real: `kits` y `especies`; filtros en el navegador; imágenes locales. | Funciona con catálogo de ejemplo. |
| Carrito | `/carrito` | Cambiar cantidades, quitar unidades, ver total y confirmar pedido. | Carrito en `localStorage`; `confirmar_pedido()` lee precios reales de `kits` y escribe el pedido y las plantas. | Simulado en el pago; persistencia del pedido y desbloqueo reales. |
| Mi jardín / Herbario Total | `/jardin` (`tab=nuevas` o `tab=herbario`) | Ver plantas propias, progreso por especies distintas, especies bloqueadas y requisitos; Premium ve descripción y ecosistema ampliados. | Base de datos real: `plantas_usuario`, `especies`, `profiles`; imágenes locales de ejemplo. | Funciona. |
| Ficha de planta | `/planta/$id` | Consultar requisitos, fecha de siembra y etapas; editar nombre y etapa; ver fotos y abrir cuidado/recordatorios. | Base de datos real: `plantas_usuario`, `especies`, `registros`; fotos propias en almacenamiento privado. | Funciona. |
| Cuidado y Diagnóstico IA | `/diagnostico/$id` | Capturar/subir foto, añadir descripción, pedir diagnóstico, seleccionar acciones y guardar una nota con la foto. | Planta real en base de datos; cámara/archivo; API de IA real; escritura en `registros` y almacenamiento. | Funciona como integración real; la etiqueta previa «Tejido sano — 98% confianza» es simulada. |
| Perfil | `/perfil` | Ver nombre, correo, plan y análisis restantes; activar Premium y cerrar sesión. No hay formulario para editar el perfil. | `profiles`, correo de autenticación y función `activar_premium()`. | Funciona; cobro y suscripción Premium simulados. |
| Recordatorios | `/recordatorios` | Con Premium, crear riego/abono/revisión para una fecha; consultar, completar y eliminar registros propios. | Base de datos real: `profiles`, `plantas_usuario`, `recordatorios`. | Funciona como lista de tareas; envío de avisos externos No implementado. |

## C. Flujo de servicios del MVP

| Paso | Recorrido y resultado | Código / función que interviene | Lecturas | Escrituras |
|---|---|---|---|---|
| 1 | El visitante entra a `/`; si tiene sesión pasa a `/inicio`. | `src/routes/index.tsx`, `Landing.tsx`, `auth.getSession()`. | Sesión de autenticación; contenido estático. | Ninguna tabla de negocio. |
| 2 | Se registra o inicia sesión con correo y contraseña. | `src/routes/auth.tsx`: `auth.signUp()`, `auth.signInWithPassword()`; trigger `on_auth_user_created` llama a `handle_new_user()`. | Servicio de autenticación. | El servicio gestiona la cuenta; el trigger inserta `profiles` con nombre y plan gratis. |
| 3 | Accede a pantallas privadas. | `src/routes/_authenticated/route.tsx`: `ssr: false`, `auth.getUser()` y redirección a `/auth` si no hay usuario. | Usuario autenticado. | Ninguna. |
| 4 | Consulta destacados o catálogo, busca y filtra. | `inicio.tsx`, `tienda.tsx`; `kitsQuery` / `fetchKits()` de `src/lib/data.ts`. | `kits` unidos a `especies`; orden por precio. | Ninguna. |
| 5 | Agrega un kit, cambia cantidades y ve el total. | `KitCard`, `src/lib/cart.ts`: `cart.add()`, `cart.setCantidad()`; `totalCarrito()` en `reglas.ts`. | Carrito del navegador y valores recibidos del catálogo. | `localStorage`, clave `waravita-carrito`; no hay tabla de carritos. |
| 6 | Confirma el pedido sin cobro. | `carrito.tsx`: repite cada ID según cantidad y llama a `confirmar_pedido(_kit_ids)`. | Función: usuario autenticado, `kits`, `especies`; recalcula total con precios de la base de datos. | `pedidos`; un `pedido_items` y una `plantas_usuario` por cada unidad. `cantidad` queda en 1 por fila; no se agrupa por kit. |
| 7 | Se vacía el carrito y abre Mi jardín con las nuevas plantas. | `cart.clear()`, invalidación de consulta `plantas`, navegación a `/jardin` con parámetro `nuevo`; `plantasQuery`, `especiesQuery`, `perfilQuery`. | `plantas_usuario`, `especies`, `profiles`. | Carrito local vaciado; ninguna escritura adicional en tablas. |
| 8 | Abre una ficha y, si desea, edita nombre o etapa. | `planta.$id.tsx`; `plantaQuery(id)`, `registrosQuery(id)`, función local `guardar()`. | `plantas_usuario` con `especies`; `registros`; URLs firmadas para fotos. | Actualiza `plantas_usuario.nombre_personalizado` y `etapa`; las etapas son manuales. |
| 9 | En «Registrar cuidado» toma/sube una foto y escribe descripción opcional. | `diagnostico.$id.tsx`: `getUserMedia()`, `capturar()`, `onFile()`, `comprimir()`. | Cámara o archivo del usuario. | Foto temporal en memoria; todavía no se sube ni guarda en tablas. |
| 10 | Pulsa «Analizar con IA»; se verifica sesión, propiedad de la planta y cupo. | `useServerFn(diagnosticar)`; `src/start.ts` agrega autorización; `requireSupabaseAuth`; `src/lib/diagnostico.functions.ts`. | Identidad validada; `plantas_usuario` y nombre de `especies`, con filtro por `user_id`. | `consumir_analisis()` actualiza `profiles.analisis_mes` y, al cambiar de mes, `mes_analisis`. Si llegó al límite gratuito devuelve `LIMITE` y no llama a IA. |
| 11 | El servidor envía imagen y contexto a IA y devuelve el resultado. | Importación de `src/lib/ai.server.ts`; `analizarPlanta()`; `streamText()` con `Output.object()`. | Foto, descripción y contexto de la planta; servicio externo de IA. | No guarda el diagnóstico en la base de datos en este paso. |
| 12 | Ve el diagnóstico, selecciona cuidados y añade nota; guarda la bitácora. | `diagnostico.$id.tsx`: estado `diag`, función local `guardar()`, `storage.from("fotos").upload()`. | Usuario autenticado, foto y resultado en memoria. | Archivo JPEG en `fotos` con ruta `usuario/planta/fecha.jpg`; inserta `registros` con `user_id`, `planta_id`, `foto_path`, `diagnostico`, `acciones`, `nota`. |
| 13 | Regresa a la ficha y ve el registro fotográfico. | Invalidación de `registros`; navegación a `/planta/$id`; `registrosQuery(id)` crea URLs firmadas por 3.600 segundos. | `registros` y almacenamiento `fotos`. | Ninguna. La ficha muestra foto, fecha y vigor; no presenta una vista completa de notas/acciones/diagnósticos históricos. |
| 14 | Opcionalmente activa Premium desde Perfil. | `perfil.tsx`: `activar_premium()` e invalidación de `perfilQuery`. | Usuario autenticado, `profiles`. | `profiles.plan = 'premium'`; sin cobro, vencimiento ni renovación. |
| 15 | Con Premium crea y gestiona recordatorios. | `recordatorios.tsx`: `crear()`, `toggle()`, `borrar()`; `recordatoriosQuery`. | `profiles`, `plantas_usuario`, `recordatorios`. | Inserta, actualiza `completado` o elimina `recordatorios`; política de inserción exige Premium y planta propia. |
| 16 | Cierra sesión. | `perfil.tsx`: cancela/limpia consultas, `auth.signOut()`, navegación a `/auth`. | Sesión. | Elimina la sesión del navegador; no borra el jardín. El carrito local no se borra al salir. |

Las consultas privadas se realizan con la sesión del usuario y están sujetas a políticas por fila. Las funciones `confirmar_pedido`, `activar_premium` y `consumir_analisis` ejecutan las operaciones de negocio en la base de datos con `SECURITY DEFINER`. Su definición actual se confirmó mediante consulta de solo lectura.

## D. Tres funcionalidades principales

### 1. Diagnóstico de plantas con IA

La foto y el contexto permiten obtener una especie probable, evaluación de vigor y una acción de cuidado.  
El cliente recibe una respuesta estructurada de una API real, no un resultado fijo después de pulsar Analizar.  
Aporta orientación al cuidado y se vincula a Premium mediante el límite de cinco análisis gratuitos mensuales.  
Funciona como integración; no hay evidencia de validación científica ni garantía de precisión.

### 2. Colección digital y seguimiento de plantas

Cada unidad de kit confirmada crea una planta que aparece en Mi jardín y desbloquea su especie en el herbario.  
El usuario consulta requisitos, cambia manualmente nombre/etapa y acumula fotos con fecha y vigor.  
La colección se conserva en la base de datos real y su progreso se calcula por especies distintas.  
Funciona; no se detecta crecimiento automáticamente ni se registra una planta desde una pantalla independiente.

### 3. Catálogo de kits y pedido

La tienda consulta kits, precios y especies de la base de datos y permite búsqueda y filtros.  
El carrito ajusta cantidades y el pedido confirmado se guarda junto con sus unidades y plantas asociadas.  
Representa la vía de ingresos por kits, pero en este MVP no produce una transacción de dinero.  
El catálogo y la persistencia funcionan; pago, envío físico y operación comercial están simulados o no implementados.

## E. Diagnóstico con IA

### Servicio y modelo configurados

`src/lib/ai.server.ts` configura **Lovable AI Gateway** mediante `@ai-sdk/openai` y la librería `ai`. El identificador que el código envía es **`openai/gpt-6-astra`**, usando `provider.responses(...)`. Este es el modelo configurado en el proyecto; su disponibilidad actual y el modelo subyacente servido en cada solicitud son **No determinado** en esta revisión, que no efectuó nuevas llamadas a IA.

La clave `LOVABLE_API_KEY` se lee en el servidor. El navegador llama a `diagnosticar`, no al proveedor de IA directamente. Se usa `streamText`, pero la app espera el objeto final: no muestra resultados parciales en tiempo real. El código solicita salida estructurada con un esquema Zod y configura `store: false` para el proveedor; la retención efectiva del servicio externo es **No determinado**.

### Entradas

- `plantaId`: permite localizar una planta propia; el servidor obtiene su nombre personalizado y los nombres común/científico registrados.
- `imagen`: cadena `data:image/...`; el servidor exige ese prefijo y rechaza cadenas de más de 6.000.000 caracteres.
- `descripcion`: texto opcional del usuario, recortado a 500 caracteres en el servidor.
- La interfaz reduce el lado mayor a un máximo de 1.024 píxeles, sin ampliar fotos pequeñas, y genera JPEG con calidad 0,82.
- Las instrucciones piden actuar como fitopatólogo de flora colombiana, responder en español sencillo, indicar confianza/vigor entre 0 y 100 y proponer exactamente dos alternativas.

### Salida y presentación

| Campo | Tipo en el esquema | Uso |
|---|---|---|
| `identificada` | booleano | Decide si se muestra especie probable o aviso de foto insuficiente. |
| `especie`, `nombre_cientifico` | texto | Nombre probable y nombre científico. |
| `confianza` | número | Porcentaje de confianza redondeado en la interfaz. |
| `alternativas` | lista de objetos con `especie` y `confianza` | La interfaz muestra como máximo las primeras dos. |
| `vigor`, `estado` | número y texto | Índice de Vigor Fitosanitario y estado visible. |
| `patogenos`, `coloracion`, `humedad` | texto | Filas de evaluación de la foto. |
| `explicacion`, `recomendacion` | texto | Explicación y acción propuesta, con advertencia de resultado orientativo. |

Tras analizar, el usuario puede marcar riego, poda, abono, trasplante, cambio de luz o control de plagas, añadir nota y guardar foto/resultado. Estos cuidados son elecciones del usuario, no acciones ejecutadas por la aplicación.

### Limitaciones específicas

- La humedad y los patógenos son inferencias visuales; no hay sensores, pruebas de laboratorio ni mediciones físicas.
- Los intervalos 0–100 y «exactamente dos alternativas» se piden en las instrucciones, pero Zod no establece límites numéricos ni longitud exacta de la lista.
- El contexto incluye la especie previamente registrada; no es un identificador independiente sin contexto de jardín.
- Si la foto no muestra una planta, las instrucciones piden `identificada=false`; la exactitud de esa decisión no está validada.
- `consumir_analisis()` se ejecuta antes de llamar a IA: una llamada fallida puede gastar el cupo, sin reintegro implementado.
- Hay mensajes para límite de plan, solicitudes excesivas, falta de créditos y error de IA; disponibilidad, costes efectivos y tiempos de respuesta: **No determinado**.
- «Tejido sano — 98% confianza» aparece de forma fija al abrir la cámara; no procede de un análisis de video. «Modo Macro / Hojas» es una etiqueta, no un ajuste óptico confirmado.
- La foto requiere cámara disponible/permisos o archivo legible. No hay diagnóstico en vivo ni análisis por lotes.

## F. Modelo de datos

Tablas de negocio del esquema público, documentadas desde las migraciones y el esquema disponible del proyecto. Los campos `user_id` son UUID; no tienen una clave foránea declarada hacia cuentas en estas tablas. `profiles.id` sí referencia la cuenta del servicio de autenticación.

| Tabla | Campos principales | Relaciones / propósito |
|---|---|---|
| `profiles` | `id` UUID PK, `nombre`, `plan` (gratis/premium), `analisis_mes`, `mes_analisis`, `created_at`. | Una fila por cuenta; `id` referencia la cuenta. Perfil, plan y conteo mensual. |
| `especies` | `id` UUID PK, `slug` único, `nombre_comun`, `nombre_cientifico`, `endemica`, `ecosistema`, `descripcion`, `luz`, `luz_nivel`, `riego`, `riego_nivel`, `sustrato`, `sustrato_nivel`, `orden`. | Catálogo base para kits y plantas de usuario. |
| `kits` | `id` UUID PK, `especie_id` FK, `nombre`, `precio` entero, `descripcion`, `destacado`. | Muchos kits pueden referenciar una especie; `especie_id → especies.id`. |
| `pedidos` | `id` UUID PK, `user_id`, `total` entero, `estado` (por defecto confirmado), `created_at`. | Un usuario puede tener varios pedidos; un pedido contiene varios ítems. |
| `pedido_items` | `id` UUID PK, `pedido_id` FK, `user_id`, `kit_id` FK, `cantidad` (por defecto 1), `precio`. | `pedido_id → pedidos.id`; `kit_id → kits.id`. Una fila por unidad confirmada en la función actual. |
| `plantas_usuario` | `id` UUID PK, `user_id`, `especie_id` FK, `nombre_personalizado`, `fecha_siembra`, `etapa`, `created_at`. | `especie_id → especies.id`; cada planta tiene registros y recordatorios. Etapas: germinación, plántula, floración. |
| `registros` | `id` UUID PK, `user_id`, `planta_id` FK, `foto_path`, `diagnostico` JSONB, `acciones` arreglo de texto, `nota`, `created_at`. | `planta_id → plantas_usuario.id`; `foto_path` identifica archivo en `fotos`, no una FK de archivo. |
| `recordatorios` | `id` UUID PK, `user_id`, `planta_id` FK, `tipo` (riego/abono/revisión), `fecha`, `completado`, `created_at`. | `planta_id → plantas_usuario.id`; tareas fechadas de plantas propias. |

**Permisos implementados:** `especies` y `kits` permiten lectura pública; perfiles y datos personales se filtran por usuario. El permiso de actualización directa de `profiles` está limitado a `nombre`; la pantalla no ofrece editarlo. Pedidos e ítems se crean por función, no por inserción directa del cliente. Insertar recordatorios exige Premium y propiedad de la planta; insertar registros exige propiedad de la planta. La segunda migración elimina la política de actualización de registros: la interfaz solo inserta nuevos.

**Datos de ejemplo:** la migración `0000_migration.sql` inserta ocho especies y genera ocho kits; la consulta actual confirmó ocho filas en cada tabla. No son arreglos ficticios cargados en cada pantalla: son datos iniciales de demostración almacenados en una base de datos real.

| Especie del catálogo inicial | Precio del kit en la migración (COP) |
|---|---:|
| Salvia bogotana | 35.000 |
| Peperomia | 25.000 |
| Palma de cera | 55.000 |
| Frailejón | 60.000 |
| Mortiño | 30.000 |
| Siete cueros | 40.000 |
| Flor de mayo | 48.000 |
| Cucharo | 28.000 |

Estos precios son los del catálogo inicial del repositorio, no una cotización comercial validada ni una comprobación individual de los precios actuales. La procedencia científica de las descripciones y clasificación endémica es **No determinado**.

## G. Arquitectura y tecnologías

| Capa | Tecnología confirmada | Uso real / evidencia |
|---|---|---|
| Aplicación web | React 19 y TanStack Start v1 | Pantallas React y función de servidor `diagnosticar`. |
| Rutas | TanStack Router v1 | Rutas por archivos en `src/routes`; pantallas privadas con renderizado en cliente y guardia de sesión. |
| Lenguaje | TypeScript; SQL de PostgreSQL | Código `.ts`/`.tsx` y migraciones SQL de tablas/funciones/políticas. |
| Desarrollo y empaquetado | Vite; `@lovable.dev/vite-tanstack-config`; Nitro | `package.json` declara Vite `^8.1.5`; configuración común y destino de despliegue gestionados por Lovable. No se usa Next.js ni una app móvil nativa. |
| Base de datos | PostgreSQL gestionado por Lovable Cloud | Tablas públicas, claves foráneas, políticas por fila y funciones SQL. |
| Autenticación | Autenticación de Lovable Cloud; cliente `@supabase/supabase-js` | Correo/contraseña, registro, sesión persistente y cierre de sesión. No hay botones de acceso social. |
| Lecturas y caché | TanStack Query v5 | `queryOptions`, `useQuery`, invalidación al guardar/cambiar plan y limpieza al salir. |
| Servidor de IA | `createServerFn`, AI SDK (`ai`), `@ai-sdk/openai`, Zod | Autorización, llamada a Lovable AI Gateway y salida estructurada. |
| Almacenamiento | Storage de Lovable Cloud, contenedor privado `fotos` | Carga de JPEG y URLs firmadas por una hora; políticas por carpeta de usuario. Se confirmó privado y límite de archivo de 10 MiB; lista de MIME permitidos no definida. |
| Fotos de catálogo / logo | Archivos locales de especies y puntero de activo para el logo | `src/lib/especies-img.ts`, `src/assets/especies`, puntero JSON del logo. No son fotos tomadas de cada planta del usuario. |
| Interfaz | Tailwind CSS v4, componentes shadcn/Radix, Lucide, Sonner | Estilos, controles, diálogos, iconos y mensajes. |
| Carrito | `localStorage` y `useSyncExternalStore` de React | Persistencia solo en ese navegador, no sincronizada entre dispositivos ni separada por cuenta. |
| Pruebas | Vitest, Testing Library, jsdom | Cinco pruebas de reglas y una de coincidencia de ruta inicial. |
| Calidad | ESLint y Prettier | Comandos declarados `lint` y `format`. |
| Migraciones | Drizzle Kit / Drizzle ORM instalados | SQL en `drizzle/migrations`, configuración PostgreSQL; `drizzle/schema.ts` está vacío. No hay uso de ORM en las consultas funcionales de la app. |
| Gestor de paquetes | Bun | `bun.lock`, `bunfig.toml` y comandos aplicables del proyecto. |

Flujo técnico: **navegador → autenticación/consultas de Lovable Cloud** para la mayoría de operaciones; **navegador → función de servidor autenticada → Lovable AI Gateway** para diagnosticar. El resultado se guarda solo cuando el usuario confirma la bitácora. Las funciones de servidor adjuntan el token de sesión mediante `src/start.ts`; el servidor valida identidad y propiedad antes de analizar. También existe protección CSRF para funciones de servidor.

## H. Variables de entorno y seguridad

Se indican únicamente nombres; no se reproducen valores, direcciones internas ni credenciales.

| Nombre | Uso / necesidad |
|---|---|
| `VITE_SUPABASE_URL` | Conexión pública del cliente del navegador. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave publicable del cliente; no es una clave privada de servicio. |
| `SUPABASE_URL` | Conexión del servidor y alternativa para renderizado del cliente. |
| `SUPABASE_PUBLISHABLE_KEY` | Cliente autenticado en servidor; no es clave privada. |
| `LOVABLE_API_KEY` | Secreto necesario para el diagnóstico en servidor; sin él aparece el error de configuración de IA. Nunca debe llevar prefijo `VITE_` ni publicarse. |
| `VITE_SUPABASE_PROJECT_ID`, `SUPABASE_PROJECT_ID` | Presentes en la configuración del proyecto; no se encontró lectura directa en el código de negocio. |
| `LOVABLE_DB_MIGRATION_URL` | Leída por `drizzle.config.ts`; para herramientas de migración, no para abrir la app. No debe publicarse si incluye credenciales. |
| `SUPABASE_SERVICE_ROLE_KEY` | Referenciada por el cliente administrativo generado; no se usa en el flujo de negocio revisado. No es necesaria para las consultas autenticadas normales y no está disponible para extracción en Lovable Cloud. |
| `LOVABLE_CRON_SECRET`, `LOVABLE_CRON_SECRET_PREVIOUS` | Referenciadas en un helper generado de validación de tareas programadas. No se encontró una tarea o ruta que lo utilice; no son necesarias para los recordatorios actuales. |



## Cómo probar la demo
> **Nota:** la forma recomendada de probar el MVP es la aplicación publicada (enlace al final de esta sección). La ejecución local descrita aquí es opcional y no fue probada por el equipo.

La forma recomendada de probar WaraVita es abrir la aplicación publicada, sin instalar nada:

https://pixel-perfect-picture-7195.lovable.app

Los datos de la cuenta de prueba están en el archivo GithubRepo.txt incluido en la entrega. También se puede crear una cuenta propia desde la pantalla de registro.

## Ejecución local (opcional)

El equipo desarrolló y probó la aplicación en su versión publicada; la ejecución local no fue probada. Para intentarla se necesita Bun (https://bun.sh).

bun install --frozen-lockfile
bun run dev

Abrir la dirección que indica la terminal. La aplicación se conecta a un servicio externo (Lovable Cloud) para la base de datos, la autenticación y las fotos, y el diagnóstico con IA necesita una clave privada (LOVABLE_API_KEY) que no se incluye en el repositorio. Sin esa clave, el diagnóstico con IA no funcionará en una ejecución local.

## J. Limitaciones conocidas

| Área | Situación real |
|---|---|
| Cobro de kits | Simulado; la pantalla indica que no se cobra. No hay pasarela, verificación de pago, reembolso ni factura. |
| Premium | Precio mostrado de COP 15.000/mes; activación real del indicador de plan, pero cobro/renovación/cancelación/vencimiento No implementados. |
| Pedido físico | Se guardan pedido, unidades y plantas; no hay dirección de entrega, inventario, transportadora ni seguimiento de envío. «Envío gratis» es un texto fijo. |
| Catálogo | Ocho especies y ocho kits de demostración en base real; disponibilidad comercial, procedencia botánica y precios de venta validados: No determinado. |
| Fotos de catálogo | Imágenes locales asociadas por `slug`; si no encuentra imagen usa la de Salvia. No muestran el ejemplar físico que se recibiría. |
| Avisos de cuidado | Lista persistente de tareas; notificaciones push, correo, SMS, alarmas y programación automática No implementados, aunque el texto menciona avisos. |
| Guías | Acceso «Guías» lleva a la presentación; sección o biblioteca dedicada No implementada. |
| Crecimiento | Etapa seleccionada por el usuario y meses calculados desde la fecha; medición/detección automática No implementada. |
| Bitácora | Foto, diagnóstico, nota y acciones se guardan, pero la ficha solo muestra foto/fecha/vigor. Vista histórica completa y edición de registros No implementadas. |
| Cuenta | Inicio/registro por contraseña; recuperación/cambio de contraseña, acceso Google/Lovable, edición de nombre desde perfil, eliminación de cuenta y avatar propio No implementados en la interfaz revisada. |
| Carrito | Guardado local, sin sincronización, sin validación estructural de lo leído del navegador y sin separación por cuenta. Al salir no se limpia. |
| Validación del pedido | La función acepta una lista de IDs, pero no comprueba que todos existan. IDs inválidos se omiten en las uniones; no hay control de inventario ni límite de unidades. |
| Garantía del desbloqueo | El flujo visible crea plantas al pedir; la política de `plantas_usuario` también permite insertar plantas propias directamente. No debe afirmarse que comprar sea una restricción inviolable del backend. |
| Guardado de fotos | Carga de archivo e inserción de registro son operaciones separadas; si falla la segunda no hay limpieza automática de la foto huérfana. |
| Diagnóstico | Orientativo, dependiente de imagen, red, cupo y servicio externo; no hay precisión validada, sensores ni análisis de video. La etiqueta de 98% anterior al análisis es fija. |
| Enciclopedia Premium | Descripción ampliada condicionada en interfaz; el catálogo `especies` es de lectura pública. No hay protección de ese texto como contenido secreto exclusivo. |
| Administración | Pantalla para administrar catálogo, pedidos o usuarios No implementada. |
| Aplicación móvil | Web de ancho reducido orientada al teléfono; app nativa, instalador móvil y soporte sin conexión No implementados en el repositorio revisado. |
| Evidencia de ejecución | Seis pruebas existentes aprobadas y comprobaciones de base de datos de solo lectura. Funcionamiento actual de un recorrido completo en la app publicada: No determinado en esta revisión. |

### Fuentes principales del repositorio

- Pantallas: `src/routes/index.tsx`, `nosotros.tsx`, `auth.tsx` y `src/routes/_authenticated/*.tsx`.
- Consultas y reglas: `src/lib/data.ts`, `cart.ts`, `reglas.ts`, `especies-img.ts`.
- IA: `src/lib/diagnostico.functions.ts`, `src/lib/ai.server.ts`, `src/start.ts` y middleware generado de autorización.
- Datos y permisos: `drizzle/migrations/0000_migration.sql` y `0001_migration.sql`; definiciones actuales de funciones consultadas en modo lectura.
- Configuración y pruebas: `package.json`, `bun.lock`, `bunfig.toml`, `vite.config.ts`, `drizzle.config.ts`, `src/lib/reglas.test.ts`, `src/test/app-routing.test.tsx`.
