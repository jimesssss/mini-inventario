# Actividad 3 · Prueba de edición con Playwright

La prueba de HU-04 conserva el SKU del producto temporal, cambia el nombre, la cantidad y el mínimo, y comprueba su persistencia tras recargar e iniciar sesión nuevamente. Luego intenta guardar un nombre compuesto por espacios y comprueba que el nombre y la cantidad guardados se conservan.

- Node.js 22.20.0 completó `--check tests/inventario.spec.js` correctamente.
- `playwright test --list -g 'editar producto'` detectó un caso.
- `git diff --check` terminó sin errores.
- El sandbox bloqueó inicialmente la creación de la rama. La operación escalada creó `dia-07-prueba-editar-producto`.
- La ejecución en navegador contra Supabase requiere autorización para eliminar el producto que crea el fixture.
- GitHub CLI reportó un token inválido para la cuenta activa. El pull request queda pendiente de autenticación.

## Incidencias y resolución

- La versión original recargaba la página y esperaba la fila sin volver a autenticarse. Durante la generación con la skill, la revisión de `public/js/app.js` detectó `persistSession: false`. Codex añadió `iniciarSesion(page)` después de cada recarga antes del descubrimiento de pruebas.
- El shim de NVM informó que no había una versión activa. Se localizó el ejecutable de Node.js 22.20.0 en la instalación local y se invocó directamente. El descubrimiento completo de la suite confirmó cinco casos y el filtro `editar producto` seleccionó uno.
- La consulta de GitHub desde el sandbox también recibió un bloqueo de red. La documentación se apoyó en el objeto Git disponible localmente.
- Windows PowerShell rechazó `utf8NoBOM` al exportar los diffs. Se usó `git diff --output`. Ambos diffs se validaron en sentido inverso con `git apply --check --reverse`, que comprueba aplicabilidad sin editar la prueba.
- `Get-FileHash` no estaba disponible en la sesión. Se usó Node.js para comprobar la igualdad byte a byte del archivo de trabajo y su copia.
- Se comprobaron los 23 enlaces locales del README y los registros de la Actividad 3. La consulta web del enlace de GitHub al commit original falló. El commit se verificó en el repositorio local y el blob original coincide con la copia archivada en la Actividad 1.

La verificación inicial llegó al descubrimiento de la prueba. Tras la autorización para operar sobre el producto temporal, el caso pasó en Chrome contra Supabase. El fixture verificó la eliminación y la ausencia del SKU. [Salida de la ejecución real](actividad-03-ejecucion-playwright.txt)
