# Día 2 — Planeación del proyecto

**Proyecto:** Mini Inventario

**Fecha:** 12 de noviembre de 2026

**Repositorio:** https://github.com/jimesssss/mini-inventario

**Rama de trabajo:** dia-02-planeacion

## 1. Objetivo

Durante el Día 2 realicé la planeación de Mini Inventario. Definí las funciones que tendrá la aplicación, las tecnologías que voy a utilizar y cómo estará organizado el proyecto antes de comenzar a programarlo.

También utilicé Codex para revisar los documentos y encontrar posibles errores o cosas que necesitaba mejorar.

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

### Prompts históricos recuperados

Transcribí el texto visible de las capturas. Uní las líneas que la terminal partió por el ancho de la ventana. En los fragmentos, la captura empieza con el prompt ya iniciado.

#### Primera revisión de coherencia (prompt completo)

[Captura 25](capturas/25-prompt-revision-coherencia.png)

```text
Estoy desarrollando un proyecto llamado Mini Inventario, una aplicación web para administrar productos de un inventario general.

Revisa los siguientes documentos:

• docs/requisitos.md
• docs/tecnologias.md
• docs/diseno.md

Necesito que analices si los tres documentos son coherentes entre sí y si la planeación es adecuada para desarrollar la aplicación con HTML, CSS, JavaScript, Node.js 22, Express y SQLite.

Revisa específicamente:

1. Si los requisitos funcionales están completos y son claros.
2. Si las tecnologías elegidas son adecuadas para el proyecto.
3. Si la estructura de carpetas propuesta tiene sentido.
4. Si existen contradicciones entre los documentos.
5. Si falta definir alguna regla importante para registrar, buscar, editar o eliminar productos.
6. Qué mejoras recomiendas antes de comenzar a programar.

Explica los resultados en español, de manera clara y organizada. Distingue los problemas importantes de las mejoras opcionales.

IMPORTANTE: Esta revisión es únicamente de lectura. No modifiques archivos, no crees carpetas, no instales dependencias y no ejecutes comandos que cambien el proyecto. Solicita mi autorización antes de realizar cualquier modificación.
```

#### Segunda revisión de la documentación (fragmento parcial)

[Captura 37](capturas/37-codex-revision-documentos.png)

```text
5. Corregimos las barras invertidas de los títulos, viñetas y negritas.

Necesito que compruebes:

• Si los cuatro documentos son coherentes entre sí.
• Si las reglas están claras y no se contradicen.
• Si el formato Markdown es correcto.
• Si falta resolver algún problema importante antes de comenzar a programar.
• Si la planeación está lista para pasar a la fase de desarrollo.

Presenta el resultado en español, separando los problemas importantes de las mejoras opcionales. Incluye un veredicto final.

IMPORTANTE: Esta revisión es únicamente de lectura. No modifiques archivos, no instales dependencias, no crees carpetas y no ejecutes comandos que cambien el proyecto.
```

#### Autorización para corregir la documentación (fragmento parcial)

[Captura 38](capturas/38-codex-correcciones-documentacion.png)

```text
4. Revisa las reglas repetidas en requisitos.md. Elimina duplicaciones innecesarias sin perder información ni modificar las funciones acordadas.
5. Conserva SQLite como base de datos definitiva, Node.js 22 y Express para el servidor, y HTML, CSS y JavaScript para la interfaz.
6. Revisa que los documentos sean coherentes entre sí después de las correcciones.

IMPORTANTE:

• Tienes autorización para modificar únicamente los cinco archivos indicados.
• No elimines archivos ni carpetas.
• No instales dependencias.
• No comiences a programar la aplicación.
• No ejecutes comandos destructivos.
• No realices commits, push ni cambios de rama.
• Conserva la codificación UTF-8 y los acentos.
• Respeta la estructura original de los documentos.
• Antes de terminar, muestra un resumen de los cambios realizados y cualquier problema pendiente.

El objetivo es dejar la documentación del Día 2 lista para comenzar el desarrollo en el Día 3.
```

Las capturas 37 y 38 no muestran el inicio de esos prompts. Las transcripciones se limitan a lo que se alcanza a leer.

## 7. Problemas encontrados y soluciones

| Problema | Solución |
|---|---|
| El README mencionaba una base de datos diferente. | Se decidió utilizar SQLite y se actualizó la documentación. |
| Algunas reglas de registro y búsqueda no estaban suficientemente claras. | Se agregaron condiciones para validar los datos y evitar registros duplicados. |
| Los estados de existencias podían interpretarse de distintas maneras. | Se definieron tres estados según la cantidad disponible. |
| Algunas tablas y listas tenían errores de formato. | Se corrigieron las barras invertidas y los espacios que afectaban Markdown. |
| `AGENTS.md` todavía mencionaba Supabase PostgreSQL. | Codex actualizó la instrucción para utilizar SQLite. |
| Git mostró advertencias sobre LF y CRLF. | Se revisaron y se continuó porque eran advertencias relacionadas con los saltos de línea en Windows. |

### Limitación de la revisión con Codex

La revisión final de Codex se centró en los cinco archivos de documentación que le autoricé a editar. Después, la comprobación que guardé de la bitácora solo mostraba el nombre y el tamaño del archivo. Esa comprobación no verificaba el formato de su contenido. [Autorización y revisión de Codex](capturas/38-codex-correcciones-documentacion.png) · [Comprobación de la bitácora](capturas/46-verificacion-bitacora-dia-02.png)

Detecté el problema al revisar el texto de la versión anterior de la bitácora. Ahí había barras invertidas reales antes de encabezados, viñetas y negritas. Para corregirlo, autoricé quitarlas de esos elementos y ajustar los espacios entre filas de las tablas. Al revisar el archivo actual confirmé que esos escapes ya se habían retirado. Las capturas de la planeación también muestran cómo encontré, corregí y volví a buscar escapes similares en los archivos de `docs/`. [Detección](capturas/33-deteccion-escapes-documentacion.png) · [Corrección](capturas/34-correccion-escapes-documentacion.png) · [Comprobación](capturas/35-verificacion-escapes-corregidos.png)

## 8. Decisiones tomadas

Durante la planeación decidí mantener el proyecto como un inventario general, para que pueda utilizarse con diferentes tipos de productos.

También decidí utilizar SQLite porque es suficiente para la primera versión que voy a desarrollar.

Acepté las recomendaciones de Codex que ayudaban a corregir contradicciones y mejorar las reglas del sistema. No le autoricé instalar dependencias ni comenzar a programar, porque esas actividades corresponden a la siguiente etapa.

### Correcciones solicitadas por el profesor

En la planeación del Día 2 elegí SQLite y definí los requisitos del inventario con un umbral fijo de existencias. Tras la revisión del profesor, actualicé la documentación para indicar que usaré Supabase como base de datos a partir del Día 4. La elección anterior de SQLite queda registrada en esta bitácora como parte de la planeación original. [README](../../README.md#estado-del-proyecto) · [Tecnologías](../../docs/tecnologias.md)

Reescribí los requisitos como cinco historias de usuario con criterios verificables y ajusté el diseño de la tabla `productos`, las validaciones del navegador y del servidor, y las restricciones de integridad y seguridad por usuario en Supabase. Registré cada historia en un issue con sus criterios como casillas de verificación. [Requisitos](../../docs/requisitos.md) · [Diseño](../../docs/diseno.md)

| Historia de usuario | Issue |
| --- | --- |
| HU-01 — Registrar productos | [#2](https://github.com/jimesssss/mini-inventario/issues/2) |
| HU-02 — Consultar productos y sus existencias | [#3](https://github.com/jimesssss/mini-inventario/issues/3) |
| HU-03 — Buscar productos | [#4](https://github.com/jimesssss/mini-inventario/issues/4) |
| HU-04 — Editar productos | [#5](https://github.com/jimesssss/mini-inventario/issues/5) |
| HU-05 — Eliminar productos | [#6](https://github.com/jimesssss/mini-inventario/issues/6) |

### Correcciones personales posteriores a la revisión del profesor

Tomé estas dos decisiones y aprobé sus justificaciones. Codex me ayudó a revisar que fueran coherentes con los requisitos y el diseño.

#### Mínimo configurable por producto

- **Planeación original.** Todos los productos tenían existencias bajas si quedaban entre una y cinco unidades.
- **Qué decidí cambiar.** Cada producto tendrá su propio mínimo. Si la cantidad es cero, estará agotado. Si es mayor que cero y no supera su mínimo, tendrá existencias bajas. Si supera su mínimo y es mayor que cero, estará disponible.
- **Por qué lo considero una mejora.** Cada producto puede necesitar una cantidad mínima diferente. Por ejemplo, con cuatro unidades, un producto con mínimo de dos está disponible, mientras que uno con mínimo de cinco ya tiene existencias bajas.
- **Historias relacionadas.** HU-01, criterio 3, permite configurar el mínimo al registrar un producto. HU-02, criterios 2 a 5, define los estados y el indicador de existencias bajas. HU-04, criterios 1 y 2, permite editar el mínimo y valida el valor ingresado.
- **Cómo comprobarlo.** Se puede revisar la regla en el objetivo del README, los criterios de aceptación en los requisitos, y el campo `minimo` y la tabla de estados en el diseño. [README](../../README.md#objetivo) · [Requisitos](../../docs/requisitos.md) · [Diseño](../../docs/diseno.md#estados-de-existencias)

#### SKU único por usuario

- **Planeación original.** Los requisitos impedían repetir códigos aunque cambiaran las mayúsculas o minúsculas. La regla dejaba por definir si la restricción se aplicaba a todo el sistema o a cada usuario.
- **Qué decidí cambiar.** El SKU será único dentro del inventario de cada usuario y se seguirá comparando sin distinguir mayúsculas y minúsculas.
- **Por qué lo considero una mejora.** Cada persona puede organizar su inventario con sus propios códigos. Si ya tengo un producto con SKU `ABC-01`, el sistema considera `abc-01` un duplicado en mi inventario. Otra persona puede usar ese mismo SKU en el suyo.
- **Historias relacionadas.** HU-01, criterio 4, comprueba el caso de dos usuarios al registrar un producto. HU-04, criterio 3, permite conservar el SKU del producto editado y rechaza el de otro producto del mismo usuario.
- **Cómo comprobarlo.** La regla aparece en el modelo de productos del README y en los criterios de registro y edición. El diseño explica cómo se aplicará con un índice único por propietario y SKU normalizado. [README](../../README.md#modelo-de-productos) · [Requisitos](../../docs/requisitos.md) · [Diseño](../../docs/diseno.md#2-tabla-productos)

## 9. Evidencias

Las capturas de pantalla de las actividades se guardarán en la carpeta `entregas/dia-02/capturas/`.

Las evidencias incluirán la creación de la rama, los documentos de planeación, las revisiones de Codex, las correcciones realizadas y la verificación de los archivos con Git.

### Evidencia disponible

Encontré 46 capturas numeradas del 01 al 46 en la [carpeta de evidencias](capturas/). Las agrupé por actividad para poder ubicarlas.

| Capturas | Qué documentan |
| --- | --- |
| 01 a 08 | Inicio de Codex, comprobaciones del entorno, estado de Git y creación de la rama de planeación. [Creación de la rama](capturas/08-creacion-rama-planeacion.png) |
| 09 a 23 | Creación, redacción y primeras verificaciones de requisitos, tecnologías y diseño. [Verificación del diseño](capturas/22-verificacion-diseno.png) |
| 24 a 38 | Revisiones de Codex, cambios en la documentación y detección y corrección de escapes de Markdown. [Primer prompt](capturas/25-prompt-revision-coherencia.png) · [Fragmento de revisión](capturas/37-codex-revision-documentos.png) · [Fragmento de autorización](capturas/38-codex-correcciones-documentacion.png) |
| 39 a 46 | Comprobaciones de Git, preparación de archivos y creación, redacción y comprobación de la bitácora original. [Comprobación del diff](capturas/40-git-diff-check.png) · [Comprobación de la bitácora](capturas/46-verificacion-bitacora-dia-02.png) |

### Capturas pendientes

En esta carpeta quedan pendientes capturas que muestren la documentación corregida después de la revisión del profesor y el listado de los cinco issues. Por ahora puedo comprobar esos resultados en los documentos y en los enlaces de la tabla de issues. También queda pendiente localizar una captura o un registro que muestre el inicio de los prompts parciales de las capturas 37 y 38.

## 10. Conclusión

Durante el Día 2 terminé la planeación de Mini Inventario y definí las funciones que tendrá la aplicación.

También seleccioné las tecnologías, preparé el diseño general y corregí varios detalles que encontré con ayuda de Codex.

Con la documentación revisada, el proyecto quedó preparado para comenzar la programación durante el Día 3.
