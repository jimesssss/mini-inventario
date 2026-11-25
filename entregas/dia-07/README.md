# Día 7 · Mini Inventario

## Actividad 1 · Prueba sin la skill

La actividad recuperó la prueba de edición generada el 23 de noviembre de 2026 sin la skill `pruebas-inventario`, archivó ambos archivos del resultado original y reprodujo su descarte en un clon temporal el **24 de noviembre de 2026**. La entrega está en la rama local `dia-07-skill`. Las capturas se incorporarán al finalizar el Día 7.

## Conversación original del 23 de noviembre

Sesión de Codex `01a20925-20e5-77a0-aa66-2e97d0257e92`. El primer prompt exacto fue «Escribe una prueba de Playwright para editar un producto». El segundo pidió recuperar y verificar la evidencia antes de descartar la prueba. Los archivos conservan el texto literal de ambos mensajes, incluidos los saltos de línea. [Prompt inicial](evidencias/prompt-01.txt) · [Prompt de revisión](evidencias/prompt-02.txt)

Codex añadió el caso de HU-04 que abre el formulario, comprueba sus cuatro valores precargados, modifica nombre, cantidad y mínimo, y verifica que se conservan esos cambios, el SKU y el estado «Existencias bajas» al recargar. También ajustó la limpieza compartida de `productoTemporal` para identificar la fila mediante su SKU e ID cuando el alta confirmó el ID. Los cuerpos y las aserciones de los cuatro casos previos quedaron intactos. [Archivo completo de Playwright](evidencias/original-sin-skill/tests/inventario.spec.js) · [Bitácora original](evidencias/original-sin-skill/entregas/dia-07/prueba-edicion.md) · [Commit 9f4836d en GitHub](https://github.com/jimesssss/mini-inventario/commit/9f4836d69aa983de5adc79584a3318ffc2bdfa36)

La sesión registró el éxito de `node --check` en Node.js 22.20.0, cinco casos detectados con `test --list` y tres pruebas simuladas de Node.js aprobadas. La prueba de edición quedó **sin ejecutar en el navegador contra Supabase**. La bitácora original documentaba esos resultados y las incidencias del entorno. El archivo completo y el diff conservan el caso y el ajuste de limpieza para la comparación posterior. [Bitácora de comandos, errores y decisiones](evidencias/bitacora.md)

## Descarte posterior en un clon aislado

El 24 de noviembre se tomó como base el padre de `9f4836d` y se aplicó el diff histórico al índice y al árbol de trabajo de un clon temporal con HEAD separado. El árbol reconstruido coincidió con el del commit original. Después se restauraron desde el padre únicamente las dos rutas de la actividad. El estado final quedó limpio y `git diff --exit-code HEAD --` devolvió 0. Los archivos originales, el commit, las referencias de las ramas y los cambios locales se conservaron.

- [Diff completo guardado antes del descarte](evidencias/descarte.diff)
- [Salida de git status antes del descarte](evidencias/git-status-antes.txt)
- [Salida de git status después del descarte](evidencias/git-status-despues.txt)
- [Resultado de las comprobaciones del clon](evidencias/verificacion-descarte.txt)

## Actividad 2 · Creación de la skill

Se creó `pruebas-inventario` para guiar la creación, revisión y ejecución de pruebas de interfaz de Mini Inventario. Las instrucciones se basan en `playwright.config.js`, la suite existente y las historias de usuario. Incluyen credenciales por variables de entorno, datos sintéticos, limpieza acotada, aislamiento entre usuarios, selectores accesibles y comprobación de los resultados de ejecución. [Contenido de la skill](../../.agents/skills/pruebas-inventario/SKILL.md)

El validador de `skill-creator` aceptó el archivo y el servidor local de Codex listó la skill habilitada con ámbito `repo`. La segunda prueba de edición queda reservada para una conversación limpia. [Prompt de la actividad](evidencias/actividad-02-prompt.txt) · [Bitácora de validación](evidencias/actividad-02-bitacora.md) · [Resultado de descubrimiento](evidencias/actividad-02-descubrimiento.json)

## Actividad 3 · Prueba de edición con la skill

Se repitió literalmente «Escribe una prueba de Playwright para editar un producto», sin nombrar ni invocar la skill. Antes de editar, Codex anunció que usaría `pruebas-inventario` y `playwright-cli` y leyó ambos archivos `SKILL.md`. Esto documenta la selección automática por el contenido del prompt. El resultado de `skills/list` de la Actividad 2 confirma que la skill estaba disponible y habilitada. La evidencia de uso procede de la conversación y las llamadas de lectura. [Prompt original](evidencias/prompt-01.txt) · [Registro del segundo prompt y selección](evidencias/actividad-03-activacion.md) · [Descubrimiento de la skill](evidencias/actividad-02-descubrimiento.json)

| Aspecto | Sin la skill, commit `9f4836d` | Con `pruebas-inventario` |
| --- | --- | --- |
| Edición válida | Comprueba el encabezado de edición, los cuatro valores precargados, el estado inicial «Disponible» y el contenido completo de la fila tras guardar. | Comprueba los cuatro valores precargados, guarda nombre, cantidad y mínimo, conserva el SKU y verifica el mensaje de éxito y el estado «Existencias bajas». Omite las comprobaciones explícitas del encabezado y del estado inicial. |
| Validación | Cubre el guardado válido. | Añade un intento de guardar un nombre de solo espacios junto con un cambio de cantidad. Comprueba `aria-invalid`, el mensaje de validación y, después de recargar, que el nombre y la cantidad guardados se conservan. La comprobación posterior al rechazo cubre esos dos valores. Quedan pendientes SKU duplicado, otros campos inválidos y producto no disponible. |
| Selectores | Combina IDs, roles y etiquetas. La comprobación de la fila depende del orden de todas las celdas y del texto de las acciones. | Usa la etiqueta del buscador, el grupo «Datos del producto» y sus etiquetas, y valida celdas individuales. Reutiliza la fila del fixture identificada por SKU. Algunos nombres accesibles permiten coincidencias parciales y el fixture compartido conserva selectores por ID y estructura. |
| Persistencia | Recarga y espera la fila sin iniciar sesión nuevamente. Con `persistSession: false`, esa comprobación queda bloqueada en el inicio de sesión. | Inicia sesión y vuelve a filtrar por SKU después de cada recarga. Reabre el formulario para verificar los cuatro valores después del guardado válido. La persistencia tras el rechazo se comprueba por nombre y cantidad. |
| Seguridad y aislamiento | Usa las variables de entorno y el fixture autenticado de la suite, que comprueba la configuración local y usa la sesión del propietario. | Conserva las mismas protecciones. El caso nuevo usa una sola cuenta. El aislamiento entre usuarios y las políticas RLS quedan fuera de su cobertura. |
| Limpieza | Genera un SKU único con `randomUUID()`. En `finally`, exige un único resultado por SKU y el ID confirmado. Si se perdió la respuesta de alta, exige que coincidan los datos originales. Verifica HTTP 204 y la ausencia del SKU. | Conserva las mismas garantías con una condición escrita de otra forma. En ambas versiones, si una regresión cambia el SKU, la búsqueda puede dejar de encontrar el producto y la limpieza se detiene. Un fallo al eliminar o verificar se informa como error. |

**Correcciones manuales del usuario registradas: 0.** Durante la generación, Codex hizo un ajuste de limpieza en el primer parche y una autocorrección posterior, que añadió el inicio de sesión tras las dos recargas al detectar `persistSession: false`. El ajuste de limpieza ya tenía un equivalente en la versión original. La comparación posterior archivó el código con la skill sin editar la prueba.

**Resultado de verificación.** Node.js 22.20.0 aceptó la sintaxis y Playwright detectó cinco casos en la suite. Después de recibir autorización para operar exclusivamente sobre el producto temporal, se ejecutó «editar producto y rechazar un nombre vacío» en Chrome contra Supabase con Playwright 1.65.1. **El caso pasó en 13.1 s.** Confirmó el guardado válido, la persistencia tras recargar, el rechazo del nombre compuesto por espacios y la conservación de los datos guardados tras el rechazo. [Bitácora de errores y verificaciones](evidencias/actividad-03-prueba-edicion.md) · [Evidencia de ejecución](evidencias/actividad-03-ejecucion-playwright.txt)

El fixture verificó el borrado del producto temporal por ID y SKU único. La consulta posterior devolvió cero filas con ese SKU. Se revisó que la limpieza esté en `finally` y se ejecute tras una aserción fallida. La limpieza se observó en la ejecución aprobada. La prueba y su copia archivada conservan el mismo contenido.

**Estado de las ramas.** `dia-07-skill` y `dia-07-prueba-editar-producto` apuntan a `412bbc3`, con cero commits exclusivos en ambos sentidos. La rama activa es `dia-07-prueba-editar-producto`. La prueba modificada y los archivos nuevos del Día 7 siguen en el árbol de trabajo. Se consultaron ambas referencias sin cambiar de rama.

- [Código completo con la skill](evidencias/con-skill/tests/inventario.spec.js)
- [Código original sin la skill](evidencias/original-sin-skill/tests/inventario.spec.js)
- [Diff entre el commit original y la versión con la skill](evidencias/actividad-03-comparacion.diff)
- [Diff de la versión con la skill respecto a la base de ambas ramas](evidencias/actividad-03-cambio-con-skill.diff)

## Actividad 4 · Creación y ejecución de revisor-pr

Se creó `.codex/agents/revisor-pr.toml` en la rama local `dia-07-revisor-pr`. El agente revisa `git diff main` para detectar secretos, cambios con cobertura insuficiente y operaciones sin protección por usuario. Su definición limita la revisión a comandos de lectura e indica que los hallazgos deben incluir gravedad, archivo y línea cuando esté disponible, sin copiar valores secretos. [Prompt exacto de creación](evidencias/actividad-04-prompt-creacion.txt) · [Contenido completo del TOML](evidencias/actividad-04-revisor-pr.toml)

Python 3.12 validó el TOML con `tomllib` y comprobó sus tres campos requeridos. Git bloqueó inicialmente la creación de la rama y la operación se completó con permiso ampliado. El lanzador `py` faltaba y el ejecutable base del entorno virtual devolvió acceso denegado. La validación se completó con Python del runtime de Codex. [Validación e incidencias](evidencias/actividad-04-validacion.md)

La revisión se delegó mediante `collaboration.spawn_agent` a `/root/revisor_pr`, el identificador aceptado por la herramienta para la tarea de `revisor-pr`. El registro **Started** conserva la llamada y el identificador devuelto. La primera espera agotó su plazo y se volvió a esperar al mismo agente. El registro **Completed** conserva la confirmación de espera y la recepción de `FINAL_ANSWER`. [Prompt exacto de ejecución](evidencias/actividad-04-prompt-ejecucion.txt) · [Registro de delegación](evidencias/actividad-04-delegacion.txt)

El subagente revisó el diff contra `main` local en `412bbc3`. El único archivo del diff fue `tests/inventario.spec.js` con 49 líneas añadidas y una eliminada. Dentro de ese alcance, no encontró secretos incrustados ni consultas o escrituras nuevas sin protección por usuario. [Informe completo del subagente](evidencias/actividad-04-informe-revisor-pr.md)

| Gravedad | Archivo y línea | Hallazgo | Recomendación |
| --- | --- | --- | --- |
| Media | `tests/inventario.spec.js:114` | Si una regresión cambia el SKU durante la edición, el fixture puede dejar guardado el producto temporal porque busca primero por el SKU original, aunque conoce el ID. | Resolver la discrepancia por ID dentro de la sesión propietaria, verificar la identidad antes del borrado y comprobar después la ausencia por ID y SKU. |
| Baja | `tests/inventario.spec.js:112` | Faltan pruebas aisladas de la limpieza tras una aserción fallida, de la recuperación cuando el alta no confirma el ID y del rechazo cuando el ID no coincide. | Cubrir esas ramas con respuestas controladas y comprobar que el fixture impide el borrado cuando la identidad es ambigua. |

La revisión fue estática. El agente leyó las rutas de productos y las políticas RLS como contexto. La aplicación efectiva de RLS en Supabase quedó fuera del alcance, al igual que la ejecución de pruebas. En el momento de la revisión, `git diff main` excluyó **78 archivos no rastreados**.

| Archivos excluidos | Cantidad |
| --- | ---: |
| `.agents/skills/` | 52 |
| `.codex/agents/revisor-pr.toml` | 1 |
| Imágenes del Día 4 | 4 |
| Archivos del Día 7 | 19 |
| `skills-lock.json` | 1 |
| `src/db/database.js` | 1 |

También quedaron fuera la configuración local y las dependencias ignoradas. El informe original conserva el estado de los hallazgos en ese momento. Las capturas se agregarán al finalizar el Día 7.

### Correcciones y revisión de seguimiento

- **Gravedad media.** Si el SKU cambia, el fixture usa el ID confirmado del alta para recuperar el producto desde el inventario autenticado del propietario. Se detiene si el ID y el SKU señalan filas distintas o si la identidad es ambigua. El borrado reutiliza la sesión del alta y verifica la ausencia por ID, SKU original y SKU encontrado.
- **Gravedad baja.** Se añadieron seis pruebas controladas. Cubren la limpieza por ID tras una aserción fallida y un SKU cambiado, el alta sin ID, tres formas de identidad ambigua y la verificación de ausencia tras el borrado.

Las seis pruebas controladas pasaron con Node.js 22.20.0. El caso de edición volvió a pasar en Chrome contra Supabase con Playwright 1.65.1 en **11.2 s**. Tras el borrado, el fixture verificó cero filas coincidentes con el ID y los SKU del producto temporal. El caso real conservó el SKU. La recuperación con SKU cambiado y los rechazos por ambigüedad se verificaron con respuestas controladas. [Resultados de las pruebas](evidencias/actividad-04-verificacion-correcciones.txt)

Se delegó la revisión de seguimiento al mismo subagente, que confirmó ambos hallazgos como resueltos por inspección. El agente abrió los dos archivos nuevos además de `git diff main`, que los omite mientras estén sin rastrear. El diff archivado incluye esos archivos y compara la corrección con la versión generada con la skill en la Actividad 3. [Diff de las correcciones](evidencias/actividad-04-correcciones.diff) · [Informe de seguimiento](evidencias/actividad-04-informe-seguimiento-revisor-pr.md)

## Auditoría final y preparación del cierre

Se anonimizaron únicamente los segmentos de usuario en dos evidencias. Los datos técnicos y los resultados se conservaron, y las copias originales quedaron en una carpeta local ignorada por Git. Las reglas de exclusión cubren también `.env`, las dependencias y el módulo legado `src/db/database.js`.

La propuesta conserva la skill propia y el subagente junto con `skills-lock.json`. El lock fija las revisiones de las tres skills externas. Sus carpetas instaladas se mantienen locales. La rama activa sigue siendo `dia-07-revisor-pr` y los cambios continúan en el directorio de trabajo. Las capturas pendientes del Día 4 se organizarán por separado. [Informe de auditoría, licencias y lista exacta de archivos por commit](evidencias/auditoria-final-dia-07.md)

## Evidencias fotogr?ficas del D?a 7

Se incorporaron 25 de 27 capturas. Seis son copias anonimizadas con m?scaras opacas sobre rutas personales. Se conservaron localmente dos variantes que repiten la solicitud y el resultado de Playwright. La numeraci?n de la tabla es la de publicaci?n.

| N? | Actividad | Descripci?n | Imagen |
| --- | --- | --- | --- |
| 01 | 1 | Plan de revisi?n de la prueba sin skill | [Captura 01](evidencias/capturas/01_revision_actividad_1.png) |
| 02 | 1 | Solicitud para documentar la prueba original | [Captura 02](evidencias/capturas/02_prompt_documentacion_actividad_1.png) |
| 03 | 1 | Resultado de la documentaci?n y del descarte aislado | [Captura 03](evidencias/capturas/03_resultado_documentacion_actividad_1.png) |
| 04 | 2 | Solicitud de creaci?n y validaci?n de la skill propia | [Captura 04](evidencias/capturas/04_prompt_actividad_2.png) |
| 05 | 3 | Selecci?n del directorio de trabajo para la conversaci?n nueva | [Captura 05](evidencias/capturas/05_seleccion_conversacion.png) |
| 06 | 3 | Inicio de Codex en una conversaci?n limpia | [Captura 06](evidencias/capturas/06_inicio_codex.png) |
| 07 | 3 | Prompt de edici?n y anuncio de uso de las skills | [Captura 07](evidencias/capturas/07_prompt_prueba_edicion.png) |
| 08 | 3 | Generaci?n y descubrimiento de la prueba | [Captura 08](evidencias/capturas/08_resultado_prueba_edicion.png) |
| 09 | 3 | Solicitud de comparaci?n de las dos versiones | [Captura 09](evidencias/capturas/09_prompt_documentacion_actividad_3.png) |
| 10 | 2 | Contenido y resultado de la creaci?n de pruebas-inventario | [Captura 10](evidencias/capturas/10_resultado_skill_pruebas_inventario.png) |
| 11 | 3 | Resultado de la comparaci?n y verificaci?n est?tica | [Captura 11](evidencias/capturas/11_resultado_comparacion.png) |
| 12 | 3 | Solicitud de verificaci?n en navegador | [Captura 12](evidencias/capturas/12_prompt_verificacion_playwright.png) |
| 13 | 3 | Resultado de Playwright y confirmaci?n del borrado | [Captura 13](evidencias/capturas/13_resultado_playwright.png) |
| 14 | 4 | Solicitud de creaci?n de revisor-pr | [Captura 14](evidencias/capturas/14_prompt_creacion_subagente.png) |
| 15 | 4 | Validaci?n TOML y resultado de la creaci?n | [Captura 15](evidencias/capturas/15_resultado_creacion_subagente.png) |
| 16 | 4 | Solicitud de revisi?n y registro Started | [Captura 16](evidencias/capturas/16_prompt_ejecucion_subagente.png) |
| 17 | 4 | Registro Completed e informe de los dos hallazgos | [Captura 17](evidencias/capturas/17_informe_subagente.png) |
| 18 | 4 | Solicitud de documentaci?n de la revisi?n | [Captura 18](evidencias/capturas/18_prompt_documentacion_actividad_4.png) |
| 19 | 4 | Resultado de la documentaci?n de la Actividad 4 | [Captura 19](evidencias/capturas/19_resultado_documentacion_actividad_4.png) |
| 20 | 4 | Solicitud de correcci?n de los dos hallazgos | [Captura 20](evidencias/capturas/20_prompt_correccion_hallazgos.png) |
| 21 | 4 | Pruebas y revisi?n de seguimiento | [Captura 21](evidencias/capturas/21_resultado_correcciones.png) |
| 22 | Cierre | Solicitud de auditor?a final | [Captura 22](evidencias/capturas/22_prompt_auditoria_final.png) |
| 23 | Cierre | Resultado de la auditor?a y propuesta de commits | [Captura 23](evidencias/capturas/23_resultado_auditoria_final.png) |
| 24 | Cierre | Solicitud de preparar los archivos para publicaci?n | [Captura 24](evidencias/capturas/24_prompt_preparacion_cierre.png) |
| 25 | Cierre | Resultado de la anonimizaci?n textual y el plan de publicaci?n | [Captura 25](evidencias/capturas/25_resultado_preparacion_cierre.png) |
