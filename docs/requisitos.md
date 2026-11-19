# Requisitos del proyecto Mini Inventario



## 1. Descripción del proyecto



Mini Inventario será una aplicación web que permitirá registrar, consultar, buscar, modificar y eliminar productos de un inventario general.



La finalidad es facilitar la organización de los productos y llevar un control de las cantidades disponibles.



## 2. Objetivo



Desarrollar una aplicación web sencilla para administrar productos, consultar sus datos y conocer sus existencias de manera rápida.



## 3. Datos de los productos



Cada producto tendrá la siguiente información:



| Campo | Descripción |
|---|---|
| Código | Identificador único del producto. |
| Nombre | Nombre del producto. |
| Categoría | Tipo de producto al que pertenece. |
| Cantidad | Número de unidades disponibles. |
| Precio | Precio unitario en pesos mexicanos. |
| Descripción | Información adicional del producto. |



Además, cada producto tendrá un identificador interno para poder modificarlo sin confundirlo con otro registro.



## 4. Requisitos funcionales



**RF01. Registrar productos:** permitir agregar productos con sus datos correspondientes.



**RF02. Consultar inventario:** mostrar todos los productos registrados en una tabla.



**RF03. Buscar productos:** permitir buscar productos por nombre o código.



**RF04. Editar productos:** permitir modificar los datos de un producto existente.



**RF05. Eliminar productos:** permitir eliminar productos del inventario, solicitando una confirmación antes de realizar la operación.



**RF06. Controlar existencias:** mostrar el estado de cada producto y el indicador de existencias bajas de todo el inventario según el apartado 8.5.



## 5. Reglas del sistema

Las reglas de registro, búsqueda, edición, eliminación y control de existencias se detallan en el apartado 8.

## 6. Requisitos no funcionales



- La aplicación debe ser fácil de utilizar.

- Debe funcionar desde un navegador web.

- La interfaz debe ser sencilla y ordenada.

- Los datos deben conservarse después de cerrar la aplicación.

- El sistema debe mostrar mensajes claros cuando ocurra un error.

- La información de los productos se almacenará utilizando SQLite.

- Antes de guardar un producto, tanto al registrarlo como al editarlo, la aplicación deberá validar los datos en el formulario y en el servidor.



## 7. Resultado esperado



Al finalizar el proyecto se espera contar con una aplicación web que permita administrar un inventario general, mantener los productos organizados y consultar sus existencias.



El sistema contará con una interfaz para registrar, buscar, editar y eliminar productos.



También permitirá identificar los productos con pocas existencias y conservar la información registrada en una base de datos SQLite.



## 8. Reglas adicionales del inventario



### 8.1. Registro de productos



- El código, nombre y categoría serán obligatorios.

- No se permitirá registrar códigos repetidos, aunque tengan diferentes mayúsculas o minúsculas.

- Se eliminarán los espacios innecesarios al inicio y al final de los datos.

- La cantidad deberá ser un número entero igual o mayor que cero.

- El precio deberá ser igual o mayor que cero y tener máximo dos decimales.

- La descripción será opcional.

- Los códigos se manejarán como texto para conservar los ceros iniciales.



### 8.2. Búsqueda de productos



- La búsqueda por nombre permitirá coincidencias parciales.

- La búsqueda no distinguirá entre mayúsculas y minúsculas.

- La búsqueda por código permitirá localizar el código exacto.

- Si el buscador está vacío, se mostrarán todos los productos.

- Si no existen coincidencias, aparecerá un mensaje indicando que no se encontraron productos.



### 8.3. Edición de productos



- Al guardar los cambios se aplicarán las mismas reglas de validación que en el registro.

- No se permitirá cambiar el código por uno que ya pertenezca a otro producto.

- Si el producto ya no existe, el sistema mostrará un mensaje indicando que no se encontró.



### 8.4. Eliminación de productos



- El mensaje de confirmación incluirá el nombre o código del producto.

- El usuario podrá confirmar o cancelar la operación.

- Si confirma, el producto se eliminará definitivamente de la base de datos.

- Si cancela, el producto permanecerá registrado.

- Si el producto ya no existe, el sistema mostrará un mensaje informativo.



### 8.5. Control de existencias



- **Agotado** con 0 unidades.
- **Existencias bajas** con 1 a 5 unidades. Se mostrará una advertencia.
- **Disponible** con 6 o más unidades.
- El indicador de existencias bajas contará únicamente los productos con 1 a 5 unidades de todo el inventario, incluso cuando se aplique una búsqueda.

- Los indicadores generales mostrarán la información de todo el inventario.

- La cantidad disponible se actualizará cuando se modifique un producto.



