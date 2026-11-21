# Día 5 de 10 — Mini Inventario Pruebas

## Actividad 1. Instalación y preparación

| Comprobación | Resultado |
| --- | --- |
| Rama | `dia-05-desarrollo`, desde `5f2cc245`. |
| Node.js y npm | `v22.20.0` y `10.9.3`. En esta terminal se antepuso la instalación de Node.js 22 al PATH del proceso. |
| Playwright CLI | `npm install -g @playwright/cli@latest` instaló la versión `0.1.25`. `playwright-cli --help` terminó con código 0. |
| Skill de Codex | `npx skills add https://github.com/microsoft/playwright-cli --skill playwright-cli -a codex -y` instaló únicamente `playwright-cli`. Se verificó `.agents/skills/playwright-cli/SKILL.md`. |
| Servidor | `npm start` ejecuta `node --env-file-if-exists=.env src/server.js`. El puerto efectivo es 3000. `GET /` y `GET /api/salud` devolvieron HTTP 200. |
| Variables de pruebas | `TEST_EMAIL` y `TEST_PASSWORD` no están configuradas. No se leyeron sus valores en la salida ni se editó `.env`. |
| Cuenta de prueba | La evidencia del Día 4 registra dos sesiones válidas. La confirmación actual de una cuenta para el Día 5 queda pendiente de una sesión de prueba autorizada. |

## Incidencia de arranque

El puerto 3000 ya tenía una instancia de Mini Inventario. Un segundo arranque falló con un error al leer el puerto del servidor. La instancia existente respondió correctamente y se dejó en ejecución. Se comprobó un arranque nuevo con `PORT=0` en un proceso temporal. La página inicial y salud respondieron HTTP 200 y se cerró únicamente ese proceso.

## Preparación de la exploración

La exploración inicial puede comenzar en `http://localhost:3000` sin sesión. Para las pruebas con inicio de sesión, configurar `TEST_EMAIL` y `TEST_PASSWORD` directamente en el `.env` local ignorado, con una cuenta dedicada de Supabase Auth. Mantener los valores fuera del chat, comandos, capturas y evidencias.

Las futuras imágenes se guardarán en `capturas/` y las salidas de texto en `evidencias/`. Esta actividad no generó capturas ni ejecutó operaciones de escritura en Supabase.

## Inicio de sesión de prueba con Playwright

Se confirmó que `TEST_EMAIL` y `TEST_PASSWORD` tienen valores en el `.env` local ignorado por Git. Mini Inventario respondió en `http://localhost:3000` y la configuración de la aplicación apuntó al proyecto Supabase previsto.

Playwright CLI 0.1.25 abrió una sesión aislada de Chrome. Supabase Auth devolvió HTTP 200 y la aplicación mostró **Mis productos** y **Cerrar sesión**. El inventario estaba vacío. Las credenciales solo se transfirieron en memoria al flujo de prueba. Se cerró el navegador temporal al finalizar. El primer intento de abrir Chrome dentro del sandbox falló y se repitió con permisos para iniciar el navegador.

[Captura del inventario autenticado](capturas/01-inventario-autenticado.png). La captura oculta el área de datos del inventario y el contador. No se crearon, editaron ni eliminaron productos.

## Actividad 2. Exploración del inventario y existencias bajas

Playwright CLI 0.1.25 inició sesión con la cuenta de prueba en la aplicación local. El formulario se abrió y rechazó el envío vacío sin hacer ninguna solicitud de alta. Después aceptó los cuatro valores válidos. Se hizo un único POST a `/api/productos`, con HTTP 201, y apareció el mensaje **Producto registrado.**

| Campo | Valor |
| --- | --- |
| Nombre | Producto Prueba Día 5 |
| SKU | `PRUEBA-D05-MWPQ6WSZ-62C53A` |
| ID del producto sintético | `3c9f5b1d-bfb9-4ee6-b0b9-872318e99765` |
| Cantidad y mínimo | 3 y 10 |
| Resultado | La fila apareció en **Mis productos**, se resaltó y mostró **Existencias bajas**. El contador aumentó en 1. |
| Limpieza | Pendiente. El producto permanece en la cuenta de prueba. Para la limpieza posterior, verificar juntos el SKU y el ID y actuar solo sobre esta fila. |

Durante el flujo se registraron 0 errores de consola, 0 excepciones de página, 0 respuestas HTTP de error y 0 solicitudes de red fallidas. Las capturas muestran únicamente el producto sintético y excluyen las credenciales y los datos de otros productos.

### Problemas observados

1. **Los avisos de validación quedan visibles al corregir los campos.** En escritorio, abrir **Agregar producto**, pulsar **Guardar** con los campos vacíos y rellenar los cuatro campos con datos válidos. Antes del siguiente envío, siguen visibles los bordes rojos y avisos de error. El segundo envío sí guardó el producto. [Formulario en escritorio, 1280 × 800](capturas/02-formulario-producto-escritorio.png)
2. **El estado y las acciones quedan fuera de la vista inicial en móvil.** A 390 × 844, buscar el SKU ficticio y observar la tabla sin desplazarla. El contenedor mide 292 px y su contenido 589 px. La página mide 390 px y no tiene desbordamiento horizontal global. El estado y los botones **Editar** y **Eliminar** aparecen al desplazar horizontalmente la tabla. **Agregar producto** y **Cerrar sesión** quedan visibles. [Vista inicial móvil](capturas/04-inventario-movil-tabla.png) · [Vista móvil desplazada](capturas/05-inventario-movil-acciones.png)

[Resultado de existencias bajas en escritorio, 1280 × 800](capturas/03-existencias-bajas-escritorio.png). Se conservaron las cuatro capturas de esta actividad. No se corrigieron los problemas observados ni se editó o eliminó ningún producto.

## Actividad 3. Validación del formulario al corregir campos

**Reproducción.** En una sesión de prueba, abrir **Agregar producto**, pulsar **Guardar** con el formulario vacío y rellenar los cuatro campos con valores válidos. Antes de la corrección, los avisos rojos y `aria-invalid="true"` permanecían en los cuatro campos hasta volver a pulsar **Guardar**.

**Causa.** El formulario actualizaba los avisos al enviar, abrir o cerrar, pero no al editar un campo que ya mostraba un error.

**Corrección.** En `public/js/app.js`, el evento `input` vuelve a aplicar la validación existente al campo que se está corrigiendo cuando ya tiene un aviso. Actualiza su mensaje y `aria-invalid` sin mover el foco ni enviar el formulario. Al resolver todos los avisos se limpia también el mensaje general de validación. La validación al enviar se conserva.

| Comprobación en Playwright CLI | Antes | Después |
| --- | --- | --- |
| Guardar con los campos vacíos | Cuatro avisos, cero escrituras | Cuatro avisos, cero escrituras |
| Corregir nombre y SKU, dejando cantidad negativa y mínimo decimal | Cuatro avisos | Solo dos avisos numéricos |
| Corregir cantidad y mínimo sin volver a guardar | Cuatro avisos | Cero avisos, `aria-invalid="false"` y mensaje general limpio |

Playwright comprobó que el producto ficticio de la Actividad 2 seguía visible. En ambos recorridos se bloquearon las escrituras de productos y no se intentó ninguna. `npm test` aprobó 3 de 3 y `git diff --check` terminó con código 0.

Archivos modificados: `public/js/app.js` y esta bitácora. Evidencias: [captura original del problema](capturas/02-formulario-producto-escritorio.png) y [captura corregida, 1280 × 800](capturas/06-formulario-validacion-corregida.png), con el inventario y el contador ocultos.

## Actividad 4. Pruebas permanentes con Playwright Test

Se instaló `@playwright/test` 1.65.1 como dependencia de desarrollo con `npm install -D @playwright/test`. Se agregaron `playwright.config.js` y `tests/inventario.spec.js`. Playwright usa Chrome, un trabajador y cero reintentos. `webServer` ejecuta `npm start` en el puerto 3000 si la aplicación todavía no está escuchando. En esta ejecución reutilizó la instancia de Mini Inventario que ya respondía. Cada prueba usa un contexto de navegador independiente.

Ejecutar `npx playwright test` desde la raíz con Node.js 22, Chrome instalado y las variables de la cuenta de prueba en el `.env` local ignorado por Git. La configuración carga las variables sin registrar sus valores. Las trazas, los videos y las capturas automáticas están desactivados. La suite simulada se ejecuta por separado con `npm test`.

| Prueba | Resultado verificado |
| --- | --- |
| Inicio de sesión válido | Pasó. Se mostraron **Mis productos** y **Cerrar sesión**. |
| Contraseña incorrecta | Pasó. Un intento fue rechazado y el inventario permaneció oculto. |
| Agregar producto ficticio | Pasó. Alta HTTP 201, fila visible y estado **Disponible**. Limpieza HTTP 204 y cero filas para el SKU. |
| Detectar existencias bajas | Pasó. La cantidad 3 quedó por debajo del mínimo 10 y la fila mostró **Existencias bajas** con resaltado. Limpieza HTTP 204 y cero filas para el SKU. |

La limpieza en `finally` verificó SKU, ID y los datos exactos de cada producto sintético antes de eliminarlo con la sesión de prueba. La auditoría posterior del MCP en solo lectura devolvió cero filas para los dos SKU automatizados y confirmó que el registro de la Actividad 2 seguía presente con el mismo ID, cantidad y mínimo. Los SKU e ID creados quedaron en la evidencia. No se cambiaron políticas RLS ni la estructura de Supabase.

`npx playwright test` aprobó 4 de 4. `npm test` aprobó 3 de 3 y `git diff --check` devolvió 0. No hubo fallos de pruebas. Node avisó que FORCE_COLOR prevalecía sobre NO_COLOR, sin afectar el resultado. [Salida de las pruebas y verificación de limpieza](evidencias/04-playwright-test.txt)

## Actividad 5. Detección y reversión de una regresión controlada

En `public/js/app.js`, `bajoMinimo` devuelve `cantidad < minimo`. Se guardó una copia en memoria de los bytes originales. Su SHA-256 era `7BD908D4458ED6654656E4943B05FEEE6B4D47C4919DC235A214827820DE3D82`. Se registró también la huella de la suite para comprobar que las pruebas permanecieran iguales.

| Fase | Comparación | Resultado de `npx playwright test` | Evidencia |
| --- | --- | --- | --- |
| Estado correcto | `cantidad < minimo` | 4 aprobadas, salida 0 | [Antes](evidencias/05-playwright-antes.txt) |
| Regresión provocada | `cantidad === minimo` | 3 aprobadas y 1 fallida, salida 1 | [Fallo provocado](evidencias/05-playwright-fallo-provocado.txt) |
| Estado restaurado | `cantidad < minimo` | 4 aprobadas, salida 0 | [Después](evidencias/05-playwright-despues.txt) |

La igualdad temporal hizo que 3 y 10 no activaran el estado **Existencias bajas**. La prueba **detectar existencias bajas** localizó la fila por su SKU sintético, pero su aserción falló al buscar la celda con ese texto. La limpieza de esa prueba se ejecutó aunque la aserción falló. Los otros tres casos pasaron.

La reversión se ejecutó en `finally` y restauró los bytes iniciales. Las huellas del código y de las pruebas coincidieron y se comprobó que la comparación temporal no quedó en el archivo. La última corrida verificó los dos estados de existencias y el resto de la suite. `npm test` aprobó 3 de 3 y `git diff --check` terminó con código 0.

La consulta independiente por MCP en solo lectura confirmó cero filas para los seis SKU automatizados de las tres ejecuciones. El producto `PRUEBA-D05-MWPQ6WSZ-62C53A` de la Actividad 2 se conservó con su ID, cantidad y mínimo.

### Decisiones y comandos

- **Error real de la IA en la Actividad 1.** Intenté iniciar una segunda instancia en el puerto 3000 antes de comprobar si ya estaba ocupado. El arranque falló al leer el puerto. Comprobé la instancia existente mediante un GET y validé otro arranque con un puerto temporal.
- **Comando aprobado en esta actividad.** Se autorizó `npx playwright test` en las tres fases para verificar la regresión. La suite usó un solo trabajador, SKU únicos y limpieza de los registros que creó, por SKU e ID. La comparación incorrecta fue intencional y transitoria.

## Índice visual y cierre de evidencias

Las capturas 01 a 06 son originales de las actividades y se conservaron sin cambios. La captura 07 se obtuvo posteriormente, en una sesión aislada y sin autenticación, para mostrar el estado actual de localhost. Las verificaciones históricas que solo tienen registro documental conservan su salida original.

| Actividad | Capturas y evidencia |
| --- | --- |
| 1. Instalación y preparación | [07 · Aplicación actual en localhost:3000](capturas/07-aplicacion-localhost-3000.png). La instalación del CLI y la skill queda respaldada por la [verificación actual de versiones y manifiesto](evidencias/06-verificacion-para-publicacion.txt). |
| 2. Exploración | [01 · Sesión de prueba autenticada](capturas/01-inventario-autenticado.png), [02 · Formulario](capturas/02-formulario-producto-escritorio.png), [03 · Alta y existencias bajas en escritorio](capturas/03-existencias-bajas-escritorio.png), [04 · Vista móvil inicial](capturas/04-inventario-movil-tabla.png), [05 · Vista móvil desplazada](capturas/05-inventario-movil-acciones.png). La revisión de consola y red se registró en esta bitácora, sin captura original disponible. |
| 3. Corrección | [02 · Problema original](capturas/02-formulario-producto-escritorio.png) y [06 · Formulario corregido](capturas/06-formulario-validacion-corregida.png). |
| 4. Pruebas permanentes | [Salida original de las cuatro pruebas y su limpieza](evidencias/04-playwright-test.txt). No hay captura original de esa ejecución. |
| 5. Regresión controlada | Salidas originales [antes](evidencias/05-playwright-antes.txt), [durante el fallo](evidencias/05-playwright-fallo-provocado.txt) y [después](evidencias/05-playwright-despues.txt). La salida posterior incluye la verificación de la restauración. No hay capturas originales de estas corridas. |
| Cierre | [Verificación previa a la limpieza](evidencias/06-verificacion-para-publicacion.txt) y [registro final de limpieza](evidencias/07-limpieza-final-producto.txt). `npm test` aprobó 3 de 3. `npx playwright test --list` encontró cuatro pruebas. La última ejecución completa de Playwright aprobó 4 de 4 y consta en la evidencia de la Actividad 5. |

La consola de la visita actual a la página de acceso registró un HTTP 404 por `/favicon.ico`. La página inicial y salud respondieron HTTP 200. Ese resultado pertenece a la visita actual y queda separado de la revisión de consola registrada durante la Actividad 2.

En la revisión previa del paquete, el MCP de solo lectura confirmó cero productos de las pruebas automatizadas y un único SKU de prueba del Día 5 presente, el de la Actividad 2. No se repitieron escrituras para obtener capturas. El resultado posterior de la eliminación se documenta a continuación.

### Limpieza final autorizada

Se consultó en solo lectura el producto sintético `PRUEBA-D05-MWPQ6WSZ-62C53A`, ID `3c9f5b1d-bfb9-4ee6-b0b9-872318e99765`. La sesión de prueba confirmó una única fila con el SKU, ID, nombre, cantidad 3, mínimo 10 y propietario esperado. Se eliminó por PostgREST con filtros simultáneos por los seis valores. La respuesta HTTP 200 confirmó exactamente una fila y devolvió el ID autorizado.

Una consulta independiente por MCP confirmó cero candidatos por ID o SKU, cero productos automatizados del Día 5 y cero filas con prefijo `PRUEBA-D05-`. El conteo y la huella agregada de los demás productos coincidieron antes y después. Se guardó el [registro técnico de limpieza](evidencias/07-limpieza-final-producto.txt) sin datos del propietario. Esta operación tiene evidencia documental y no se generó una captura retrospectiva.

El ZIP actualizado contiene 14 archivos: 7 capturas, 6 registros de texto y este índice. El Día 5 queda listo para preparar el Pull Request.
