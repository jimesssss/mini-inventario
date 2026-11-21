# Día 4: integración MCP de Supabase y validación RLS

Rama propuesta: `dia-04-supabase`. Base propuesta: `main`. Borrador local para revisión.

## Cambios y tecnologías

Mini Inventario usa Node.js 22, Express, HTML, CSS, JavaScript, Supabase Auth y PostgreSQL. El CRUD conserva la identidad de la sesión. El MCP oficial se configuró en solo lectura y se instalaron localmente dos skills de Supabase para Codex. El ajuste SQL propuesto aplica privilegios mínimos a `public.productos` y conserva las cinco políticas RLS.

## Resultados

- **Supabase real.** RLS y cinco políticas vigentes. La matriz directa con dos cuentas de prueba existentes y dos SKU sintéticos aprobó A/A=1, A/B=0, B/A=0 y B/B=1. Las consultas fueron directamente a PostgREST.
- **PostgreSQL aislado.** Dos aplicaciones de la migración en PGlite conservaron permisos esperados, políticas y filas ficticias. Se verificaron CRUD por rol, valores automáticos y rechazos de acceso ajeno.
- **Aplicación.** Tres pruebas de `npm test` aprobadas con servicios simulados. `git diff --check` salió con código 0.
- **Cierre remoto.** El titular aplicó el ajuste en el Editor SQL oficial. El MCP confirmó los nuevos permisos efectivos y las cinco políticas intactas. La matriz posterior volvió a pasar y ambos SKU sintéticos se eliminaron. El conteo y la huella agregada de los demás productos se conservaron durante la limpieza. Las pruebas de escritura cruzada se realizaron en el entorno aislado.

[Bitácora e índice](README.md) · [Evidencia directa](evidencias/07-sesiones-existentes.txt) · [Salida de cierre](evidencias/08-cierre-tecnico.txt) · [Plan de aplicación y limpieza](plan-aplicacion.md) · [Evidencia posterior](evidencias/10-verificacion-posterior.txt)

## Archivos propuestos para publicación

- `entregas/dia-04/README.md`
- `entregas/dia-04/PR-borrador.md`
- `entregas/dia-04/aislamiento-local.mjs`
- `entregas/dia-04/validar-pglite.mjs`
- `entregas/dia-04/procedimiento-data-api.md`
- `entregas/dia-04/plan-aplicacion.md`
- `entregas/dia-04/evidencias-dia-04.zip`
- `entregas/dia-04/evidencias/01-pglite.txt`
- `entregas/dia-04/evidencias/02-supabase-metadatos.txt`
- `entregas/dia-04/evidencias/03-pruebas-proyecto.txt`
- `entregas/dia-04/evidencias/04-verificacion-final.txt`
- `entregas/dia-04/evidencias/05-autorizacion-condicionada.txt`
- `entregas/dia-04/evidencias/06-preparacion-data-api.txt`
- `entregas/dia-04/evidencias/07-sesiones-existentes.txt`
- `entregas/dia-04/evidencias/08-cierre-tecnico.txt`
- `entregas/dia-04/evidencias/09-preaplicacion-autorizada.txt`
- `entregas/dia-04/evidencias/10-verificacion-posterior.txt`
- `supabase/migrations/20261120000000_ajustar_privilegios_productos.sql`
