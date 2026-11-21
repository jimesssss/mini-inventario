# Día 6 de 10 — Pruebas e integración continua

**Fecha:** 20 de noviembre de 2026

**Rama:** `dia-06-ci`, creada desde `main` en `2893377821ef21f2faa7c7e7c7cbdbdc3f14cc07`.

## Objetivo y herramientas

Automatizar las cuatro pruebas de Mini Inventario en cada Pull Request autorizado hacia `main` y demostrar que GitHub Actions detecta una falla y vuelve a aprobar tras corregirla en el [mismo PR #13](https://github.com/jimesssss/mini-inventario/pull/13).

Se usaron Git, GitHub CLI, GitHub Actions, Node.js 22, npm, Playwright Test, Chrome local, Chromium en CI y actionlint. Express sirvió la aplicación en el puerto 3000. Supabase Auth y PostgreSQL respaldaron las pruebas con la cuenta autorizada. Las verificaciones independientes del inventario se hicieron mediante MCP en solo lectura.

## Actividad 1. Preparación y ejecución local

`git ls-remote --heads origin main dia-06-ci` confirmó que el `main` remoto coincidía con el local. Se revisaron `git status`, los ignorados y el stash. Se creó la rama con `git switch --no-overwrite-ignore -c dia-06-ci main` y se verificaron las huellas de los 57 archivos no rastreados y tres archivos locales protegidos antes y después del cambio.

| Herramienta | Comando | Resultado |
| --- | --- | --- |
| Node.js | `node -v` | 22.20.0 |
| npm | `npm -v` | 10.9.3 |
| Playwright Test | `npx --no-install playwright --version` | 1.65.1 |
| GitHub CLI | `gh --version` | 2.103.2 |

`playwright.config.js` carga el `.env` ignorado, usa Chrome y ejecuta las pruebas con un trabajador y cero reintentos. `webServer` puede arrancar `npm start` en el puerto 3000. La ejecución reutilizó la instancia local existente. Se verificaron Express, Supabase JS y Playwright Test, y `GET /` y `GET /api/salud` devolvieron HTTP 200.

Antes de ejecutar la suite se comprobó que `TEST_EMAIL`, `TEST_PASSWORD`, `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` estaban configuradas. Se usó la misma configuración local de la cuenta de prueba validada en el Día 5, sin mostrar sus valores. La aplicación apuntaba a ese proyecto y la suite incluía SKU únicos, verificación del producto por SKU, ID y valores esperados, y limpieza en `finally` mediante la sesión propietaria.

### Resultado de `npx playwright test`

| Prueba | Resultado |
| --- | --- |
| Inicio de sesión válido | Aprobada |
| Contraseña incorrecta rechazada | Aprobada |
| Agregar producto ficticio | Aprobada y producto eliminado |
| Detectar existencias bajas | Aprobada y producto eliminado |

La suite aprobó 4 de 4 en 11,6 s. La comprobación posterior mediante MCP en solo lectura devolvió cero SKU de prueba del Día 5, incluidos los que generó esta corrida al reutilizar la suite. El conteo y la huella agregada de las demás filas coincidieron antes y después.

- [Salida técnica de Playwright y comprobación de limpieza](evidencias/01-playwright-local.txt)
- [Aplicación local sin autenticar, capturada después de la ejecución](capturas/01-aplicacion-localhost.png)

Durante la Actividad 1 no se configuraron workflows ni secretos de GitHub.

## Actividad 2. Secretos de GitHub Actions

Se confirmó que `gh` está autenticado en GitHub y tiene acceso a `jimesssss/mini-inventario`. La consulta inicial de nombres de secretos del repositorio terminó con código 0 y devolvió una lista vacía.

| Secreto en GitHub | Variable que recibirá la aplicación o Playwright |
| --- | --- |
| `SUPABASE_URL` | `SUPABASE_URL` |
| `SUPABASE_KEY` | `SUPABASE_PUBLISHABLE_KEY` |
| `TEST_EMAIL` | `TEST_EMAIL` |
| `TEST_PASSWORD` | `TEST_PASSWORD` |

El servidor y la suite actual requieren una clave publicable `sb_publishable_`. Se verificó localmente el tipo de clave y la presencia de las cuatro variables sin mostrar sus valores. El futuro workflow asignará `SUPABASE_PUBLISHABLE_KEY: ${{ secrets.SUPABASE_KEY }}`. Los otros tres nombres se conservarán. Este mapeo queda documentado, sin crear todavía el workflow.

En la terminal integrada de VS Code, desde la raíz del repositorio, el titular ejecutará cada comando y escribirá el valor solo cuando `gh` lo solicite de forma interactiva.

```powershell
gh secret set SUPABASE_URL
gh secret set SUPABASE_KEY
gh secret set TEST_EMAIL
gh secret set TEST_PASSWORD
```

El titular realizó el alta manual. Se verificó después la lista con `gh secret list --repo jimesssss/mini-inventario --json name --jq '.[].name'`. GitHub devolvió exactamente los cuatro nombres de la tabla. La comprobación acredita su registro. El uso de los secretos se comprobó después en las ejecuciones del workflow.

- [Verificación previa](evidencias/02-secretos-github-preverificacion.txt)
- [Registro técnico posterior al alta](evidencias/02-secretos-github-verificados.txt)
- [Captura de la salida actual de GitHub CLI, solo nombres](capturas/02-secretos-github-nombres.png)

## Actividad 3. Workflow de Playwright en GitHub Actions

`.github/workflows/ci.yml` se activa con `pull_request` hacia `main`. En `ubuntu-latest` prepara Node.js 22, ejecuta `npm ci`, instala Chromium con `npx playwright install --with-deps chromium` y ejecuta `npx playwright test --reporter=./playwright-ci-reporter.cjs`. En CI, Playwright administra Chromium y arranca `npm start` mediante `webServer`, espera `/api/salud` en el puerto 3000 y cierra el proceso cuando termina. En local se conserva Chrome y la reutilización del servidor.

El job autenticado solo se ejecuta si la rama del PR pertenece al mismo repositorio y se excluyen los eventos de Dependabot. El token de GitHub tiene permiso `contents: read`, y el checkout desactiva la persistencia de credenciales. Los secretos se asignan únicamente al paso de pruebas, con el mapeo de la Actividad 2. Las ejecuciones comparten un grupo de concurrencia sin cancelar la ejecución activa. Dentro del job, la suite usa un trabajador y cero reintentos para evitar escrituras simultáneas de CI con la misma cuenta.

La suite conserva los cuatro casos y su limpieza existente. Cada alta usa un SKU aleatorio en la cuenta de prueba. La limpieza en `finally` confirma los datos del producto y el ID antes de eliminarlo y comprueba cero filas para ese SKU después. No se modificó la suite, RLS ni Supabase durante la preparación del workflow.

`playwright-ci-reporter.cjs` genera `playwright-report.json` con el estado global y el nombre, estado y duración de cada caso. El artefacto `playwright-report` se sube también cuando las pruebas fallan y se conserva 14 días. El reporte excluye mensajes crudos de error, salida de las pruebas, adjuntos y datos de sesión. Las trazas, los videos y las capturas automáticas siguen desactivados. Si el entorno falla antes de ejecutar Playwright, no se genera un reporte de pruebas.

Validación local: `actionlint` 1.7.12 aprobó el YAML, `npx playwright test --list` reconoció los cuatro casos y `npm test` aprobó 3 de 3. Una ejecución aislada del reportero con un caso aprobado y otro fallido produjo el JSON esperado y excluyó un marcador ficticio de errores, consola y adjuntos. `git diff --check` pasó. La validación en el runner `ubuntu-latest` se realizó después de publicar el workflow y se documenta en el apartado siguiente.

[Evidencia técnica de la Actividad 3](evidencias/03-validacion-workflow.txt)

### Primera ejecución real en GitHub Actions

El [PR #13](https://github.com/jimesssss/mini-inventario/pull/13) se abrió con los 10 archivos autorizados en el commit `985290a113de84b0411df9e58e249ca0bcf8f34c`. El [run 44858792265](https://github.com/jimesssss/mini-inventario/actions/runs/44858792265) concluyó con éxito. La verificación `playwright` pasó en 29 s. El artefacto descargado contenía un solo archivo JSON con los cuatro casos aprobados, sin errores crudos ni adjuntos.

La consulta posterior por MCP en solo lectura devolvió cero SKU de prueba. El conteo y la huella agregada de los demás productos coincidieron con la referencia anterior. GitHub avisó que las acciones `@v4` se ejecutaron con Node.js 24 por la retirada de Node.js 20. El paso de pruebas conservó su configuración de Node.js 22 y la corrida aprobó. El workflow quedó sin cambios tras la verificación.

- [Registro de la primera ejecución](evidencias/03-ci-pr13-primera-ejecucion.txt)
- [Captura de la primera verificación en GitHub CLI](capturas/03-ci-pr13-aprobada.png)

Las evidencias de esta primera corrida se incorporaron al PR con la entrega final. El fallo controlado se ejecutó después sobre el mismo PR.

## Actividad 4. Estado rojo del mismo Pull Request

Se confirmó la primera corrida verde y se conservó la versión exacta de la prueba original antes de preparar el commit `db4bd7a857c5e909060a90512fe24bdc72c5d2e9`. El commit cambia una sola línea de `tests/inventario.spec.js`. Pasaron `node --check` y `git diff --cached --check`. Se publicó en `dia-06-ci` y activó GitHub Actions en el mismo [PR #13](https://github.com/jimesssss/mini-inventario/pull/13).

El [run 44859323419](https://github.com/jimesssss/mini-inventario/actions/runs/44859323419) terminó en `failure`. La verificación `playwright` aparece como `fail` y duró 35 s. Se consultaron solo el estado y los identificadores. El diagnóstico y la restauración se documentan más abajo.

- [Registro técnico del estado rojo](evidencias/04-ci-pr13-estado-rojo.txt)
- [Captura del estado del PR consultado con GitHub CLI](capturas/04-pr13-verificacion-roja.png)
- [Captura del resumen del run fallido en GitHub Actions](capturas/05-actions-run-rojo.png)

Las evidencias del estado rojo se incorporaron a la entrega final. El commit controlado se conserva en el historial del PR.

### Diagnóstico del fallo

`gh pr checks 13` confirmó el job `playwright` en rojo y `gh run list` identificó las dos corridas del mismo PR. Con `gh run view 44859323419 --log-failed` se comprobó que **Ejecutar Playwright Test** terminó con código 1. La preparación y la carga del artefacto pasaron. El log omite deliberadamente la traza de las aserciones.

| Caso | [Run verde 44858792265](https://github.com/jimesssss/mini-inventario/actions/runs/44858792265) | [Run rojo 44859323419](https://github.com/jimesssss/mini-inventario/actions/runs/44859323419) |
| --- | --- | --- |
| Inicio de sesión válido | Aprobado | Aprobado |
| Contraseña incorrecta rechazada | Aprobado | Fallido |
| Agregar producto ficticio | Aprobado | Aprobado |
| Detectar existencias bajas | Aprobado | Aprobado |

Los artefactos descargados con `gh run download` identificaron el único caso fallido. El diff entre ambos commits mostró una sola línea distinta, `tests/inventario.spec.js:147`. El caso comprueba primero el mensaje de rechazo. La aserción modificada espera después que **Mis productos** sea visible, aunque el comportamiento correcto es mantener el inventario oculto tras rechazar el acceso.

Se comprobó la misma salida visual en Chrome con Auth simulada y las conexiones a Supabase bloqueadas. El mensaje de rechazo apareció, el encabezado quedó oculto y `toBeVisible()` falló. `toBeHidden()` pasó. La solución propuesta fue restaurar `toBeHidden()` en esa línea. Se aplicó después de recibir autorización. [Registro técnico del diagnóstico](evidencias/04-ci-pr13-diagnostico.txt)

### Restauración y estado verde final

El primer verde, el fallo controlado y su diagnóstico se conservaron en los registros anteriores. El diagnóstico mostró que la prueba de contraseña inválida esperaba que **Mis productos** quedara visible después del rechazo. La corrección restauró `toBeHidden()` en la línea 147 de `tests/inventario.spec.js`. El archivo completo coincide con el del primer commit verde.

La comprobación local con Auth simulada y la red externa bloqueada confirmó el mensaje de rechazo, el inventario oculto y el botón de reintento habilitado. Pasaron `node --check`, `npm test` (3 de 3), `git diff --check` y `git diff --cached --check`. El commit `8ed6d5670bf0055935d6223027f2b3736351e80e` publicó únicamente el archivo de prueba en `dia-06-ci`.

`gh run watch` y `gh run view` confirmaron que el [run 44860404527](https://github.com/jimesssss/mini-inventario/actions/runs/44860404527) concluyó con éxito en 36 s. `gh pr checks 13` devolvió `playwright pass` en 32 s y `gh pr view` confirmó que el PR seguía abierto hacia `main` en el momento de la verificación. Con `gh run download` se revisó el JSON del artefacto. Los cuatro casos constan como `passed`: inicio de sesión válido, contraseña incorrecta rechazada, alta de producto ficticio y detección de existencias bajas.

La consulta por MCP en solo lectura confirmó cero SKU de prueba del patrón `PRUEBA-D05-%`. El conteo y la huella agregada de los demás productos coincidieron antes y después de la corrida. Se registró únicamente el resultado de la comparación.

- [Registro técnico de la corrección](evidencias/04-ci-pr13-correccion.txt)
- [Registro técnico y JSON del verde final](evidencias/04-ci-pr13-verde-final.txt)
- [Captura de la verificación verde del PR mediante GitHub CLI](capturas/06-pr13-verificacion-verde-final.png)
- [Captura del resumen oficial del run aprobado](capturas/07-actions-run-verde-final.png)
- [Captura de los cuatro casos aprobados en el JSON descargado](capturas/08-playwright-cuatro-aprobadas.png)

La bitácora y estas evidencias se publicaron posteriormente con la entrega final.

## Actividad 5. Verificación de la entrega

### Resultado del ciclo en el PR #13

| Etapa | Ejecución | Job | Casos aprobados |
| --- | --- | --- | --- |
| Verde inicial | [44858792265](https://github.com/jimesssss/mini-inventario/actions/runs/44858792265) | Aprobado, 29 s | 4 de 4 |
| Rojo controlado | [44859323419](https://github.com/jimesssss/mini-inventario/actions/runs/44859323419) | Fallido, 35 s | 3 de 4 |
| Verde final | [44860404527](https://github.com/jimesssss/mini-inventario/actions/runs/44860404527) | Aprobado, 32 s | 4 de 4 |

La prueba de contraseña incorrecta tenía una condición equivocada. Esperaba que el inventario apareciera aunque el inicio de sesión hubiera sido rechazado. GitHub Actions detectó que esa condición no se cumplía. Al restaurar la condición correcta, la prueba volvió a aprobar.

`gh pr checks 13` señaló que el job `playwright` falló. `gh run list` identificó la ejecución roja y la anterior aprobada. `gh run view 44859323419 --log-failed` ubicó el fallo en el paso de Playwright. El artefacto JSON identificó la prueba y el diff confirmó el cambio de una sola línea. Restaurar `toBeHidden()` en la línea 147 devolvió el archivo a su versión original.

### Prompts clave utilizados con Codex

Los siguientes extractos textuales provienen de los mensajes originales de la conversación con Codex. Se seleccionaron las instrucciones que explican cada etapa del ciclo.

**1. Creación del workflow**

> Crear un workflow funcional que ejecute automáticamente las pruebas de Playwright en cada Pull Request hacia main y permita descargar el reporte de resultados.

**Resultado.** Se creó `.github/workflows/ci.yml` con Node.js 22, Chromium y un artefacto JSON. La primera ejecución del PR aprobó los cuatro casos. [Ejecución 44858792265](https://github.com/jimesssss/mini-inventario/actions/runs/44858792265)

**2. Fallo controlado**

> La modificación debe provocar un fallo de aserción real en GitHub Actions sin modificar la lógica de producción, la base de datos, las políticas RLS ni las credenciales.

**Resultado.** El cambio de una sola aserción hizo fallar la prueba de contraseña incorrecta. Las otras tres aprobaron. [Ejecución 44859323419](https://github.com/jimesssss/mini-inventario/actions/runs/44859323419)

**3. Diagnóstico mediante GitHub CLI**

> Necesito que investigues la causa utilizando GitHub CLI, sin modificar todavía ningún archivo.

> Determina la causa raíz utilizando los registros reales, sin asumir que el problema está en Supabase, GitHub Actions o Playwright.

**Resultado.** El prompt de diagnóstico proporcionó el identificador del run, sin adelantar la causa. El log ubicó el paso fallido, el artefacto identificó el caso y el diff reveló que la condición esperaba que el inventario apareciera tras rechazar el acceso. [Registro del diagnóstico](evidencias/04-ci-pr13-diagnostico.txt)

**4. Autorización de la corrección**

> Sí, autorizo corregir el fallo diagnosticado del Pull Request #13 de Mini Inventario.

> Sustituye toBeVisible() por toBeHidden().

**Resultado.** Se restauró la línea 147 y se confirmó que el archivo de pruebas completo coincidía con el del primer verde. [Registro de la corrección](evidencias/04-ci-pr13-correccion.txt)

**5. Verificación del verde final**

> Espera a que finalice la ejecución del workflow y comprueba que las cuatro pruebas de Playwright aparezcan como aprobadas.

> Descarga y revisa el artefacto JSON de Playwright, comprobando que los cuatro casos aparezcan como passed.

**Resultado.** Estas instrucciones formaban parte del mismo mensaje que autorizó la corrección. El PR volvió a verde y los cuatro casos figuraron como `passed` en el JSON descargado. [Ejecución 44860404527](https://github.com/jimesssss/mini-inventario/actions/runs/44860404527)

**Resumen de otros encargos.** La preparación local, la verificación de los nombres de secretos y la revisión de la entrega se describen en sus actividades respectivas.

### Error real de la IA y comando aprobado

El primer intento de generar las capturas del verde final usó `TextEncoder` en el entorno que coordinaba las herramientas. La ejecución devolvió `ReferenceError: TextEncoder is not defined` antes de abrir el navegador. Se cambió la forma de pasar los datos ya verificados y el segundo intento guardó las tres imágenes. El incidente fue de la automatización de capturas.

El titular aprobó publicar la corrección con `git push origin refs/heads/dia-06-ci:refs/heads/dia-06-ci` para que GitHub Actions volviera a ejecutar el mismo PR. Antes del envío se verificó que el commit incluyera únicamente la línea restaurada en el archivo de prueba.

### Índice y cierre

Los enlaces de las Actividades 1 a 4 forman el índice de las ocho capturas y nueve registros técnicos de esas etapas. El décimo registro documenta la verificación de la entrega. Las imágenes de las verificaciones del PR y de los nombres de secretos recogen salidas reales de GitHub CLI. Las imágenes de las ejecuciones roja y verde final muestran los resúmenes oficiales de GitHub Actions. La captura de los cuatro casos muestra el JSON descargado del verde final del ciclo.

- [Registro técnico de verificación de la entrega](evidencias/05-verificacion-entrega.txt)

El [ZIP publicado](evidencias-dia-06.zip) contiene 19 archivos: la versión del README incluida en la entrega original, ocho capturas y diez registros técnicos. Se volvió a ejecutar `npm test` (3 de 3) y se comprobó que el código de producción, las pruebas y el workflow conservan las versiones verificadas. Para esta actividad se reutilizaron los resultados de Playwright y la evidencia de limpieza del verde final. Las evidencias se publicaron en el commit `c03b5a2b84503f33a7c1fc75bef8da34eb3f1d6d`. La [ejecución 44862140481](https://github.com/jimesssss/mini-inventario/actions/runs/44862140481) confirmó que los cuatro casos de Playwright seguían aprobados después de publicar la documentación.

El ciclo verde → rojo → verde quedó completado. El [PR #13](https://github.com/jimesssss/mini-inventario/pull/13) se fusionó el 20 de noviembre de 2026 a las 21:42, hora de Ciudad de México. El trabajo del Día 6, incluida la entrega de evidencias, quedó integrado en `main` mediante el [commit de fusión `7e73fab3218cf3cd034354f47a448680b4f32388`](https://github.com/jimesssss/mini-inventario/commit/7e73fab3218cf3cd034354f47a448680b4f32388).

## Capturas adicionales del proceso

- [Actividad 1 — Preparación y pruebas locales](capturas/chat/01-preparacion-y-pruebas-locales.png). Muestra la bitácora inicial y el resumen de los cuatro casos aprobados en local.
- [Actividad 2 — Procedimiento para configurar los secretos](capturas/chat/02-procedimiento-secretos-github.png). Muestra las instrucciones de GitHub CLI para registrar y verificar los nombres de los secretos.
- [Actividad 4 — Registro del fallo controlado](capturas/chat/03-registro-del-fallo-controlado.png). Muestra el resumen del estado rojo y las evidencias guardadas antes del diagnóstico.

## Archivo complementario de capturas del chat

Este archivo reúne capturas históricas del proceso, incluidas actividades de los Días 4 y 5. Su función es complementar la bitácora. Algunas escenas repiten material ya publicado, incluidas las tres capturas de proceso de `capturas/chat/`. El conjunto oficial del Día 6 se conserva en `capturas/`, `evidencias/` y el [ZIP original](evidencias-dia-06.zip).

Las copias mantienen los nombres originales. Las zonas privadas se cubrieron con rectángulos opacos antes de exportar. Los 13 PNG se volvieron a codificar sin metadatos auxiliares.

- [image(20261120-234125).png](capturas-chat-dia-06/image%2820261120-234125%29.png) — Día 4 · prueba de aislamiento y preparación del PR #10.
- [image(20261120-234458).png](capturas-chat-dia-06/image%2820261120-234458%29.png) — Día 4 · resumen de la publicación inicial del PR #10.
- [image(20261121-002005).png](capturas-chat-dia-06/image%2820261121-002005%29.png) — Día 4 · sincronización de main antes del Día 5.
- [image(20261121-002155).png](capturas-chat-dia-06/image%2820261121-002155%29.png) — Día 4 · verificación de aislamiento y limpieza.
- [image(20261121-011536).png](capturas-chat-dia-06/image%2820261121-011536%29.png) — Día 5 · preparación de Playwright CLI.
- [image(20261121-011905).png](capturas-chat-dia-06/image%2820261121-011905%29.png) — Día 5 · instrucciones de inicio de sesión.
- [image(20261121-012458).png](capturas-chat-dia-06/image%2820261121-012458%29.png) — Día 5 · plan de exploración del formulario y la vista móvil.
- [image(20261121-013429).png](capturas-chat-dia-06/image%2820261121-013429%29.png) — Día 5 · instrucciones para la prueba de regresión.
- [image(20261121-021342).png](capturas-chat-dia-06/image%2820261121-021342%29.png) — Día 6 · preparación y cuatro pruebas locales aprobadas.
- [image(20261121-022008).png](capturas-chat-dia-06/image%2820261121-022008%29.png) — Día 6 · procedimiento para configurar los secretos de GitHub.
- [image(20261121-022234).png](capturas-chat-dia-06/image%2820261121-022234%29.png) — Día 6 · terminal durante el registro de los secretos.
- [image(20261121-022313).png](capturas-chat-dia-06/image%2820261121-022313%29.png) — Día 6 · verificación de los cuatro nombres con GitHub CLI.
- [image(20261121-030931).png](capturas-chat-dia-06/image%2820261121-030931%29.png) — Día 6 · resumen del fallo controlado antes del diagnóstico.
