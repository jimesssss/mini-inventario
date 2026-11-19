# Diseño del proyecto Mini Inventario



## 1. Descripción general



Mini Inventario será una aplicación web que permitirá administrar productos de diferentes categorías.



El usuario podrá registrar productos, consultar sus datos, buscar información, modificar registros y eliminar productos que ya no necesite.



Antes de comenzar a programar, se definió la estructura del proyecto y el funcionamiento de sus principales componentes.



## 2. Estructura propuesta del proyecto



La aplicación se organizará de la siguiente manera:



```text

mini-inventario/

├── docs/

│   ├── requisitos.md

│   ├── tecnologias.md

│   └── diseno.md

├── public/

│   ├── index.html

│   ├── css/

│   │   └── estilos.css

│   └── js/

│       └── app.js

├── src/

│   ├── server.js

│   ├── routes/

│   │   └── productos.js

│   └── db/

│       └── database.js

├── data/

│   └── inventario.db

├── entregas/

├── package.json

├── README.md

├── AGENTS.md

└── .gitignore

```



Por el momento, esta estructura es una propuesta. Las carpetas y archivos necesarios se crearán conforme avance el desarrollo.



## 3. Pantalla principal



La aplicación tendrá una pantalla principal donde se mostrarán los productos registrados.



Esta pantalla incluirá:



- Nombre de la aplicación.

- Botón para agregar productos.

- Buscador por nombre o código.

- Tabla con los productos registrados.

- Botones para editar y eliminar.

- Indicadores de productos registrados y existencias bajas.



## 4. Formulario de productos



El formulario permitirá registrar y modificar productos.



Tendrá los siguientes campos:



| Campo | Tipo de dato |
|---|---|
| Código | Texto |
| Nombre | Texto |
| Categoría | Texto |
| Cantidad | Número entero |
| Precio | Número decimal |
| Descripción | Texto |



Antes de guardar, el sistema comprobará que los datos obligatorios estén completos y que la cantidad y el precio sean válidos.



## 5. Funcionamiento de la aplicación



El funcionamiento general será el siguiente:



1. El usuario abrirá Mini Inventario desde su navegador.

2. La aplicación mostrará los productos registrados.

3. El usuario podrá agregar, buscar, editar o eliminar productos.

4. JavaScript enviará las solicitudes al servidor.

5. El servidor utilizará Node.js y Express para procesar las operaciones.

6. SQLite guardará o consultará la información.

7. La aplicación mostrará los resultados actualizados.



## 6. Organización de los componentes



**Interfaz:** se desarrollará con HTML, CSS y JavaScript. Permitirá visualizar productos y utilizar los formularios.



**Servidor:** se desarrollará con Node.js y Express. Recibirá las solicitudes y realizará las operaciones necesarias.



**Base de datos:** se utilizará SQLite para almacenar la información de los productos.



## 7. Reglas principales



- Cada producto tendrá un código único.

- No se permitirán cantidades negativas.

- No se permitirán precios negativos.

- El código, el nombre y la categoría serán obligatorios.

- **Agotado** con 0 unidades.
- **Existencias bajas** con 1 a 5 unidades. Se mostrará una advertencia.
- **Disponible** con 6 o más unidades.
- El indicador de existencias bajas contará únicamente los productos con 1 a 5 unidades de todo el inventario, incluso cuando se aplique una búsqueda.

- La información deberá conservarse después de cerrar la aplicación.



## 8. Resultado esperado



Se espera desarrollar una aplicación web sencilla y organizada que permita administrar un inventario general.



El diseño servirá como guía para comenzar la programación y realizar las pruebas correspondientes en los siguientes días.



