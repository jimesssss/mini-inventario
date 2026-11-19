# Reporte final de correcciones de los días 1 y 2

## Portada

| Dato | Información |
| --- | --- |
| Proyecto | Mini Inventario |
| Estudiante | Jimena Salazar Cedeño |
| Cuenta de GitHub | `jimesssss` |
| Repositorio | [jimesssss/mini-inventario](https://github.com/jimesssss/mini-inventario) |

## 1. Introducción y objetivo

En el Día 1 preparé el entorno y el repositorio de Mini Inventario. En el Día 2 definí qué debía hacer la aplicación, elegí las tecnologías y preparé el diseño inicial. En esa planeación elegí SQLite. Después de recibir las observaciones del profesor, actualicé la documentación para adoptar Supabase a partir del Día 4.

Mi objetivo es mostrar qué observaciones recibí, qué cambié y dónde se puede comprobar cada corrección. También explico las dos decisiones que tomé y cómo revisé las recomendaciones de Codex. [Bitácora del Día 1](../dia-01/README.md) · [Bitácora del Día 2](../dia-02/README.md)

## 2. Observaciones del profesor y respuesta

Presento las observaciones con la redacción que registré para las correcciones. La tabla resume su contenido.

| Día y observación | Situación anterior | Corrección realizada | Evidencia |
| --- | --- | --- | --- |
| Día 1. Cambiar SQLite por Supabase en `AGENTS.md` y `README.md` porque el curso usará Supabase a partir del Día 4. | La documentación indicaba SQLite como base seleccionada. | Actualicé ambos archivos y conservé en el README la elección anterior como antecedente. | [AGENTS.md](../../AGENTS.md) · [README](../../README.md) · [Elección original de SQLite](../dia-02/capturas/27-readme-actualizado-sqlite.png) |
| Día 2. Redactar cinco historias en formato «Como usuario, quiero… para…» con 3 a 5 criterios verificables cada una. | Tenía una lista de requisitos funcionales y reglas adicionales. | Redacté HU-01 a HU-05 con 4, 5, 4, 4 y 4 criterios, respectivamente. | [Requisitos actuales](../../docs/requisitos.md) · [Revisión de los requisitos originales](../dia-02/capturas/28-requisitos-actualizados-notepad.png) |
| Día 2. Adaptar el diseño a Supabase y a la tabla `productos` con los siete campos solicitados. | El diseño usaba SQLite y contemplaba un archivo de base de datos local. El formulario incluía categoría, precio y descripción. | Actualicé la arquitectura, el modelo de datos y el formulario. Alineé también el documento de tecnologías. | [Diseño actual](../../docs/diseno.md) · [Tecnologías](../../docs/tecnologias.md) · [Verificación del diseño original](../dia-02/capturas/22-verificacion-diseno.png) |
| Día 2. Especificar las validaciones del navegador, servidor y base de datos. | La planeación mencionaba comprobaciones en el formulario y el servidor, pero faltaba detallar las reglas de cada capa. | Documenté la validación de campos, la identificación del propietario, el manejo de errores y las restricciones y políticas de acceso de Supabase. | [Validaciones por capa](../../docs/diseno.md#4-validaciones-por-capa) |
| Día 2. Preparar cinco issues, uno por historia, con criterios como lista de tareas. | Las funciones estaban descritas en la planeación. | Registré las cinco historias en los issues #2 a #6 y comprobé sus descripciones con GitHub CLI. | [Correspondencia entre historias e issues](#5-historias-de-usuario-e-issues) |
| Día 2. Proponer y justificar dos correcciones personales. | El umbral era fijo y la unicidad de los códigos no tenía un alcance explícito. | Elegí un mínimo configurable por producto y un SKU único por usuario, sin distinguir mayúsculas y minúsculas. | [Decisiones en la bitácora](../dia-02/README.md#correcciones-personales-posteriores-a-la-revisión-del-profesor) |
| Día 2. Completar la bitácora con prompts disponibles, una limitación o error, su detección y las decisiones aprobadas o rechazadas. | La bitácora resumía las revisiones de Codex y aún tenía problemas de formato. | Incorporé un prompt completo y dos fragmentos del Día 2, documenté la limitación de la comprobación de formato y conservé el registro de lo que aprobé y lo que dejé fuera de la autorización. | [Bitácora del Día 2](../dia-02/README.md) · [Captura del primer prompt](../dia-02/capturas/25-prompt-revision-coherencia.png) · [Comprobación original de la bitácora](../dia-02/capturas/46-verificacion-bitacora-dia-02.png) |

## 3. Correcciones del Día 1

Cambié la regla 5 de `AGENTS.md` para señalar que Supabase es la base elegida y se incorporará a partir del Día 4. En el README actualicé la lista de tecnologías, el modelo previsto y las reglas de existencias. Conservé las cinco funciones del inventario y las herramientas previstas. También mantuve las reglas de trabajo sobre ramas, pull requests, credenciales y autorización antes de borrar datos o desplegar. [AGENTS.md](../../AGENTS.md) · [README](../../README.md)

## 4. Correcciones del Día 2

Pasé de una lista de funciones a cinco historias con criterios verificables. En el diseño, mantuve la interfaz en HTML, CSS y JavaScript y el servidor en Node.js 22 con Express. El navegador enviará las solicitudes a Express y Express se comunicará con Supabase usando la identidad del usuario autenticado. En el documento de tecnologías expliqué también el papel de Python 3.12 como herramienta auxiliar y de Git, GitHub y Codex en el trabajo del proyecto. [Requisitos](../../docs/requisitos.md) · [Diseño](../../docs/diseno.md) · [Tecnologías](../../docs/tecnologias.md)

| Campo de `productos` | Regla prevista |
| --- | --- |
| `id` | Identificador único del producto, generado al registrarlo. |
| `user_id` | Identifica al propietario a partir de la sesión autenticada. |
| `nombre` | Texto obligatorio. |
| `sku` | Texto obligatorio que conserva los ceros iniciales. Es único por usuario, sin distinguir mayúsculas y minúsculas. |
| `cantidad` | Entero no negativo. |
| `minimo` | Entero no negativo, configurable por producto. |
| `created_at` | Fecha y hora de creación, asignadas al insertar. |

| Capa | Validaciones y controles previstos |
| --- | --- |
| Navegador | Comprueba nombre y SKU, exige cantidad y mínimo válidos, muestra mensajes y pide confirmación antes de eliminar. |
| Servidor | Repite las validaciones, verifica la sesión, limita las operaciones al propietario y comunica los errores de datos inválidos, duplicados o productos no disponibles. |
| Supabase | Aplica restricciones de integridad, un índice único por propietario y SKU normalizado y políticas de seguridad por fila (RLS) para limitar el acceso al inventario propio. |

## 5. Historias de usuario e issues

Comprobé que cada historia tiene entre tres y cinco criterios y que el issue correspondiente conserva su texto en casillas Markdown. [Criterios completos](../../docs/requisitos.md)

| Historia | Redacción | Criterios | Issue |
| --- | --- | --- | --- |
| HU-01 — Registrar productos | Como usuario, quiero registrar productos para llevar un control de mi inventario. | 4 | [#2](https://github.com/jimesssss/mini-inventario/issues/2) |
| HU-02 — Consultar productos y sus existencias | Como usuario, quiero consultar mis productos y sus existencias para saber cuáles debo reponer. | 5 | [#3](https://github.com/jimesssss/mini-inventario/issues/3) |
| HU-03 — Buscar productos | Como usuario, quiero buscar mis productos por nombre o SKU para encontrar un registro rápidamente. | 4 | [#4](https://github.com/jimesssss/mini-inventario/issues/4) |
| HU-04 — Editar productos | Como usuario, quiero editar mis productos para mantener actualizados sus datos y sus existencias. | 4 | [#5](https://github.com/jimesssss/mini-inventario/issues/5) |
| HU-05 — Eliminar productos | Como usuario, quiero eliminar productos de mi inventario para retirar los registros que ya no necesito. | 4 | [#6](https://github.com/jimesssss/mini-inventario/issues/6) |

## 6. Mis decisiones personales

### Mínimo configurable por producto

Antes, todos los productos tenían existencias bajas cuando quedaban entre una y cinco unidades. Decidí que cada producto tenga su propio mínimo porque una misma cantidad puede ser suficiente para uno y escasa para otro. Por ejemplo, con cuatro unidades un producto con mínimo de dos está disponible, mientras que otro con mínimo de cinco tiene existencias bajas. Con cero unidades el producto está agotado. El indicador cuenta todo mi inventario aunque aplique una búsqueda. Esta decisión aparece al registrar el mínimo en HU-01, al consultar el estado en HU-02 y al editarlo en HU-04. [Reglas de existencias](../../docs/diseno.md#estados-de-existencias)

### SKU único por usuario

La planeación ya impedía repetir códigos aunque cambiaran las mayúsculas, pero dejaba sin aclarar si la restricción era global. Decidí que se aplique dentro de cada inventario. Si ya tengo `ABC-01`, no puedo registrar `abc-01` como otro producto, pero otra persona sí puede usar ese código. Así puedo organizar mi inventario con mis propios códigos sin crear duplicados. La regla se comprueba en HU-01, criterio 4, y en HU-04, criterio 3. Codex me ayudó a revisar la coherencia de ambas decisiones y yo aprobé las justificaciones. [Requisitos](../../docs/requisitos.md) · [Modelo de productos](../../docs/diseno.md#2-tabla-productos)

## 7. Uso de Codex y verificaciones propias

En el Día 1 usé Codex para revisar la configuración inicial. La herramienta indicó que tenía dificultades para verificar Node.js y Python en su sesión y sugirió ejecutar `nvm use 22.20.0`. Antes de seguir esa recomendación, ejecuté `node --version` en PowerShell y obtuve `v22.20.0`. Decidí omitir la activación porque la versión ya estaba activa en mi terminal. [Bitácora del Día 1](../dia-01/README.md#6-uso-de-codex) · [Evidencia de la recomendación](../dia-01/capturas/08-codex-recomendacion.png)

En el Día 2 aprobé los cambios de coherencia y de reglas del inventario y limité la autorización a la documentación. Dejé para otra etapa la instalación de dependencias y la programación. La revisión final se centró en los archivos de planeación autorizados. La comprobación guardada de la bitácora solo mostraba el nombre y el tamaño del archivo. Al revisar su texto detecté barras invertidas reales antes de encabezados, negritas y viñetas. Autoricé retirar esos escapes y ajustar las tablas. Las capturas de la planeación muestran la detección y la comprobación de escapes similares en `docs/`. [Autorización](../dia-02/capturas/38-codex-correcciones-documentacion.png) · [Detección](../dia-02/capturas/33-deteccion-escapes-documentacion.png) · [Corrección](../dia-02/capturas/34-correccion-escapes-documentacion.png) · [Comprobación](../dia-02/capturas/35-verificacion-escapes-corregidos.png) · [Comprobación original de la bitácora](../dia-02/capturas/46-verificacion-bitacora-dia-02.png)

### Prompts recuperados

Los dos prompts del Día 1 quedaron escritos en su bitácora. Del Día 2 recuperé un prompt completo y dos fragmentos. El comienzo de los prompts de las capturas 37 y 38 queda pendiente de recuperar. Las transcripciones están en el anexo. [Fuentes del Día 1](../dia-01/README.md#6-uso-de-codex) · [Fuentes del Día 2](../dia-02/README.md#prompts-históricos-recuperados)

## 8. Comandos y verificaciones de Git

| Etapa | Comando o registro | Qué pude comprobar |
| --- | --- | --- |
| Día 1, preparación | `git init -b main`, `git status`, `git add .gitignore README.md AGENTS.md` y `git commit -m "Configuracion inicial de Mini Inventario"` | La bitácora documenta la preparación y el commit `b5789c4`. También registra la publicación inicial del repositorio y la comprobación mediante una clonación. [Bitácora](../dia-01/README.md#4-configuración-de-git-y-github) · [Primer commit](../dia-01/capturas/03-primer-commit.png) |
| Día 2, planeación original | `git switch -c dia-02-planeacion`, `git add` y `git diff --check` | Las capturas documentan la creación de la rama, la revisión de formato y la preparación de archivos. El historial contiene el commit `cd5b3c8` y el merge `69d6e67` del PR #1 de la planeación original. [Rama](../dia-02/capturas/08-creacion-rama-planeacion.png) · [Diff](../dia-02/capturas/40-git-diff-check.png) · [Preparación](../dia-02/capturas/41-git-add-documentacion.png) |
| Correcciones posteriores | `git log`, `git show` y `git status --short --branch` | El historial local contiene el commit `537461c` para `AGENTS.md` y `README.md`. Al redactar este reporte, los cambios de requisitos, diseño, tecnologías y bitácora del Día 2 seguían en el árbol de trabajo. |
| Issues | `gh issue create` y `gh issue list` | Antes de crear cada issue se revisaron los abiertos y cerrados para evitar duplicados. El listado final confirmó los cinco títulos y sus descripciones. |

Para comprobar el alcance de este reporte revisé el estado de Git y las huellas de los documentos antes y después, y ejecuté `git diff --check`. El PR #1 corresponde a la planeación original. El historial local consultado acredita el commit de la corrección del Día 1. La publicación remota de las correcciones queda sin confirmar.

## 9. Evidencias y resultados

| Evidencia | Qué muestra |
| --- | --- |
| [Herramientas del Día 1](../dia-01/capturas/01-herramientas.png) · [Archivos iniciales](../dia-01/capturas/02-archivos-iniciales.png) | Preparación inicial del entorno y del repositorio. |
| [Prompt completo](../dia-02/capturas/25-prompt-revision-coherencia.png) · [Segunda revisión](../dia-02/capturas/37-codex-revision-documentos.png) · [Autorización](../dia-02/capturas/38-codex-correcciones-documentacion.png) | Texto disponible de las solicitudes a Codex durante el Día 2. |
| [Verificación de escapes](../dia-02/capturas/35-verificacion-escapes-corregidos.png) · [Verificación de archivos preparados](../dia-02/capturas/42-verificacion-archivos-staged.png) | Controles sobre la documentación original. |
| [Bitácora actual](../dia-02/README.md#9-evidencias) · [Historias e issues](#5-historias-de-usuario-e-issues) | Índice de las 46 capturas del Día 2 y enlaces a los resultados de las correcciones. |

Terminé la actualización de los documentos de los días 1 y 2, registré las cinco historias con **21 criterios de aceptación** y documenté mis dos decisiones personales. La documentación ya describe de forma coherente el uso de Supabase a partir del Día 4, las reglas de existencias y el acceso al inventario por propietario. El resultado corresponde a la etapa de planeación y corrección documental.

## 10. Actividades pendientes y conclusión personal

- Agregar, si se solicitan como evidencia, capturas de los documentos corregidos y del listado de los cinco issues. Los documentos y los enlaces ya permiten consultar esos resultados.
- Buscar el inicio de los dos prompts parciales si encuentro el registro original.
- Continuar con el desarrollo del Día 3 e incorporar Supabase a partir del Día 4. La conexión, la creación de la tabla y la prueba de las políticas por usuario quedan para esa etapa.

Aprendí que una regla de inventario queda más clara cuando puedo comprobarla con un caso concreto. El mínimo configurable y el SKU por usuario me ayudaron a pasar de reglas generales a criterios que puedo probar. También aprendí a contrastar el diagnóstico de Codex con lo que veo en la terminal y a revisar el contenido de un archivo antes de dar por terminada su verificación.

## Anexo. Transcripción de prompts

### Día 1

#### Primer prompt utilizado

> Revisa los archivos README.md, AGENTS.md y .gitignore del proyecto Mini Inventario.
>
> Comprueba si la configuración inicial es adecuada para trabajar con Node.js 22, Python 3.12, Git y GitHub.
>
> Identifica posibles errores, riesgos o mejoras y explícame tus recomendaciones de forma clara.
>
> No modifiques archivos, no instales dependencias y no ejecutes comandos que cambien el proyecto. Solicita mi autorización antes de realizar cualquier cambio.

#### Segundo prompt utilizado

> En la revisión anterior indicaste que Node.js 22 está instalado, pero no activo. Comprueba nuevamente el estado de NVM y dime qué comando exacto debo ejecutar para activar Node.js 22.20.0 en esta sesión de Windows.
>
> No ejecutes cambios todavía. Solo explica el diagnóstico y el comando recomendado.

### Día 2

#### Primera revisión de coherencia (prompt completo)

[Captura 25](../dia-02/capturas/25-prompt-revision-coherencia.png)

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

[Captura 37](../dia-02/capturas/37-codex-revision-documentos.png)

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

[Captura 38](../dia-02/capturas/38-codex-correcciones-documentacion.png)

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