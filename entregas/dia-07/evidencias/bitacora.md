# Comandos, incidencias y decisiones de la Actividad 1

## 23 de noviembre de 2026 · Generación y revisión

Los mensajes del usuario se extrajeron de los eventos `user_message` del JSONL local de la sesión `01a20925-20e5-77a0-aa66-2e97d0257e92`. La revisión posterior de esa sesión fue de solo lectura. [Prompt inicial](prompt-01.txt) · [Prompt de revisión](prompt-02.txt)

| Comando o decisión registrada | Resultado |
| --- | --- |
| `node --check tests/inventario.spec.js` | La sintaxis fue válida con Node.js 22.20.0. NVM tenía esa versión instalada, pero carecía de una versión activa. Se usó directamente el ejecutable instalado. |
| Playwright con `test --list` | Descubrió cinco casos, incluido el de edición. El listado no ejecutó los casos. |
| Pruebas de Node.js en `test/interfaz.test.js` y `test/productos.test.js` | La salida TAP registró 3 aprobadas y 0 fallidas. Cubrieron la interfaz simulada, las rutas con Auth y Data API simuladas, y la validación de la URL de configuración. |
| Verificación en navegador | El clon original carecía de configuración y credenciales para la cuenta de pruebas. Codex pidió autorización para la limpieza automática de productos ficticios que haría GitHub Actions al abrir un PR. La sesión dejó el PR pendiente y no registró una ejecución de la prueba de edición contra Supabase. |
| `git diff --check`, `git status --short` y `git diff --stat` | Antes del commit aparecieron el archivo de pruebas modificado y la carpeta del Día 7 sin seguimiento. |
| `git add -- tests/inventario.spec.js entregas/dia-07/prueba-edicion.md`, `git diff --cached --check` y `git commit -m 'test: cubrir la edicion de productos con Playwright'` | La sesión histórica registró el commit `9f4836d`, con 41 inserciones y 2 eliminaciones. Git advirtió que convertiría LF a CRLF en la copia de trabajo de la bitácora. |
| `git push -u origin test/dia-07-editar-producto` | La sesión histórica informó que publicó la rama. En la revisión, `git status --short --branch` mostró la rama siguiendo a su remota. `git diff` y `git diff --cached` devolvieron salidas vacías. |

La revisión histórica confirmó que la bitácora original incluía resultados e incidencias, pero omitía el código y el ajuste de la limpieza. Por eso se archivaron los dos archivos completos y el diff del commit. [Bitácora original](original-sin-skill/entregas/dia-07/prueba-edicion.md)

## 24 de noviembre de 2026 · Recuperación y descarte

El encargo de cierre pidió preservar el trabajo local, recuperar la conversación y el código, descartar los cambios únicamente en una copia aislada y dejar las capturas para el cierre del Día 7. Reservó la creación de la skill y del subagente para otra actividad y los commits, push y merge para una autorización posterior.

1. Se revisaron el README principal, `docs/`, las ramas y los árboles de trabajo con `git status --short --branch`, `git branch --list`, `git worktree list` y `git show --stat --oneline 9f4836d`. La rama `dia-07-skill` ya existía en el mismo commit que `main`. Se usó `git switch dia-07-skill`. El primer intento falló por permisos sobre `.git/index.lock` y el reintento con permiso ampliado funcionó. El estado posterior mostró los mismos archivos locales preexistentes.
2. Se localizaron los registros del 23 de noviembre con `rg -l` buscando el commit o la rama de prueba. La versión de Windows PowerShell rechazó `ConvertFrom-Json -AsHashtable`. Se repitió con `ConvertFrom-Json` y se guardó el texto de los dos eventos del usuario en UTF-8.
3. La primera extracción con `git archive` y `tar` produjo una copia de `tests/inventario.spec.js` cuyo hash crudo difería del blob. Se copiaron los dos blobs directamente desde `git cat-file blob`, usando un flujo binario, y se verificó que `git hash-object --no-filters` devolviera el hash del blob original de cada ruta. No se editaron el código ni la bitácora de referencia.
4. Se guardó `git diff --binary --no-ext-diff <padre> <original> --`, se ejecutó `git clone --quiet --no-local --no-checkout` en una carpeta temporal nueva y se usó `git switch --quiet --detach <padre>` dentro de ese clon. `git apply --index` reprodujo el cambio completo y `git write-tree` devolvió el mismo árbol que el commit original. Se guardó `git status --short --branch --untracked-files=all` antes de restaurar.
5. El descarte se ejecutó únicamente en ese clon con `git restore --source=<padre> --staged --worktree -- tests/inventario.spec.js entregas/dia-07/prueba-edicion.md`. Se guardó nuevamente el estado y se comprobó el resultado con `git diff --exit-code HEAD --` y `git status --porcelain=v1 --untracked-files=all`. Se compararon las referencias del repositorio principal y su estado de trabajo antes y después. [Comprobaciones del clon](verificacion-descarte.txt)
6. La consulta web directa al enlace de GitHub no devolvió la página. `gh api repos/jimesssss/mini-inventario/commits/9f4836d69aa983de5adc79584a3318ffc2bdfa36 --jq .html_url` falló inicialmente por la restricción de red. Con permiso ampliado, GitHub devolvió la URL exacta. [Commit verificado](https://github.com/jimesssss/mini-inventario/commit/9f4836d69aa983de5adc79584a3318ffc2bdfa36)

Las verificaciones del 24 de noviembre se centraron en la recuperación y en Git. La actividad conservó las verificaciones de Playwright y Node.js como resultados históricos. Durante el cierre no hubo operaciones sobre Supabase ni SQLite, ni commits, push o merge.
