# Prueba directa de aislamiento mediante Data API

**Estado:** pendiente. No se encontraron dos sesiones de prueba accesibles y autorizadas ni dos filas sintéticas existentes confirmadas. La prueba de interfaz del Día 3 y la prueba en PGlite tienen evidencia propia.

1. Confirmar que A y B son cuentas exclusivas de prueba y que ya existe un producto sintético de cada una. Identificar localmente ambos productos como fila A y fila B. Si faltan, detener la prueba de lectura. Crear cuentas o filas requiere autorización independiente.
2. Usar un cliente Supabase independiente para cada sesión de prueba, en memoria, con la URL del proyecto y su clave publicable. El titular inicia sesión por un flujo local de confianza sin registrar credenciales. En un cliente temporal usar `persistSession: false`, `autoRefreshToken: false` y `detectSessionInUrl: false`. Mantener ambos clientes separados y verificar localmente que cada uno representa la cuenta aprobada.
3. Usar los clientes directamente contra PostgREST para ejecutar la siguiente comprobación lógica cuatro veces. Los identificadores se suministran en memoria y la consulta devuelve solo el conteo, sin el cuerpo de la fila.

```js
const { count, error } = await cliente
  .from('productos')
  .select('id', { count: 'exact', head: true })
  .eq('id', idDeFilaSintetica);
```

| Sesión | Fila A | Fila B |
| --- | --- | --- |
| A | 1 | 0 |
| B | 0 | 1 |

4. Dar por aprobada únicamente la matriz completa con los cuatro conteos esperados y sin errores. Dos ceros en una columna indican que falta confirmar el control positivo. Registrar solo los alias A/B, conteos y resultado. Cerrar los clientes temporales. No guardar cuerpos de respuesta, identificadores, encabezados ni capturas de red.

El filtro usa únicamente el ID de la fila sintética. Añadir un filtro por propietario haría que una respuesta vacía pudiera deberse al filtro del cliente. La prueba se limita a lecturas y no pasa por Express.

## Preparación de cuentas y productos

La revisión de la documentación local no identificó dos cuentas autorizadas con productos sintéticos. La propuesta se limita a dos cuentas nuevas de uso exclusivo de prueba y a un producto por cuenta.

| Alias | Nombre del producto | SKU | Cantidad | Mínimo |
| --- | --- | --- | --- | --- |
| A | PRUEBA RLS DÍA 4 — Producto A (ficticio) | PRUEBA-D04-RLS-A | 1 | 0 |
| B | PRUEBA RLS DÍA 4 — Producto B (ficticio) | PRUEBA-D04-RLS-B | 1 | 0 |

1. Tras la aprobación, usar dos buzones de prueba controlados por el titular. Confirmar que el proyecto permite el alta normal por correo. Usar `signUp` con la clave publicable del proyecto y contraseñas fuertes distintas, introducidas mediante un flujo local sin eco ni registro. Si el proyecto requiere confirmación de correo, completarla en cada buzón y abrir dos sesiones independientes con `signInWithPassword`. Si falta un buzón, la confirmación o el flujo autorizado, detener el alta o la prueba según corresponda. Registrar cualquier alta parcial para evitar repetirla. [Alta en Supabase Auth](https://supabase.com/docs/reference/javascript/auth-signup) · [Inicio de sesión](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
2. Verificar la identidad de cada sesión localmente. Usar dos clientes independientes, con la configuración en memoria indicada arriba. Crear el producto de cada cuenta por PostgREST con la sesión de su propietario y el conjunto de campos de la tabla anterior. Dejar que PostgreSQL asigne los valores predeterminados de `user_id`, `id` y `created_at`. Conservar los dos identificadores solo en memoria para completar la matriz. Ante un error, verificar el estado de los recursos sintéticos antes de reintentar.
3. Ejecutar las cuatro consultas de conteo sin Express. Para cada resultado, registrar solo la sesión A/B, la fila A/B, el conteo y el estado. Los valores de la matriz anterior son esperados y todavía no se han observado en la Data API.

### Operaciones no autorizadas preparadas

- **Inserción con propietario ajeno.** Con la sesión A, intentar un alta indicando el propietario B y un SKU sintético exclusivo para esa operación. Esperar rechazo por RLS. Si se acepta, detener la prueba y registrar la incidencia sin manipular filas adicionales.
- **Edición cruzada.** Con la sesión A, intentar editar únicamente el ID sintético de B y pedir confirmación de filas afectadas. Esperar cero filas o un rechazo. Con B, comprobar que su fila conserva los valores iniciales.
- **Eliminación cruzada.** Con la sesión B, intentar eliminar únicamente el ID sintético de A. Esperar cero filas o un rechazo. Con A, comprobar que la fila sigue visible. Si una regresión permite el borrado, el único objetivo sería el producto ficticio.

Estas operaciones negativas pueden producir escrituras si hay una regresión. Quedan preparadas para un entorno aislado o para autorización expresa adicional que cubra esas pruebas en el proyecto real. La autorización solicitada para el alta y la matriz solo incluye las dos cuentas, los dos productos y las lecturas. Conservar los recursos sintéticos al terminar hasta que se acuerde su limpieza.

## Ejecución con las dos cuentas de prueba existentes

El titular confirmó las cuentas A/B existentes y autorizó únicamente los dos productos sintéticos. Se descartó el flujo de alta de usuarios. Una consulta de conteo al catálogo de productos por los dos SKU exactos, sin devolver filas, dio cero para A y B antes de abrir la prueba local.

El [asistente local](aislamiento-local.mjs) escucha solo en la interfaz loopback. Los datos del formulario se envían desde el navegador directamente a Supabase Auth. El servidor local entrega la página y recibe solo estados anónimos. Se verifican ambas identidades y los dos SKU con cada sesión antes del alta. La matriz de cuatro lecturas usa el SKU, sin filtro por propietario, y se detiene si un conteo contradice la política esperada. No se usa Express.

**Resultado de la ejecución por SKU:** A→A=1, A→B=0, B→B=1, B→A=0. El [registro anónimo](evidencias/07-sesiones-existentes.txt) conserva la salida. Los dos productos sintéticos quedan pendientes de limpieza autorizada.
