# Actividad 2 · Bitácora

Se revisaron `README.md`, `docs/`, `package.json`, `playwright.config.js`, `tests/inventario.spec.js` y el `SKILL.md` de `skill-creator`. `git status --short --branch` confirmó la rama `dia-07-skill`. [Solicitud del usuario](actividad-02-prompt.txt)

La configuración de Playwright usa `testDir: './tests'`. La suite lee cuatro variables de entorno, inicia sesión en una cuenta de prueba y usa `productoTemporal` para generar un SKU con `randomUUID()` y limpiar en `finally`. Se documentó que hay que revisar la compatibilidad de la limpieza antes de reutilizar ese fixture en un caso que modifica el producto, porque la implementación actual comprueba también sus valores originales. Se dejó la skill en un único archivo y se conservó la selección automática predeterminada.

| Comprobación | Comando o solicitud | Resultado |
| --- | --- | --- |
| Estructura y YAML | `python -X utf8 <skill-creator>/scripts/quick_validate.py .agents/skills/pruebas-inventario` con Python 3.12.14 y `PYTHONPATH` apuntando a la dependencia temporal | Código 0 y salida `Skill is valid!`. |
| Descubrimiento del repositorio | `codex app-server --listen stdio://` mediante el ejecutable nativo 0.172.0, con `CODEX_HOME` temporal. Tras `initialize` e `initialized`, se pidió `skills/list` con `cwds` apuntando a Mini Inventario y `forceReload: true`. | Codex confirmó nombre, descripción, ruta exacta, `scope: repo` y `enabled: true`. La operación consultó el catálogo sin iniciar un turno de generación. |

El primer intento de ejecutar `codex` por el PATH encontró el intermediario de NVM sin una versión activa de Node.js. Se usó el ejecutable nativo del servidor local. La primera consulta devolvió la skill, pero la eliminación automática de la carpeta temporal falló por un bloqueo de Windows. La segunda consulta conservó su carpeta temporal y terminó con código 0. El aviso de que Codex no podía crear alias de ejecutables bajo la ruta temporal no impidió el descubrimiento. [Respuesta del servidor local](actividad-02-descubrimiento.json)

El Python 3.12 del entorno carecía de PyYAML y el Python del PATH apuntaba a un ejecutable inaccesible. `python -m pip install --disable-pip-version-check --no-cache-dir --retries 0 --target <directorio-temporal> PyYAML` no encontró el paquete bajo la restricción de red y, al repetirse con permiso ampliado, instaló PyYAML 6.0.4 fuera del repositorio. El entorno restringido impidió leer esa carpeta, por lo que se ejecutó el validador con permiso ampliado. No se añadieron dependencias al proyecto.

Para comparar los archivos, `Get-FileHash` no estaba disponible en la sesión de PowerShell y se usó `git hash-object --no-filters`. La comparación verificó que las evidencias de la Actividad 1 y `tests/inventario.spec.js` conservaron sus hashes. No se generó ni ejecutó una segunda prueba. Tampoco hubo operaciones sobre Supabase o SQLite, commits, push ni merge.
