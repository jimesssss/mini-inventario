# Actividad 3 · Registro de selección de la skill

Extracto textual de la conversación de la Actividad 3. El mensaje del usuario repitió el [prompt conservado en la Actividad 1](prompt-01.txt).

> Escribe una prueba de Playwright para editar un producto

Primera respuesta de Codex, antes de modificar archivos:

> Usaré las habilidades `pruebas-inventario` y `playwright-cli`. Revisaré el README, la documentación y las pruebas existentes. Después crearé una rama, escribiré la prueba de edición y verificaré que el cambio persista al recargar.

La primera llamada de herramientas incluyó `Get-Content .agents/skills/pruebas-inventario/SKILL.md` y `Get-Content .agents/skills/playwright-cli/SKILL.md -TotalCount 95`. La salida mostró el encabezado y las instrucciones de ambas skills. El prompt no contenía el nombre de ninguna skill. La secuencia registra la selección por la solicitud y la lectura efectiva de las instrucciones.

La Actividad 2 dejó por separado el [resultado de descubrimiento](actividad-02-descubrimiento.json), con `scope: "repo"` y `enabled: true`. El extracto documenta lo observable en la conversación. No se dispone de un evento interno de activación para este turno.
