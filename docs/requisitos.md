# Requisitos del proyecto Mini Inventario

Desde el Día 3, Mini Inventario usa Supabase PostgreSQL como única base de datos, con Supabase Auth y políticas de seguridad por fila (RLS). La tabla `productos` contiene los campos `id`, `user_id`, `nombre`, `sku`, `cantidad`, `minimo` y `created_at`. Cada usuario solo puede consultar y modificar sus propios productos.

Los resultados de las pruebas reales, simuladas y pendientes se registran en la [bitácora del Día 3](../entregas/dia-03/README.md).

## HU-01 — Registrar productos

Como usuario, quiero registrar productos para llevar un control de mi inventario.

1. Al guardar un producto válido, el sistema asigna su `id`, lo vincula con el `user_id` del usuario autenticado, registra `created_at` y muestra el producto en su inventario.
2. Si el nombre o el SKU queda vacío después de eliminar los espacios al inicio y al final, el sistema muestra un mensaje para el campo correspondiente e impide guardar. El SKU se conserva como texto, incluidos sus ceros iniciales.
3. El sistema permite configurar el mínimo de cada producto y solo guarda la cantidad y el mínimo cuando ambos son enteros mayores o iguales a cero.
4. Si el usuario ya tiene un producto con SKU `ABC-01`, el sistema rechaza `abc-01` en su inventario y muestra un mensaje de duplicado. Otro usuario puede registrar ese SKU en su propio inventario.

## HU-02 — Consultar productos y sus existencias

Como usuario, quiero consultar mis productos y sus existencias para saber cuáles debo reponer.

1. Al abrir o recargar el inventario, el usuario ve únicamente sus productos guardados, con nombre, SKU, cantidad, mínimo y estado.
2. Si la cantidad es cero, el producto aparece como **Agotado**, incluido el caso en que el mínimo también es cero.
3. Si la cantidad es mayor que cero y menor que el mínimo del producto, aparece como **Existencias bajas** y se muestra una advertencia.
4. Si la cantidad es mayor que cero e igual o superior al mínimo del producto, aparece como **Disponible**.
5. El indicador y el resaltado aplican `cantidad < minimo`. Un producto con cantidad cero y mínimo positivo se cuenta y conserva el estado **Agotado**. La búsqueda no cambia el total.

## HU-03 — Buscar productos

Como usuario, quiero buscar mis productos por nombre o SKU para encontrar un registro rápidamente.

1. Al escribir parte del nombre de un producto, se muestran las coincidencias de mi inventario sin distinguir mayúsculas y minúsculas.
2. Al escribir parte de un SKU o su valor completo, se muestran las coincidencias de mi inventario sin distinguir mayúsculas y minúsculas. El SKU se trata como texto para conservar sus ceros iniciales.
3. Al vaciar el buscador, vuelven a mostrarse todos los productos de mi inventario.
4. Si ningún producto de mi inventario coincide, el sistema muestra un mensaje indicando que no se encontraron productos.

## HU-04 — Editar productos

Como usuario, quiero editar mis productos para mantener actualizados sus datos y sus existencias.

1. Al abrir la edición de un producto propio, el formulario muestra el nombre, SKU, cantidad y mínimo guardados. Al guardar cambios válidos, el sistema actualiza ese producto y muestra el estado que corresponde a los nuevos valores.
2. Si el nombre o el SKU queda vacío después de recortar espacios, o si la cantidad o el mínimo está vacío, es negativo o tiene decimales, el sistema muestra el error y conserva los datos guardados.
3. El sistema permite conservar el SKU del producto editado. Si se usa el SKU de otro producto del mismo usuario, incluso con otras mayúsculas o minúsculas, el sistema muestra un mensaje de duplicado e impide guardar.
4. Si el producto ya no existe o pertenece a otro usuario, el sistema indica que el producto no está disponible para editar y la operación termina sin cambios.

## HU-05 — Eliminar productos

Como usuario, quiero eliminar productos de mi inventario para retirar los registros que ya no necesito.

1. Antes de eliminar un producto propio, el sistema muestra una confirmación que incluye su nombre o SKU.
2. Si el usuario cancela, el producto sigue guardado y visible en su inventario.
3. Si el usuario confirma, el producto se elimina de la base de datos y deja de aparecer en el inventario, incluso después de recargar la página.
4. Si el producto ya no existe o pertenece a otro usuario, el sistema indica que el producto no está disponible para eliminar y la operación termina sin cambios.
