# Diseño del proyecto Mini Inventario

## 1. Arquitectura

Mini Inventario permitirá que cada usuario registre, consulte, busque, edite y elimine los productos de su propio inventario.

En la planeación inicial se eligió SQLite. Después de revisar la entrega, el profesor indicó que el curso utilizará Supabase a partir del Día 4. Este diseño describe la arquitectura prevista para esa etapa.

| Componente | Responsabilidad |
| --- | --- |
| Navegador | Mostrar el inventario y los formularios con HTML, CSS y JavaScript. Enviar las solicitudes a Express y mostrar sus resultados. |
| Servidor | Usar Node.js 22 y Express para verificar la sesión, validar las solicitudes y acceder a Supabase con la identidad del usuario. |
| Supabase | Guardar los productos en PostgreSQL y aplicar las restricciones de integridad y de acceso por propietario. |

La estructura propuesta mantiene la interfaz en `public/`, el servidor en `src/server.js`, las rutas de productos en `src/routes/` y el acceso a Supabase en `src/db/`. Las credenciales se gestionarán fuera del código fuente.

## 2. Tabla `productos`

| Campo | Tipo propuesto | Regla |
| --- | --- | --- |
| `id` | UUID | Clave primaria, generada al registrar el producto. |
| `user_id` | UUID | Obligatorio. Identifica al propietario y referencia `auth.users.id`. El servidor lo obtiene de la sesión verificada. |
| `nombre` | Texto | Obligatorio. Debe contener al menos un carácter después de recortar los espacios de los extremos. |
| `sku` | Texto | Obligatorio. Se recortan los espacios de los extremos y se conservan los ceros iniciales. |
| `cantidad` | Entero | Obligatorio y mayor o igual a cero. |
| `minimo` | Entero | Obligatorio y mayor o igual a cero. Se configura por producto. |
| `created_at` | Fecha y hora con zona horaria | Obligatorio. Supabase asigna la fecha y hora al crear el producto. |

El SKU será único por usuario, sin distinguir mayúsculas y minúsculas. Por ejemplo, un usuario que ya tiene `001-ABC` no puede registrar `001-abc`, pero otro usuario sí puede usar ese SKU en su inventario. La base de datos comprobará la unicidad mediante un índice único sobre `user_id` y el SKU recortado y convertido a minúsculas.

## 3. Interfaz y operaciones

| Historia | Comportamiento de la interfaz |
| --- | --- |
| HU-01 · Registrar | El botón **Agregar producto** abre un formulario con nombre, SKU, cantidad y mínimo. Tras guardar, el producto aparece en el inventario del usuario. |
| HU-02 · Consultar | Al abrir o recargar el inventario se muestran solo los productos guardados del usuario. La tabla presenta nombre, SKU, cantidad, mínimo y estado. |
| HU-03 · Buscar | El buscador acepta coincidencias parciales por nombre o exactas por SKU, sin distinguir mayúsculas y minúsculas. Al vaciarlo se muestra todo el inventario del usuario. Si no hay coincidencias, se muestra un mensaje. |
| HU-04 · Editar | Cada fila tiene un botón **Editar** que abre el formulario con los cuatro valores guardados. Al guardar valores válidos se actualizan la fila y su estado. Si hay un error de validación, se conservan los datos guardados. |
| HU-05 · Eliminar | Cada fila tiene un botón **Eliminar**. La confirmación muestra el nombre o el SKU. Al cancelar, el producto sigue guardado. Al confirmar y completarse la operación, se elimina de la base de datos y deja de aparecer incluso después de recargar. |

### Estados de existencias

| Estado | Condición |
| --- | --- |
| Agotado | La cantidad es igual a cero, incluso si el mínimo también es cero. |
| Existencias bajas | La cantidad es mayor que cero y menor o igual al mínimo. La tabla muestra una advertencia. |
| Disponible | La cantidad es mayor que cero y supera el mínimo. |

El estado se calcula con `cantidad` y `minimo`. El indicador de existencias bajas cuenta todos los productos del usuario en ese estado, incluso cuando la búsqueda oculta algunos resultados.

## 4. Validaciones por capa

### Navegador

- Al registrar o editar, recortar los espacios de los extremos del nombre y del SKU. Exigir que ambos tengan contenido y tratar el SKU como texto.
- Exigir que la cantidad y el mínimo estén presentes y sean enteros no negativos. Mostrar un mensaje junto al campo inválido y detener el envío hasta corregirlo.
- Mostrar los errores que devuelva el servidor. Enviar la solicitud de eliminación solo cuando el usuario confirme el diálogo.

### Servidor

- Verificar la sesión de Supabase Auth y obtener de ella el `user_id`. Las consultas, las búsquedas y los conteos se limitan a ese propietario. Para editar o eliminar, identificar el producto por `id` y `user_id`.
- Volver a comprobar los campos obligatorios, recortar los textos y rechazar cantidades y mínimos vacíos, negativos o con decimales. En el registro, asignar el propietario desde la sesión. En la edición, aceptar únicamente cambios en nombre, SKU, cantidad y mínimo.
- Mostrar un error de duplicado cuando la base de datos rechace un SKU de otro producto del mismo usuario. Conservar el SKU del producto que se está editando es válido.
- Si el producto ya no existe o pertenece a otra persona, devolver el mismo mensaje de producto no disponible para editar o eliminar. Si falta una sesión válida o falla el guardado, devolver un mensaje claro para que el usuario pueda resolver el error.

### Supabase

- Aplicar la clave primaria y la referencia al propietario. Exigir los siete campos, rechazar nombre y SKU vacíos después de recortar espacios y usar columnas enteras con restricciones de valor no negativo para cantidad y mínimo. Generar `id` y `created_at` al insertar.
- Aplicar el índice único por usuario y SKU normalizado para impedir duplicados, incluso si llegan dos solicitudes al mismo tiempo.
- Activar la seguridad por fila (RLS) en `productos`. Para usuarios autenticados, permitir leer y eliminar solo filas cuyo `user_id` coincida con `auth.uid()`. Exigir esa coincidencia al insertar y comprobarla tanto en la fila original como en la resultante al actualizar. Las sesiones anónimas quedan sin acceso.
- Ejecutar las operaciones del inventario con el token del usuario autenticado para que RLS evalúe su identidad. [Documentación de RLS de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
