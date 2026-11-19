# Mini Inventario

Proyecto de aplicación web para administrar productos y controlar sus existencias.

## Objetivo

Desarrollar una aplicación que permita registrar, consultar, buscar, editar y eliminar productos y mostrar su estado de existencias.

Cada producto tendrá un mínimo de existencias configurable.

- **Agotado** con 0 unidades.
- **Existencias bajas** cuando la cantidad sea mayor que cero y menor o igual al mínimo del producto. Se mostrará una advertencia.
- **Disponible** cuando la cantidad sea mayor que cero y supere el mínimo del producto.
- El indicador de existencias bajas contará todos los productos del usuario que cumplan esa condición, incluso cuando se aplique una búsqueda.

## Modelo de productos

La tabla `productos` tendrá los campos `id`, `user_id`, `nombre`, `sku`, `cantidad`, `minimo` y `created_at`. El SKU será único por usuario, sin distinguir mayúsculas y minúsculas.

## Tecnologías

- Node.js 22.20.0
- Python 3.12 (herramienta auxiliar)
- Express
- HTML, CSS y JavaScript
- Supabase (base de datos seleccionada, a partir del Día 4)
- Git y GitHub
- Codex
- Playwright (para pruebas posteriores)

## Cómo empezar

1. Clonar el repositorio desde GitHub.
2. Abrir la carpeta del proyecto.
3. Verificar las versiones de Node.js y Python.
4. Instalar las dependencias cuando se incorporen al proyecto.

## Estado del proyecto

Día 1: preparación del entorno y repositorio.

Día 2: definición de requisitos, selección de tecnologías y diseño de la aplicación.

En la planeación se eligió SQLite. En una revisión posterior, el profesor indicó que el curso utilizará Supabase a partir del Día 4. Supabase es la base de datos seleccionada para el proyecto tras esa corrección.

## Evidencias

Las actividades, capturas y bitácoras se organizarán en la carpeta `entregas/`, separadas por día.

## Documentación

Los documentos de planeación se encuentran en la carpeta `docs/`:

- `requisitos.md`: funciones y reglas del inventario.
- `tecnologias.md`: tecnologías seleccionadas.
- `diseno.md`: estructura y funcionamiento de la aplicación.
