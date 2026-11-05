# WaraVita — Propuesta de pantallas y base de datos

App móvil primero, todo en español (Colombia), con el logo subido, los colores de la marca (#006A66, #9CF1EC, #CCE8E5, #E3E9E8, #C4C6C4, #161D1C, #FEF3C7) y el estilo de los mockups: esquinas muy redondeadas, tarjetas con borde gris claro y barra inferior fija (Inicio · Tienda · Mi jardín · Perfil).

## Pantallas

```text
/                 Landing sin sesión (problema, cifras, equipo) · Inicio con sesión
/ingresar         Registro e inicio de sesión (correo + contraseña)
/inicio           Búsqueda, banner "Siembra flora nativa Colombiana", 4 accesos, Catálogo Destacado
/tienda           Kits con búsqueda y filtros (ecosistema, endémica, precio)
/carrito          Resumen + "Confirmar pedido" (pago simulado) -> desbloquea especies
/jardin           Progreso de Colección, pestañas "Mis Plantas nuevas" / "Herbario Total", cartas coleccionables con candado
/planta/:id       Ficha: requerimientos, línea de tiempo, registro fotográfico, "Registrar cuidado"
/planta/:id/diagnostico   Cámara/galería, descripción, resultado IA, acciones de cuidado, guardar en bitácora
/recordatorios    Hoy · Esta semana · Completados, con casilla de hecho
/perfil           Datos, plan, análisis restantes, "Activar Premium", enlace a "Sobre WaraVita"
/nosotros         Sección informativa y "Nuestro equipo" (4 tarjetas)
```

## Base de datos (Lovable Cloud)

- **perfiles**: nombre, avatar, plan (gratis/premium), análisis usados este mes
- **especies**: nombre común, científico, endémica, ecosistema, luz/riego/sustrato (texto + nivel 1-5), imagen
- **kits**: especie, nombre, precio, descripción, imagen
- **pedidos** y **pedido_items**: total, estado "confirmado"
- **plantas_usuario**: especie, nombre personalizado, fecha de siembra, etapa (germinación/plántula/floración)
- **registros**: foto, fecha, diagnóstico IA (vigor, patógenos, coloración, humedad, especie identificada + 2 alternativas), acciones aplicadas, nota
- **recordatorios**: planta, tipo (riego/abono/revisión), fecha, completado

Cada usuario solo ve y modifica sus propios datos; especies y kits son de lectura pública. Fotos en almacenamiento privado. Precarga: 8+ especies nativas (Salvia bogotana, Peperomia bogotensis, Frailejón, Cucharo, Mortiño, Siete cueros, Orquídea Cattleya trianae, Chusque) con sus kits e ilustraciones generadas.

## Reglas de negocio

- Plan Gratis: 5 análisis al mes y enciclopedia básica.
- Premium: COP 15.000/mes, análisis ilimitados, recordatorios y enciclopedia completa (activación simulada).
- Comprar un kit crea la planta en "Mi jardín" y desbloquea la especie con animación.
- El diagnóstico se hace en el servidor con un modelo de visión de Lovable AI; el límite mensual se verifica en el servidor. Aviso "Resultado orientativo generado por IA".

## Orden de construcción

1. Diseño, logo, navegación y Cloud (tablas, seguridad, datos de ejemplo)
2. Ingreso, Inicio, Tienda y carrito
3. Mi jardín y Ficha de planta
4. Diagnóstico IA con cámara y guardado en bitácora
5. Recordatorios, Perfil/planes y Landing/equipo
6. Pruebas de las reglas (límite de 5 análisis, desbloqueo al comprar) y revisión en móvil

## Supuestos (dime si cambian)

- Al registrarse, el usuario empieza sin plantas (estado vacío amable) en vez de con plantas de ejemplo.
- Las alertas de recordatorio se ven dentro de la app (sin correos ni notificaciones push).
- La etiqueta en vivo de la cámara es ilustrativa; el análisis real ocurre al capturar.
