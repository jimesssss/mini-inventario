# Tecnologías del proyecto Mini Inventario

## Tecnologías seleccionadas

| Tecnología | Por qué se utilizará |
| --- | --- |
| HTML | Define la estructura de los formularios, botones y tablas del inventario. |
| CSS | Organiza la pantalla y permite distinguir visualmente los estados de existencias. |
| JavaScript | Valida los formularios en el navegador, envía solicitudes al servidor y actualiza la pantalla con los resultados. |
| Node.js 22 | Ejecuta JavaScript en el servidor. |
| Express | Organiza las rutas para registrar, consultar, buscar, editar y eliminar productos. |
| Supabase | Desde el Día 3, almacena los productos en PostgreSQL, autentica a los usuarios con Supabase Auth y aplica restricciones de integridad y políticas RLS. |
| Python 3.12 | Se conserva como herramienta auxiliar para scripts de apoyo al desarrollo. |
| Git | Registra el historial de cambios y permite trabajar en ramas. |
| GitHub | Aloja el repositorio y permite revisar cambios mediante pull requests y organizar tareas con issues. |
| Codex | Ayuda a revisar la documentación y el código, detectar errores y proponer correcciones que la autora puede verificar. |

## Funcionamiento general

1. En el navegador, el usuario puede registrar, consultar, buscar por nombre o SKU, editar y eliminar sus productos. JavaScript comprueba los campos del formulario y pide confirmación antes de enviar una solicitud de eliminación.
2. Express recibe la solicitud, verifica la sesión de Supabase Auth, vuelve a validar los datos y se comunica con Supabase utilizando la identidad del usuario autenticado. Las consultas, búsquedas y modificaciones se limitan al inventario de ese usuario.
3. Supabase guarda, consulta o modifica los productos y aplica las restricciones de la tabla y las políticas de seguridad por fila (RLS). Express devuelve el resultado o un mensaje de error para que el navegador lo muestre.
4. El inventario muestra el estado de cada producto según su cantidad y su mínimo configurable. El indicador de existencias bajas cuenta todos los productos del usuario que estén en ese estado, incluso durante una búsqueda.

## Datos e integridad

La tabla `productos` tendrá los campos `id`, `user_id`, `nombre`, `sku`, `cantidad`, `minimo` y `created_at`.

- `user_id` identifica al propietario. Las políticas RLS permiten que cada usuario autenticado consulte y gestione únicamente sus propios productos.
- El nombre y el SKU son obligatorios. El SKU se guarda como texto para conservar los ceros iniciales y es único por usuario, sin distinguir mayúsculas y minúsculas.
- La cantidad y el mínimo son enteros no negativos. El mínimo se configura por producto.

## Antecedente

Durante la planeación inicial se eligió SQLite. En el Día 3, el proyecto adoptó Supabase PostgreSQL como única base de datos del inventario.
