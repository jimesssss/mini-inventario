# Día 2 — Planeación del proyecto

**Proyecto:** Mini Inventario  
**Fecha:** 12 de noviembre de 2026  
**Repositorio:** https://github.com/jimesssss/mini-inventario  
**Rama de trabajo:** `dia-02-planeacion`

## 1. Objetivo

Durante el Día 2 realicé la planeación de Mini Inventario. Definí las funciones que tendrá la aplicación, las tecnologías que voy a utilizar y cómo estará organizado el proyecto antes de comenzar a programarlo.

También utilicé Codex para revisar los documentos y encontrar posibles errores o aspectos que necesitaba mejorar.

## 2. Actividades realizadas

### Creación de la rama de trabajo

Primero revisé que el repositorio no tuviera cambios pendientes y después creé una rama para trabajar en la planeación sin modificar directamente la rama principal.

Comando utilizado:

`git switch -c dia-02-planeacion`

### Definición de los requisitos

Creé el archivo `docs/requisitos.md`, donde escribí las funciones principales del inventario.

Decidí que la aplicación permitirá registrar, consultar, buscar, editar y eliminar productos.

Cada producto tendrá un código, nombre, categoría, cantidad, precio y descripción.

También establecí algunas reglas, como evitar códigos repetidos, no aceptar cantidades negativas y mostrar el estado de las existencias.

### Selección de tecnologías

Después creé `docs/tecnologias.md` para explicar qué herramientas utilizaré y para qué servirá cada una.

Las principales tecnologías seleccionadas fueron:

| Tecnología | Uso |
|---|---|
| HTML, CSS y JavaScript | Crear la interfaz y las funciones del navegador. |
| Node.js 22 | Ejecutar JavaScript en el servidor. |
| Express | Manejar las solicitudes de la aplicación. |
| SQLite | Guardar la información de los productos. |
| Git y GitHub | Llevar el control de versiones. |
| Codex | Revisar la documentación y apoyar durante el desarrollo. |

También se contempla utilizar Playwright para realizar pruebas más adelante.

### Diseño de la aplicación

Creé el archivo `docs/diseno.md`, donde describí cómo estará organizada la aplicación.

Planeé una interfaz con un formulario para agregar productos, un buscador, una tabla para consultar el inventario y botones para editar o eliminar registros.

También definí una estructura de carpetas para separar la interfaz, las funciones del servidor y la base de datos.

## 3. Primera revisión con Codex

Cuando terminé los tres documentos, le pedí a Codex que los revisara para comprobar si eran coherentes entre sí.

Codex encontró que había una diferencia entre las tecnologías mencionadas en el README y las que había seleccionado para la planeación.

También recomendó explicar mejor algunas reglas del inventario, especialmente las relacionadas con códigos repetidos, búsquedas, edición y eliminación de productos.

## 4. Correcciones realizadas

Después de revisar sus recomendaciones, decidí utilizar **SQLite** como base de datos para Mini Inventario.

Actualicé el README para que coincidiera con esa decisión y amplié los requisitos del sistema.

Entre las reglas que definí están las siguientes:

- El código de cada producto será único.
- No se distinguirán mayúsculas y minúsculas al comprobar códigos repetidos.
- La cantidad será un número entero igual o mayor que cero.
- El precio no podrá ser negativo.
- La búsqueda permitirá localizar productos por nombre o código.
- Antes de eliminar un producto se pedirá confirmación.
- Los datos se conservarán al cerrar la aplicación.

También corregí problemas de formato en los documentos Markdown.

## 5. Segunda revisión con Codex

Volví a pedirle a Codex que revisara la documentación después de las primeras correcciones.

En esta revisión confirmó que los documentos eran coherentes en lo principal, pero encontró algunos detalles pendientes.

Uno de ellos era que `AGENTS.md` todavía mencionaba Supabase PostgreSQL, aunque ya había decidido utilizar SQLite.

También recomendó aclarar mejor los estados de los productos según su cantidad y corregir algunas tablas y listas que no se mostraban correctamente en Markdown.

## 6. Corrección final de la documentación

Para terminar, autoricé a Codex a modificar únicamente los cinco archivos de documentación del proyecto.

Codex actualizó `AGENTS.md`, corrigió las reglas de existencias y ajustó el formato de las tablas y listas.

Los estados de los productos quedaron definidos de esta manera:

| Cantidad | Estado |
|---|---|
| 0 unidades | Agotado |
| 1 a 5 unidades | Existencias bajas |
| 6 o más unidades | Disponible |

También se estableció que el indicador de existencias bajas contará los productos que tengan entre una y cinco unidades, tomando en cuenta todo el inventario.

Codex realizó una última comprobación y reportó que la documentación estaba lista para comenzar el desarrollo.

## 7. Problemas encontrados y soluciones

| Problema | Solución |
|---|---|
| El README mencionaba una base de datos diferente. | Se decidió utilizar SQLite y se actualizó la documentación. |
| Algunas reglas de registro y búsqueda no estaban suficientemente claras. | Se agregaron condiciones para validar los datos y evitar registros duplicados. |
| Los estados de existencias podían interpretarse de distintas maneras. | Se definieron tres estados según la cantidad disponible. |
| Algunas tablas y listas tenían errores de formato. | Se corrigieron las barras invertidas y los espacios que afectaban Markdown. |
| `AGENTS.md` todavía mencionaba Supabase PostgreSQL. | Codex actualizó la instrucción para utilizar SQLite. |
| Git mostró advertencias sobre LF y CRLF. | Se revisaron y se continuó porque eran advertencias relacionadas con los saltos de línea en Windows. |

## 8. Decisiones tomadas

Durante la planeación decidí mantener el proyecto como un inventario general, para que pueda utilizarse con diferentes tipos de productos.

También decidí utilizar SQLite porque es suficiente para la primera versión que voy a desarrollar.

Acepté las recomendaciones de Codex que ayudaban a corregir contradicciones y mejorar las reglas del sistema. No le autoricé instalar dependencias ni comenzar a programar, porque esas actividades corresponden a la siguiente etapa.

## 9. Evidencias

Las capturas de pantalla de las actividades se guardaron en la carpeta `entregas/dia-02/capturas/`.

Se incluyeron 46 capturas que muestran la creación de la rama, los documentos de planeación, las revisiones de Codex, las correcciones realizadas y la verificación de los archivos con Git.

También se registraron los cambios en Git, se subió la rama `dia-02-planeacion` a GitHub y se creó el Pull Request número 1.

Después de revisar que podía integrarse, se realizó la fusión con la rama `main`. Finalmente, actualicé el repositorio local y comprobé que no quedaran cambios pendientes.

## 10. Conclusión

Durante el Día 2 terminé la planeación de Mini Inventario y definí las funciones que tendrá la aplicación.

También seleccioné las tecnologías, preparé el diseño general y corregí varios detalles que encontré con ayuda de Codex.

Además, guardé las evidencias de las actividades y subí la documentación a GitHub.

Con la documentación revis
