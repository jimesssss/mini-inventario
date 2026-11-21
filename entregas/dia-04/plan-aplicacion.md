# Plan de aplicación y reversión

**Estado:** SQL validado dos veces en PGlite y listo para revisión. La ejecución remota requiere autorización expresa.

1. Realizar la [prueba directa de lectura](procedimiento-data-api.md) cuando estén disponibles las dos sesiones y filas autorizadas. Registrar la matriz como línea base.
2. Volver a comprobar la rama, el proyecto vinculado, RLS, las cinco políticas y los permisos directos y efectivos por tabla y columna. Guardar solo metadatos. Si difieren de la evidencia o hay otros consumidores de las columnas protegidas, detenerse y revisar el alcance. El historial MCP estaba vacío. No asumir que la migración histórica falta en el esquema ni usar un comando que ejecute todas las migraciones.
3. Con autorización expresa, el operador autorizado abre el editor SQL del proyecto validado y ejecuta íntegramente, en una sola ejecución, [la migración propuesta](../../supabase/migrations/20261120000000_ajustar_privilegios_productos.sql), incluidos BEGIN y COMMIT. Conservar el MCP en solo lectura. No ejecutar la migración histórica ni modificar manualmente el historial de migraciones. Registrar el método y el resultado para conciliar el historial por separado si se adopta un flujo gestionado.
4. Repetir por MCP las consultas de catálogo. Confirmar RLS y las cinco políticas intactas, ningún privilegio efectivo para `anon` sobre productos, SELECT y DELETE de tabla para `authenticated`, INSERT de las cinco columnas previstas y UPDATE de las cuatro previstas. Si hay sesiones disponibles, repetir la matriz de lectura. Cualquier escritura real de comprobación requiere autorización aparte.
5. Si la ejecución falla antes del COMMIT, confirmar que se revirtió la transacción. Si se confirma el cambio y hay una regresión atribuible a los privilegios, volver a inspeccionar el catálogo y solicitar autorización para restaurar el estado observado. Para la línea base actual, la reversión sería:

```sql
begin;
grant select, insert, update, delete on table public.productos to anon;
grant insert, update on table public.productos to authenticated;
commit;
```

La reversión reintroduce los permisos amplios detectados. Verificar el catálogo y las cinco políticas después de la reversión. No se necesita restaurar filas porque ambas transacciones solo cambian privilegios.

## Prevalidación y limpieza de los productos sintéticos

La matriz directa A/B ya se aprobó. Repetir la matriz con los mismos productos y cuentas después del ajuste de privilegios si se autoriza, antes de limpiar las filas. El mecanismo previsto para el ajuste es el Editor SQL del Dashboard oficial. Antes de ejecutar, el operador confirma que puede abrir el Editor del proyecto correcto y revisa el texto exacto de la transacción. [Documentación de Supabase Database](https://supabase.com/docs/guides/database/overview)

Con autorización expresa de limpieza, abrir nuevamente las dos sesiones de prueba por separado y verificar sus identidades mediante Supabase Auth. Para cada cuenta, consultar directamente por su SKU exacto y exigir una sola fila con su propio `user_id`, el nombre esperado, cantidad 1 y mínimo 0. Mantener el ID de la fila y el del propietario solo en memoria. Detenerse ante cualquier diferencia y conservar ambas cuentas.

Enviar la eliminación directamente por PostgREST con la sesión propietaria y filtros simultáneos por ID, SKU exacto y propietario. Exigir confirmación de una sola fila por operación. Volver a consultar ambos SKU en solo lectura y registrar únicamente los conteos. Si una eliminación ocurre y la otra falla, documentar el estado parcial antes de reintentar.
