# Mini Inventario

Proyecto de aplicación web para administrar productos y controlar sus existencias.

## Objetivo

Desarrollar una aplicación que permita registrar, consultar, buscar, editar y eliminar productos y mostrar su estado de existencias.

Cada producto tendrá un mínimo de existencias configurable.

- **Agotado** con 0 unidades.
- **Existencias bajas** cuando la cantidad sea mayor que cero y menor que el mínimo del producto. Se mostrará una advertencia.
- **Disponible** cuando la cantidad sea mayor que cero e igual o superior al mínimo del producto.
- El indicador y el resaltado usan el umbral estricto `cantidad < minimo`, incluso para productos agotados con mínimo mayor que cero. El indicador abarca todo el inventario del usuario durante una búsqueda.

## Modelo de productos

La tabla `productos` tendrá los campos `id`, `user_id`, `nombre`, `sku`, `cantidad`, `minimo` y `created_at`. El SKU será único por usuario, sin distinguir mayúsculas y minúsculas.

## Tecnologías

- Node.js 22.20.0
- Python 3.12 (herramienta auxiliar)
- Express
- HTML, CSS y JavaScript
- Supabase desde el Día 3 (PostgreSQL, Supabase Auth y seguridad por fila)
- Git y GitHub
- Codex
- Playwright (para pruebas posteriores)

## Cómo empezar

1. Clonar el repositorio desde GitHub.
2. Abrir la carpeta del proyecto.
3. Verificar las versiones de Node.js y Python.
4. Instalar las dependencias con `npm install`.
5. Copiar `.env.example` a `.env` en la raíz del repositorio. En Supabase, abrir el proyecto y pulsar **Connect** para copiar la **Project URL** a `SUPABASE_URL`. En **Settings → API Keys**, copiar la **Publishable key** a `SUPABASE_PUBLISHABLE_KEY`. Git ignora el archivo `.env`.
6. Ejecutar `npm start`, abrir `http://localhost:3000` e iniciar sesión con el correo y la contraseña de una cuenta existente de Supabase Auth.

## Estado del proyecto

Día 1: preparación del entorno y repositorio.

Día 2: definición de requisitos, selección de tecnologías y diseño de la aplicación.

Día 3: inicio y cierre de sesión, listado, registro, edición, búsqueda parcial por nombre o SKU, contador de existencias bajas y eliminación individual con confirmación. Supabase PostgreSQL es la única base activa. Se confirmó el aislamiento entre dos cuentas desde la interfaz. La comprobación directa con la Data API sigue pendiente. [Bitácora del Día 3](entregas/dia-03/README.md)

SQLite se consideró durante la planeación inicial. Los archivos de esas entregas conservan el registro de las decisiones de esa etapa.

## Evidencias

Las actividades, capturas y bitácoras se organizarán en la carpeta `entregas/`, separadas por día.

## Documentación

Los documentos de planeación se encuentran en la carpeta `docs/`:

- `requisitos.md`: funciones y reglas del inventario.
- `tecnologias.md`: tecnologías seleccionadas.
- `diseno.md`: estructura y funcionamiento de la aplicación.
