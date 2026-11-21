# Día 6 de 10 — Pruebas e integración continua

**Fecha:** 20 de noviembre de 2026

**Rama:** `dia-06-ci`, creada desde `main` en `2893377821ef21f2faa7c7e7c7cbdbdc3f14cc07`.

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
