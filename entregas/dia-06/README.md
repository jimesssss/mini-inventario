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

El titular realizó el alta manual. Se verificó después la lista con `gh secret list --repo jimesssss/mini-inventario --json name --jq '.[].name'`. GitHub devolvió exactamente los cuatro nombres de la tabla. La comprobación acredita su registro. La validación en ejecución corresponde al futuro workflow.

- [Verificación previa](evidencias/02-secretos-github-preverificacion.txt)
- [Registro técnico posterior al alta](evidencias/02-secretos-github-verificados.txt)
- [Captura de la salida actual de GitHub CLI, solo nombres](capturas/02-secretos-github-nombres.png)

## Actividad 3. Workflow de Playwright en GitHub Actions

`.github/workflows/ci.yml` se activa con `pull_request` hacia `main`. En `ubuntu-latest` prepara Node.js 22, ejecuta `npm ci`, instala Chromium con `npx playwright install --with-deps chromium` y ejecuta `npx playwright test --reporter=./playwright-ci-reporter.cjs`. En CI, Playwright administra Chromium y arranca `npm start` mediante `webServer`, espera `/api/salud` en el puerto 3000 y cierra el proceso cuando termina. En local se conserva Chrome y la reutilización del servidor.

El job autenticado solo se ejecuta si la rama del PR pertenece al mismo repositorio y se excluyen los eventos de Dependabot. El token de GitHub tiene permiso `contents: read`, y el checkout desactiva la persistencia de credenciales. Los secretos se asignan únicamente al paso de pruebas, con el mapeo de la Actividad 2. Las ejecuciones comparten un grupo de concurrencia sin cancelar la ejecución activa. Dentro del job, la suite usa un trabajador y cero reintentos para evitar escrituras simultáneas de CI con la misma cuenta.

La suite conserva los cuatro casos y su limpieza existente. Cada alta usa un SKU aleatorio en la cuenta de prueba. La limpieza en `finally` confirma los datos del producto y el ID antes de eliminarlo y comprueba cero filas para ese SKU después. No se modificó la suite, RLS ni Supabase durante la preparación del workflow.

`playwright-ci-reporter.cjs` genera `playwright-report.json` con el estado global y el nombre, estado y duración de cada caso. El artefacto `playwright-report` se sube también cuando las pruebas fallan y se conserva 14 días. El reporte excluye mensajes crudos de error, salida de las pruebas, adjuntos y datos de sesión. Las trazas, los videos y las capturas automáticas siguen desactivados. Si el entorno falla antes de ejecutar Playwright, no se genera un reporte de pruebas.

Validación local: `actionlint` 1.7.12 aprobó el YAML, `npx playwright test --list` reconoció los cuatro casos y `npm test` aprobó 3 de 3. Una ejecución aislada del reportero con un caso aprobado y otro fallido produjo el JSON esperado y excluyó un marcador ficticio de errores, consola y adjuntos. `git diff --check` pasó. La prueba real en `ubuntu-latest` queda pendiente de publicar y abrir el PR. Se guardó una salida técnica. Todavía no existe una ejecución de GitHub Actions para capturar.

[Evidencia técnica de la Actividad 3](evidencias/03-validacion-workflow.txt)

### Primera ejecución real en GitHub Actions

El [PR #13](https://github.com/jimesssss/mini-inventario/pull/13) se abrió con los 10 archivos autorizados en el commit `985290a113de84b0411df9e58e249ca0bcf8f34c`. El [run 44858792265](https://github.com/jimesssss/mini-inventario/actions/runs/44858792265) concluyó con éxito. La verificación `playwright` pasó en 29 s. El artefacto descargado contenía un solo archivo JSON con los cuatro casos aprobados, sin errores crudos ni adjuntos.

La consulta posterior por MCP en solo lectura devolvió cero SKU de prueba. El conteo y la huella agregada de los demás productos coincidieron con la referencia anterior. GitHub avisó que las acciones `@v4` se ejecutaron con Node.js 24 por la retirada de Node.js 20. El paso de pruebas conservó su configuración de Node.js 22 y la corrida aprobó. El workflow quedó sin cambios tras la verificación.

- [Registro de la primera ejecución](evidencias/03-ci-pr13-primera-ejecucion.txt)
- [Captura de la consulta actual de GitHub CLI](capturas/03-ci-pr13-aprobada.png)

Estas nuevas evidencias quedaron en la copia local, fuera del primer commit. El PR sigue abierto y el fallo provocado queda pendiente.

## Actividad 4. Estado rojo del mismo Pull Request

Se confirmó la primera corrida verde y se conservó la versión exacta de la prueba original antes de preparar el commit `db4bd7a857c5e909060a90512fe24bdc72c5d2e9`. El commit cambia una sola línea de `tests/inventario.spec.js`. Pasaron `node --check` y `git diff --cached --check`. Se publicó en `dia-06-ci` y activó GitHub Actions en el mismo [PR #13](https://github.com/jimesssss/mini-inventario/pull/13).

El [run 44859323419](https://github.com/jimesssss/mini-inventario/actions/runs/44859323419) terminó en `failure`. La verificación `playwright` aparece como `fail` y duró 35 s. Se consultaron solo el estado y los identificadores. La investigación del fallo y la restauración quedan para la siguiente etapa.

- [Registro técnico del estado rojo](evidencias/04-ci-pr13-estado-rojo.txt)
- [Captura del estado del PR consultado con GitHub CLI](capturas/04-pr13-verificacion-roja.png)
- [Captura del resumen del run fallido en GitHub Actions](capturas/05-actions-run-rojo.png)

Las evidencias añadidas tras la corrida se conservan en local. El PR sigue abierto y el commit controlado permanece publicado.

### Diagnóstico del fallo

`gh pr checks 13` confirmó el job `playwright` en rojo y `gh run list` identificó las dos corridas del mismo PR. Con `gh run view 44859323419 --log-failed` se comprobó que **Ejecutar Playwright Test** terminó con código 1. La preparación y la carga del artefacto pasaron. El log omite deliberadamente la traza de las aserciones.

| Caso | [Run verde 44858792265](https://github.com/jimesssss/mini-inventario/actions/runs/44858792265) | [Run rojo 44859323419](https://github.com/jimesssss/mini-inventario/actions/runs/44859323419) |
| --- | --- | --- |
| Inicio de sesión válido | Aprobado | Aprobado |
| Contraseña incorrecta rechazada | Aprobado | Fallido |
| Agregar producto ficticio | Aprobado | Aprobado |
| Detectar existencias bajas | Aprobado | Aprobado |

Los artefactos descargados con `gh run download` identificaron el único caso fallido. El diff entre ambos commits mostró una sola línea distinta, `tests/inventario.spec.js:147`. El caso comprueba primero el mensaje de rechazo. La aserción modificada espera después que **Mis productos** sea visible, aunque el comportamiento correcto es mantener el inventario oculto tras rechazar el acceso.

Se comprobó la misma salida visual en Chrome con Auth simulada y las conexiones a Supabase bloqueadas. El mensaje de rechazo apareció, el encabezado quedó oculto y `toBeVisible()` falló. `toBeHidden()` pasó. La solución mínima es restaurar `toBeHidden()` en esa línea. La corrección espera autorización. [Registro técnico del diagnóstico](evidencias/04-ci-pr13-diagnostico.txt)

### Restauración y estado verde final

El primer verde, el fallo controlado y su diagnóstico se conservaron en los registros anteriores. El diagnóstico mostró que la prueba de contraseña inválida esperaba que **Mis productos** quedara visible después del rechazo. La corrección restauró `toBeHidden()` en la línea 147 de `tests/inventario.spec.js`. El archivo completo coincide con el del primer commit verde.

La comprobación local con Auth simulada y la red externa bloqueada confirmó el mensaje de rechazo, el inventario oculto y el botón de reintento habilitado. Pasaron `node --check`, `npm test` (3 de 3), `git diff --check` y `git diff --cached --check`. El commit `8ed6d5670bf0055935d6223027f2b3736351e80e` publicó únicamente el archivo de prueba en `dia-06-ci`.

`gh run watch` y `gh run view` confirmaron que el [run 44860404527](https://github.com/jimesssss/mini-inventario/actions/runs/44860404527) concluyó con éxito en 36 s. `gh pr checks 13` devolvió `playwright pass` en 32 s y `gh pr view` confirmó que el PR sigue abierto hacia `main`. Con `gh run download` se revisó el JSON del artefacto. Los cuatro casos constan como `passed`: inicio de sesión válido, contraseña incorrecta rechazada, alta de producto ficticio y detección de existencias bajas.

La consulta por MCP en solo lectura confirmó cero SKU de prueba del patrón `PRUEBA-D05-%`. El conteo y la huella agregada de los demás productos coincidieron antes y después de la corrida. Se registró únicamente el resultado de la comparación.

- [Registro técnico de la corrección](evidencias/04-ci-pr13-correccion.txt)
- [Registro técnico y JSON del verde final](evidencias/04-ci-pr13-verde-final.txt)
- [Captura de la verificación verde del PR mediante GitHub CLI](capturas/06-pr13-verificacion-verde-final.png)
- [Captura del resumen oficial del run aprobado](capturas/07-actions-run-verde-final.png)
- [Captura de los cuatro casos aprobados en el JSON descargado](capturas/08-playwright-cuatro-aprobadas.png)

La bitácora y las nuevas evidencias quedaron en la copia local. El PR sigue abierto.

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

1. Preparar la rama del Día 6, revisar la limpieza de los productos sintéticos y ejecutar las cuatro pruebas locales con la cuenta autorizada.
2. Preparar los comandos de alta de secretos para que los ejecute el titular y verificar solo los nombres registrados.
3. Crear un workflow con Node.js 22 y Chromium que ejecute Playwright en PR hacia `main` y conserve un reporte seguro.
4. Inducir un fallo de aserción reversible, diagnosticarlo con GitHub CLI y restaurar la prueba tras recibir autorización.
5. Contrastar las evidencias con GitHub, revisar privacidad y preparar la entrega sin crear un commit.

### Error real de la IA y comando aprobado

El primer intento de generar las capturas del verde final usó `TextEncoder` en el entorno que coordinaba las herramientas. La ejecución devolvió `ReferenceError: TextEncoder is not defined` antes de abrir el navegador. Se cambió la forma de pasar los datos ya verificados y el segundo intento guardó las tres imágenes. El incidente fue de la automatización de capturas.

El titular aprobó publicar la corrección con `git push origin refs/heads/dia-06-ci:refs/heads/dia-06-ci` para que GitHub Actions volviera a ejecutar el mismo PR. Antes del envío se verificó que el commit incluyera únicamente la línea restaurada en el archivo de prueba.

### Índice y cierre

Los enlaces de las Actividades 1 a 4 forman el índice de las 8 capturas y 9 registros técnicos de esas etapas. Las imágenes de las verificaciones del PR y de los nombres de secretos recogen salidas reales de GitHub CLI. Las imágenes de las ejecuciones roja y verde final muestran los resúmenes oficiales de GitHub Actions. La captura de los cuatro casos muestra el JSON descargado del último run.

- [Registro técnico de verificación de la entrega](evidencias/05-verificacion-entrega.txt)

El ZIP reúne este README, las 8 capturas y los 10 registros técnicos. Se volvió a ejecutar `npm test` (3 de 3) y se comprobó que el código de producción, las pruebas y el workflow conservan las versiones verificadas. Para esta actividad se reutilizaron los resultados de Playwright y la evidencia de limpieza del verde final. El [PR #13](https://github.com/jimesssss/mini-inventario/pull/13) sigue abierto y las evidencias finales esperan autorización de publicación.
