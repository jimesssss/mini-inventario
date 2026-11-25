---
name: pruebas-inventario
description: Crea, revisa y ejecuta pruebas de interfaz de Mini Inventario con Playwright. Úsala cuando se solicite automatizar o verificar flujos del inventario, como iniciar sesión, registrar, buscar, editar o eliminar productos.
---

# Pruebas de Mini Inventario

- Usa Playwright con `@playwright/test` para las pruebas de interfaz y coloca los archivos `*.spec.js` en `tests/`. Revisa `playwright.config.js`, `tests/inventario.spec.js` y la historia correspondiente en `docs/requisitos.md`.
- Lee las credenciales y la configuración de `process.env`: `TEST_EMAIL`, `TEST_PASSWORD`, `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY`. Usa una cuenta dedicada de prueba. Mantén contraseñas, claves y tokens fuera del código y de las salidas.
- Usa Supabase PostgreSQL como única base de datos. Respeta Supabase Auth y RLS. Usa la sesión del usuario propietario para preparar y limpiar sus propios datos. Si se comprueba el aislamiento entre usuarios, usa sesiones independientes de cuentas de prueba y verifica que una cuenta no pueda acceder a los productos de la otra.
- Genera un SKU único por cada producto de prueba con `randomUUID()`. Reutiliza los fixtures existentes cuando sean apropiados, como `productoTemporal` para crear y limpiar productos temporales. Revisa que su limpieza siga siendo válida si el caso cambia los datos del producto.
- Ejecuta la limpieza en el desmontaje del fixture o en `finally`, incluso si falla una aserción o se pierde la respuesta del alta. Elimina únicamente los productos creados por la propia prueba. Conserva el ID confirmado y el SKU para identificar cada producto. Si falta el ID, exige una coincidencia inequívoca con los datos sintéticos antes de eliminar. Verifica la eliminación y comunica cualquier limpieza pendiente.
- Usa selectores por rol o etiqueta con `getByRole` y `getByLabel`. Identifica las filas por su SKU y evita depender de su posición o de clases de estilo.
- Cubre al menos un caso correcto y un caso de error. Comprueba el resultado observable y, si el error debe impedir un cambio, verifica que los datos guardados se conserven.
- Distingue la revisión estática, el descubrimiento con `test --list` y la ejecución real en navegador. Afirma que una prueba pasó solo si la ejecutaste y observaste que pasó. Si quedó sin ejecutar, indica qué verificación sí se hizo y por qué la ejecución quedó pendiente.
