# Bitácora del Día 3 · Mini Inventario

Integrantes: Jimena Salazar Cedeño y German Basurto Amador.

## Base de datos

Desde el Día 3, Supabase PostgreSQL es la única base de datos del inventario. La [migración de productos](../../supabase/migrations/20261119000000_crear_productos.sql) registra el esquema y las políticas.

## Verificación del entorno

La terminal de trabajo no tenía una versión activa en NVM. Para instalar la dependencia y ejecutar las pruebas se usó directamente la instalación existente de Node.js 22.20.0 con npm 10.9.3.

## Respaldo

Se creó una copia de 14 archivos del Día 3 fuera del repositorio. Los archivos se verificaron mediante SHA-256.

## Primera etapa de conexión con Supabase

- Se añadió el cliente de Supabase y una plantilla de configuración sin valores reales. El navegador usa la clave publicable para iniciar y cerrar sesión con Supabase Auth.
- Express verifica el token en `GET /api/productos`. Consulta los productos con el mismo token y el ID verificado para que se apliquen las políticas RLS. El servidor sigue ofreciendo `GET /api/salud`.
- El inventario muestra nombre, SKU, cantidad, mínimo y estado. La lista se limpia al cerrar sesión.

## Pruebas

- Node.js verificó la sintaxis de los archivos JavaScript nuevos y modificados.
- La primera descarga de npm recibió un error de acceso. La instalación se completó al repetirla con el permiso de red solicitado.

### Pruebas simuladas

- Con Supabase simulado se comprobó el arranque de Express, la respuesta de salud, la entrega de la página y del cliente JavaScript, y la configuración pública. El listado devolvió `401` ante un token ausente, inválido o anónimo y `200` con una sesión válida. Se verificó el reenvío del token, el filtro por propietario, los errores de Supabase y que el servidor no carga SQLite.
- Con respuestas y elementos de pantalla simulados se verificaron el inicio de sesión rechazado y válido, la presentación del SKU con ceros iniciales y la limpieza de la lista al cerrar sesión.

### Pruebas manuales con el proyecto real

- Express inició correctamente en `http://localhost:3000`.
- El inicio de sesión fallaba porque `SUPABASE_URL` terminaba en `/rest/v1/`. Se corrigió localmente en `.env` para usar la URL base del proyecto.
- Tras la corrección, el inicio de sesión con un usuario confirmado de Supabase Auth fue exitoso.
- La aplicación mostró «Mis productos» y «Tu inventario todavía está vacío».
- La usuaria confirmó el registro real de Mouse Logitech con SKU `0001`, cantidad 5 y mínimo 10. La fila apareció con «Existencias bajas» y resaltado amarillo.
- Al editar la cantidad de 5 a 15, la aplicación mostró «Producto actualizado», cambió el estado a «Disponible» y retiró el resaltado.
- El botón «Cerrar sesión» regresó al formulario y mostró «Sesión cerrada».

### Pendiente

- Verificar directamente en la Data API el aislamiento observado en la interfaz con dos usuarios.

## Registro y edición de productos

- Se añadieron `POST /api/productos` y `PATCH /api/productos/:id`. Las dos rutas verifican la sesión y envían el token del usuario a Supabase. En el alta el propietario se toma de la sesión y, en la edición, se filtra por producto y propietario.
- El formulario valida los cuatro campos, conserva el SKU como texto y muestra el error junto al campo correspondiente. Un SKU duplicado devuelve `409` y un producto no disponible para editar devuelve `404`. Tras guardar, el listado usa los datos devueltos por Supabase y resalta las filas cuya cantidad está por debajo del mínimo.

### Pruebas automatizadas locales

- `npm test` aprobó la prueba HTTP con Supabase Auth y Data API simuladas. Se verificaron el listado, el alta, la edición, los campos inválidos, la preservación de los ceros iniciales, el conflicto de SKU, el rechazo de sesiones inválidas o anónimas y la respuesta para una fila no disponible.
- Con elementos de pantalla y respuestas simuladas se comprobó que la validación impide enviar un formulario vacío, que la edición precarga los datos, que un duplicado conserva el listado y que el guardado actualiza la fila y el resaltado. También se comprobó que cerrar sesión limpia el listado y oculta el formulario.
- El alta y la edición con Supabase real se confirmaron posteriormente en las pruebas manuales documentadas arriba.

## Auditoría del fallo real de registro

Se reportó un intento de alta de Mouse Logitech con SKU `0001`, cantidad 5 y mínimo 10. La aplicación mostró un error de guardado y la revisión posterior en Table Editor mostró cero filas. No se repitió el intento. El código envía esos valores con los tipos esperados, asigna el propietario desde la sesión y solicita que el INSERT devuelva la fila creada. La migración local concede los permisos para esos campos y establece las políticas de propietario. Eso no confirma los permisos efectivos de la base remota.

El servidor agrupaba casi todos los errores de escritura bajo el mismo mensaje. Ahora registra solamente la operación, un código con formato SQLSTATE o PostgREST y el estado HTTP. Un `42501` se comunica como rechazo por permisos. Ese código, por sí solo, no distingue un permiso de columna faltante de una política RLS. También se restauró la plantilla `.env.example` y se validó que la URL de Supabase sea la URL base.

La causa del primer fallo quedó sin confirmar. La inspección anterior del panel se detuvo porque la herramienta no pudo verificar la URL del navegador y no se obtuvo el código remoto. El alta posterior fue exitosa. Ese resultado confirma el funcionamiento del flujo real, pero no identifica la causa histórica. Durante la revisión final no se hicieron escrituras adicionales ni cambios en Supabase.

## Verificación final y evidencias

- [Salida de npm test](evidencias/01-pruebas-automatizadas.txt). Tres pruebas aprobadas con Node.js 22.20.0 y npm 10.9.3. Incluyen HTTP local con Supabase simulado, validación de la configuración e interfaz con DOM simulado. Se comprobó que el diagnóstico de escritura excluye el mensaje interno y rechaza códigos de formato inesperado.
- [Verificación HTTP del servidor local](evidencias/02-verificacion-http-local.txt). Se comprobó la ruta de salud, el HTML del formulario, la entrega del cliente JavaScript, el rechazo sin sesión y que el servidor no carga SQLite. Esta comprobación no hizo solicitudes remotas.
- [Revalidación automatizada final](evidencias/03-revalidacion-automatizada.txt). `npm test` volvió a aprobar las tres pruebas. La revisión HTTP local también confirmó salud `200`, productos sin sesión `401` y que el servidor no carga SQLite. La revisión de Git confirmó que `.env`, `node_modules` y los archivos de datos SQLite están excluidos y no detectó patrones de credenciales en los archivos de texto revisados.
- [Búsqueda, contador y eliminación](evidencias/04-busqueda-contador-eliminacion.txt). Incluye la salida final de `npm test` y la verificación HTTP local.
- [Aislamiento entre dos usuarios simulados](evidencias/05-aislamiento-simulado.txt). Guarda el resultado de `npm test` después de ampliar la prueba de seguridad.
- [Aislamiento en la interfaz con Supabase real](evidencias/06-aislamiento-interfaz-real.md). Registro del resultado manual confirmado por la usuaria.
- [Salida de la revisión final](evidencias/07-revision-final.txt). Las tres pruebas de `npm test` pasaron.
- [Salida de pruebas tras integrar las capturas](evidencias/08-pruebas-entrega-con-capturas.txt).
- [ZIP de evidencias disponibles](evidencias-dia-03.zip). Incluye la bitácora, el índice, las evidencias de texto y las 16 capturas aptas para publicar.

### Capturas revisadas

Se inspeccionaron las 17 capturas. El [índice de evidencias visuales](README-evidencias.md) recoge las 16 aptas para la entrega.

1. [Verificación del entorno en la terminal](evidencias/01-verificacion-entorno-terminal.png).
2. [Versión activa de Node.js](evidencias/02-version-node.png).
3. [Inicio del servidor local](evidencias/03-inicio-servidor-local.png).
4. [Vista parcial del panel de autenticación](evidencias/04-verificacion-respuesta-api.png).
5. [Inventario vacío de la segunda cuenta](evidencias/05-inventario-segunda-cuenta-vacio.png).
6. [Vista de inventario sin productos](evidencias/06-vista-inventario-sin-productos.png).
7. [Formulario de registro](evidencias/07-formulario-agregar-producto.png).
8. [Mensaje del primer intento de registro](evidencias/08-validacion-mensaje-registro.png).
9. [Producto registrado con existencias bajas](evidencias/09-producto-mouse-logitech-registrado.png).
10. [Formulario de edición](evidencias/10-formulario-edicion-producto.png).
11. [Producto actualizado y disponible](evidencias/11-producto-actualizado.png).
12. [Controles de búsqueda, contador y listado](evidencias/12-busqueda-y-listado-productos.png).
13. [Inspección del código en el navegador](evidencias/13-inspeccion-codigo-navegador.png).
14. [Punto de interrupción en la consulta de productos](evidencias/14-punto-interrupcion-linea-267.png).
15. [Punto de interrupción activado](evidencias/15-breakpoint-activado.png).
16. [Advertencia de seguridad de la consola](evidencias/17-advertencia-seguridad-consola.png).

La captura `16-depurador-pausado.png` muestra un correo personal. El original se conserva localmente y se excluye de Git y del ZIP. Las capturas del depurador documentan la preparación de la comprobación. La prueba directa de RLS en la Data API no se realizó.

Quedan pendientes la evidencia visual del cierre de sesión, la recuperación del código del POST fallido si está disponible, la comprobación visual de un filtro activo y la prueba real de eliminación de un producto descartable con autorización.

### Prompts y contexto de trabajo

- Se solicitó revisar el stash e incorporar la decisión de usar Supabase desde el Día 3. Se registró el respaldo verificado y se conservó la rama de trabajo.
- Se solicitó conectar Auth y el listado protegido. Las pruebas manuales confirmaron el acceso después de corregir la URL base.
- Se autorizó implementar el alta y la edición y probarlas con simulaciones. Tras el fallo real se solicitó una auditoría sin escrituras remotas.
- El contexto reutilizable queda en esta bitácora y en los requisitos. Antes de retomar, revisar la rama, el estado de Git, los resultados previos y las autorizaciones pendientes. La guía específica del Día 3 no se localizó en el repositorio y queda pendiente contrastar este registro con ella.
- Se autorizó completar la búsqueda parcial, el contador con umbral estricto y la eliminación individual. Todas las escrituras de sus pruebas se simularon.

### Comandos y límites

- Se ejecutaron `npm test`, `node --check`, `git status`, `git diff --check` y comprobaciones de exclusiones. El primer intento de `gh issue list` fue bloqueado por la red del entorno. Su repetición autorizada de solo lectura permitió identificar los issues.
- PowerShell no pudo cargar el módulo de `Compress-Archive`. Se creó el ZIP con la biblioteca de compresión de .NET y se verificó cada entrada mediante SHA-256.

### Búsqueda, contador y eliminación

- El navegador filtra el listado del usuario por coincidencia parcial de nombre o SKU sin distinguir mayúsculas. La API recoge el inventario por páginas para evitar que el límite de filas por respuesta recorte la búsqueda o el contador.
- El contador usa `cantidad < minimo` sobre el listado completo y se recalcula al cargar, guardar o eliminar. Una cantidad igual al mínimo no se cuenta. Una fila agotada con mínimo positivo se cuenta y mantiene el estado «Agotado».
- El botón «Eliminar» identifica el producto en la confirmación. La ruta `DELETE /api/productos/:id` verifica sesión, UUID y propietario. Reenvía a Supabase el token del usuario y confirma el éxito con `204` solo si obtiene la fila afectada. La interfaz conserva la fila si se cancela o si falla la operación.
- Las pruebas simuladas comprobaron la búsqueda parcial, la limpieza del filtro, el contador por debajo, igual y por encima del mínimo, la cancelación sin petición, las respuestas `400`, `401`, `403`, `404`, `502` y la eliminación exitosa. La recarga del listado simulado mantuvo la fila eliminada fuera del inventario. La verificación HTTP local comprobó salud, HTML y rechazo de GET y DELETE sin sesión.

### Estado frente a los requisitos

| Historia | Estado |
| --- | --- |
| HU-01 · Registrar | Alta real confirmada. Validaciones y duplicados cubiertos por simulación. Pendiente verificar con datos autorizados que dos propietarios puedan usar el mismo SKU. |
| HU-02 · Consultar | Listado, cambio de estado y aislamiento en la interfaz confirmados con Supabase real. Contador probado con simulaciones. Pendiente aislar la comprobación de RLS mediante la Data API. |
| HU-03 · Buscar | Implementada y probada con datos simulados. Pendiente prueba visual con el inventario de una cuenta autorizada. |
| HU-04 · Editar | Edición real confirmada. Los conflictos y el caso de una fila no disponible se probaron con simulación. |
| HU-05 · Eliminar | Implementada y probada con simulaciones. Pendiente verificación real con un producto descartable y autorización específica. |

Para aislar RLS del filtro de Express, consultar la misma fila por ID directamente desde el cliente Supabase de cada sesión autorizada, con la clave publicable y el JWT que gestiona el cliente. El resultado esperado es una fila para A y cero para B, sin errores. Los resultados de PATCH y DELETE entre cuentas se mantienen como simulaciones.

### Comprobación de aislamiento

- **Revisión de código.** GET, POST, PATCH y DELETE comparten la verificación del JWT mediante Supabase Auth y rechazan sesiones ausentes, inválidas o anónimas. POST usa el propietario verificado. GET filtra por ese propietario y PATCH y DELETE filtran además por ID. Las cuatro operaciones usan un cliente con el JWT de la solicitud.
- **Simulada.** `npm test` pasó las tres pruebas. La prueba HTTP verificó que A recibe su inventario, B no recibe las filas de A y que el PATCH y DELETE de B sobre un ID de A devuelven `404`. Se comprobó el reenvío del JWT ficticio de B, el filtro por su propietario y que una nueva lectura de A devuelve el mismo listado.
- **Real en la interfaz.** La usuaria confirmó que A vio Mouse Logitech, SKU `0001`, y B, desde otra sesión, no lo vio.
- **Directa en la Data API.** Pendiente. La aplicación mantiene las sesiones en memoria y no se tuvo acceso autorizado a los dos clientes activos para consultar la misma fila en esta revisión. No se extrajeron JWT ni se hicieron escrituras remotas.

## Borrador local del pull request

**Título propuesto — Día 3: inventario autenticado con Supabase**

Integra Supabase Auth y las operaciones de inventario mediante Express con el JWT del usuario. Incluye búsqueda parcial por nombre o SKU, contador global por debajo del mínimo y eliminación individual con confirmación. El inicio y cierre de sesión, listado, alta, edición y aislamiento en la interfaz se confirmaron con Supabase real. Las tres pruebas automatizadas de la revisión final pasaron, incluidas las simulaciones de búsqueda, contador, eliminación y acceso entre usuarios.

La [bitácora](README.md#verificación-final-y-evidencias) y el [ZIP de la entrega](evidencias-dia-03.zip) incluyen 16 capturas revisadas y las salidas de pruebas. El contador y el buscador se ven en la interfaz. El comportamiento del filtro y de la eliminación se cubrió con simulaciones. Quedan pendientes la comprobación visual con un filtro activo, la eliminación real autorizada de un producto descartable y la comparación de dos sesiones directamente en la Data API.

Relacionado con [#2 Registro](https://github.com/jimesssss/mini-inventario/issues/2), [#3 Consulta y existencias](https://github.com/jimesssss/mini-inventario/issues/3), [#4 Búsqueda](https://github.com/jimesssss/mini-inventario/issues/4), [#5 Edición](https://github.com/jimesssss/mini-inventario/issues/5) y [#6 Eliminación](https://github.com/jimesssss/mini-inventario/issues/6).
