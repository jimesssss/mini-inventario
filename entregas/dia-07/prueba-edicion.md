# Prueba de edición de productos

El caso `editar producto y conservar los cambios al recargar` cubre la edición válida de HU-04. Comprueba que el formulario carga los cuatro valores existentes, cambia el nombre, la cantidad y el mínimo, y verifica que la fila conserva el SKU y muestra «Existencias bajas» después de guardar y al recargar.

## Verificación local

- Node.js 22.20.0. El comando `node --check tests/inventario.spec.js` terminó correctamente.
- Playwright descubrió cinco casos con `test --list`, incluido el nuevo.
- Las tres pruebas de Node.js en `test/interfaz.test.js` y `test/productos.test.js` pasaron.
- El directorio de trabajo carecía de configuración local de Supabase y de credenciales para la cuenta de pruebas. La ejecución completa requiere esa configuración o el workflow de GitHub Actions.
- NVM tenía Node.js 22 instalado sin una versión activa. La verificación usó directamente el ejecutable de Node.js 22.20.0 y las dependencias instaladas en el directorio principal del mismo repositorio.
