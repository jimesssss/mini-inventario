# Día 10 · Incidente de SKU duplicado

## Enlaces y estado

- Issue: [#24 — Validar SKU duplicado antes de enviar el formulario](https://github.com/jimesssss/mini-inventario/issues/24)
- Pull Request: [#25 — validar SKU duplicado antes de enviar](https://github.com/jimesssss/mini-inventario/pull/25).
- Aplicación: [https://mini-inventario-hbr5.onrender.com](https://mini-inventario-hbr5.onrender.com)

## Incidente y causa

Se evaluó primero el reporte A (cantidad negativa). El HTML limita cantidad y mínimo a enteros no negativos, el navegador valida esos límites y la API rechaza valores menores que cero. La migración existente también declara `CHECK (cantidad >= 0)`.

Se evaluó después el reporte B (SKU duplicado en la misma cuenta). La API maneja el error PostgreSQL `23505` como HTTP 409 y la migración existente define unicidad por propietario mediante `unique (user_id, lower(sku))`. Por tanto, el código impide persistir el duplicado; el defecto reproducible era de UX: el formulario no comprobaba la lista antes de enviar el POST/PATCH y esperaba la respuesta del servidor.

La corrección valida el SKU sin distinguir mayúsculas/minúsculas contra los productos cargados del usuario, marca el campo con un mensaje accesible y no envía la solicitud. Al editar, se excluye el producto actual. La API y la restricción de Supabase siguen siendo las defensas finales.

## Evidencia

- La prueba de interfaz añadida falla antes de la corrección: esperaba que no se enviara el POST, pero observó que el contador de solicitudes aumentó (`2 !== 1`). Salida completa: [prueba-antes-de-corregir.txt](./prueba-antes-de-corregir.txt).
- Captura del flujo antes de la corrección, reproducido localmente con el JavaScript de `main` y Auth/API simuladas: ![Flujo anterior: el formulario envía el SKU repetido y la API devuelve 409](./evidencia-reproduccion.png). La ejecución está en [reproduccion-local.txt](./reproduccion-local.txt).
- La prueba Playwright local, con Auth/API simuladas, pasa y confirma que no sale ningún POST duplicado: [playwright-verde.txt](./playwright-verde.txt).
- Captura local de la validación corregida: ![Formulario que marca el SKU duplicado y evita el envío](./evidencia-corregido.png).
- `npm test`: 9/9 pruebas aprobadas; incluye validación de servidor para cantidad inválida y manejo del error `23505`.

**Límite de evidencia de producción:** Render responde 200 en `/api/salud` y sus logs recientes muestran el arranque del servicio, no un intento de alta. No fue posible iniciar sesión con un usuario de prueba desde esta sesión. El conteo de filas y la comprobación de restricciones ya aplicadas en la base remota no se realizaron; no se limpiaron filas ni se aplicó una migración remota. La migración que define ambas restricciones ya existe en el repositorio. La captura adjunta es local y simulada, no una captura de producción.

## Cierre del ciclo

- **Aprendizaje:** la restricción de servidor/base de datos protege la integridad, pero la interfaz debe detectar errores previsibles antes de enviar la solicitud.
- **Siguiente requisito:** verificar con una cuenta de prueba que la restricción está aplicada en producción y que el usuario puede corregir el SKU desde el formulario.
- **Delegaría:** una revisión independiente de accesibilidad y de la unicidad por propietario frente a los requisitos comerciales.
- **Seguiría revisando:** despliegue de Render, ejecución de las pruebas E2E con las credenciales de CI y que las respuestas 409 continúen cubriendo carreras entre solicitudes.

## Bitácora obligatoria

- **Prompt clave:** completar el Día 10 evaluando los reportes de cantidad negativa y SKU duplicado, y corregir el caso aplicable con evidencia.
- **Decisión y causa encontrada:** la cantidad negativa ya estaba rechazada en formulario/API/SQL; para SKU la persistencia también estaba protegida. Se enfocó el cambio en impedir el envío innecesario desde la interfaz, sin afirmar que hubiera corrupción de datos.
- **Error de prueba detectado:** el primer Playwright usó `getByLabel('SKU')`, que coincidía tanto con el buscador como con el campo del formulario. Playwright reportó strict mode; se corrigió limitando el selector al formulario. La reproducción y las capturas antes/después usan una API simulada, no modifican datos.
- **Comando aprobado:** `npm test` y `npx playwright test tests/dia10-sku.spec.js`; ambos pasan después del cambio. La primera ejecución TDD de `npm test` falló antes de la corrección como se esperaba.
- **Comando no ejecutado:** no se creó usuario ni se consultó/modificó la tabla de producción porque las credenciales/MCP de Supabase no estaban disponibles en el proceso. No se ejecutó SQL destructivo ni se atribuyeron logs no observados.
- **Comprobación:** Playwright afirma que el mensaje aparece en el campo SKU y que no hubo POST; las 9 pruebas unitarias/API pasan. Render salud se verificó con HTTP 200.
