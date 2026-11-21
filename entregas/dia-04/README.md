# Día 4 de 10 — Preparación y diagnóstico

## Base de trabajo

- GitHub confirmó que el PR #9 se fusionó en `main` el 20 de noviembre de 2026 a las 03:38:16 UTC. Se actualizó `main` por avance rápido y se creó `dia-04-supabase` desde `1224babe34c88cb1878e1d2a9ab2982907137cee`.
- Se conservaron el archivo local sin rastrear `src/db/database.js`, el respaldo SQLite ignorado `data/inventario.db`, el `.env` ignorado y el stash del Día 3. Las huellas de los tres archivos y la referencia del stash coincidieron antes y después del cambio de rama.

## Estado de la integración

- El código ya implementa inicio y cierre de sesión con Supabase Auth. Express verifica el token y lo usa para acceder a `productos` con la identidad del usuario. El CRUD, la búsqueda parcial y las alertas de existencias ya están implementados.
- La evidencia del Día 3 registra aislamiento entre dos cuentas desde la interfaz. La verificación directa contra la Data API sigue pendiente porque el filtro por propietario de Express también interviene en la prueba de interfaz.
- `codex mcp list --json` no mostró un servidor de Supabase y la sesión actual tampoco expone herramientas de Supabase. Queda pendiente configurar el servidor y comprobar que esté restringido al proyecto existente.
- Las skills `supabase` y `supabase-postgres-best-practices` no aparecieron en los directorios de skills de usuario y repositorio revisados ni en el catálogo activo.

## Revisión de la migración versionada

`supabase/migrations/20261119000000_crear_productos.sql` habilita RLS en `public.productos` y limita los permisos al rol `authenticated`. Una política restrictiva adicional excluye las sesiones anónimas de Supabase Auth.

| Operación | Regla por propietario |
| --- | --- |
| `SELECT` | `USING` exige que `user_id` coincida con `auth.uid()`. |
| `INSERT` | `WITH CHECK` exige que la fila nueva pertenezca al usuario autenticado. |
| `UPDATE` | `USING` y `WITH CHECK` comprueban la propiedad de la fila original y la resultante. Los permisos de columna excluyen `user_id`. |
| `DELETE` | `USING` limita la operación a las filas propias. |

La migración también define el mínimo por producto, restricciones de enteros no negativos y un índice único por usuario sobre `lower(sku)`. El disparador recorta el SKU antes de almacenarlo. La revisión fue estática. Queda pendiente contrastar la migración con las políticas y permisos del proyecto remoto y probar el aislamiento directamente con sesiones de dos cuentas.

## Comprobaciones e incidencias

- Suite local con Node.js 22.20.0 y `node --test`. Pasaron las 3 pruebas. La interfaz, Auth y Data API se probaron con simulaciones.
- El sandbox bloqueó el acceso a GitHub. La consulta del PR y la actualización de `origin/main` se completaron con permisos elevados.
- NVM no tenía una versión activa en esta terminal. Para las pruebas se usó directamente el ejecutable instalado de Node.js 22.20.0. Para listar MCP se usó `codex.cmd` con esa versión en `PATH` y permisos elevados porque el CLI no resolvió su directorio de usuario dentro del sandbox.
- Python 3.12 quedó sin verificar. `py` no estaba disponible y `python` apuntaba a un entorno externo con un ejecutable inaccesible. La suite local solo requiere Node.js.

## MCP oficial de Supabase

- Se confirmó la rama `dia-04-supabase`. En una terminal nueva, Node.js devolvió `v22.20.0`, npm devolvió `10.9.3` y `codex mcp list` terminó correctamente. Supabase no figuraba en la lista.
- Se verificó que el arranque de Mini Inventario carga `.env` y que el cliente de Supabase toma `SUPABASE_URL`. La URL configurada tiene el formato oficial del proyecto y no hay una variable heredada que apunte a otro destino. La referencia se obtuvo de esa URL sin exponer su valor ni leer claves.
- Se comprobó en la [documentación oficial de Supabase](https://supabase.com/docs/guides/ai-tools/mcp#configuration-options) que `project_ref` limita el MCP a un proyecto y que `read_only=true` habilita el modo de solo lectura.
- Tras la aprobación, se registró `supabase` en la configuración global de Codex. El lanzador `.cmd` omitió el parámetro que seguía al carácter `&`. Se repitió el registro con el ejecutable nativo de Codex y `codex mcp list --json` confirmó que la entrada quedó habilitada con el servidor oficial, la referencia configurada en la aplicación y `read_only=true`.
- El registro inició OAuth automáticamente. La solicitud incluía permisos de escritura, por lo que se detuvo el flujo antes de conceder acceso. La autenticación quedó pendiente. No se consultaron datos ni se hicieron cambios en el proyecto remoto.

## Preparación de la instalación de skills de Supabase

- `git branch --show-current` devolvió `dia-04-supabase`. La búsqueda de `SKILL.md` y la comprobación con `Test-Path` no encontraron `supabase` ni `supabase-postgres-best-practices` en las rutas de instalación revisadas.
- Los lanzadores de NVM indicaron que no había una versión activa en esta terminal. Se antepuso el directorio de Node.js 22.20.0 al `PATH` de ese proceso. `node -v` y `npm.cmd -v` devolvieron `v22.20.0` y `10.9.3`.
- La [documentación de Supabase](https://supabase.com/docs/guides/ai-tools/ai-skills) enlaza el [repositorio oficial](https://github.com/supabase/agent-skills) y documenta las dos skills solicitadas.
- Se revisaron los metadatos publicados de `skills@1.9.0` en npm, la entrada `bin/cli.mjs` y el flujo de selección e instalación en el código fuente de Vercel. El CLI carga `dist/cli.mjs`, filtra por los nombres solicitados y copia los archivos de las skills. El destino de proyecto configurado para Codex es `.agents/skills`.
- Comando preparado y pendiente de aprobación. Todavía no se ejecutó la instalación.

```powershell
npx skills add supabase/agent-skills --skill supabase supabase-postgres-best-practices -a codex -y
```

### Instalación y verificación

- Tras la aprobación, se ejecutó el comando anterior desde `dia-04-supabase` mediante `npx.cmd` de Node.js 22.20.0. npm descargó `skills@1.9.0` y el instalador clonó `https://github.com/supabase/agent-skills.git`. El comando terminó con código `0` e informó que copió exactamente dos skills para Codex.
- `Get-Item` confirmó los archivos `.agents/skills/supabase/SKILL.md` y `.agents/skills/supabase-postgres-best-practices/SKILL.md`. Se verificó que el campo `name` de cada manifiesto coincide con el nombre solicitado.
- `Get-ChildItem` mostró solo los dos directorios solicitados. El instalador también generó `skills-lock.json` y la comprobación del JSON confirmó que contiene únicamente esas dos entradas.
- Las skills quedaron en la ruta de descubrimiento del proyecto. Codex debería detectarlas en el siguiente turno. Si no aparecen, abrir una conversación nueva en Mini Inventario.

## Auditoría RLS de public.productos — 20 de noviembre de 2026

Se confirmó la rama `dia-04-supabase` y se consultaron los manifiestos y las guías de RLS de `supabase` y `supabase-postgres-best-practices`. El MCP oficial estaba habilitado con `read_only=true` y su `project_ref` coincidía con el proyecto configurado en Mini Inventario. La consulta autenticada devolvió `transaction_read_only=on`. Se usaron dos consultas `SELECT` de metadatos del catálogo de PostgreSQL para inspeccionar RLS, políticas y privilegios sin leer filas de productos ni usuarios.

### Definición local y configuración remota

La migración [20261119000000_crear_productos.sql](../../supabase/migrations/20261119000000_crear_productos.sql) habilita RLS. El catálogo remoto confirmó `relrowsecurity=true` y `relforcerowsecurity=false`, conforme al archivo. Los roles `anon` y `authenticated` no son propietarios de la tabla y no tienen `BYPASSRLS`.

Las cinco políticas remotas coinciden con la migración en nombre, operación, rol, modo y condición. Todas aplican a `authenticated`. En la tabla, «propietario» significa `user_id = (select auth.uid())`.

| Política | Operación | Modo | USING | WITH CHECK |
| --- | --- | --- | --- | --- |
| `productos_consultar_propios` | SELECT | Permisiva | Propietario | — |
| `productos_registrar_propios` | INSERT | Permisiva | — | Propietario |
| `productos_actualizar_propios` | UPDATE | Permisiva | Propietario de la fila original | Propietario de la fila resultante |
| `productos_eliminar_propios` | DELETE | Permisiva | Propietario | — |
| `productos_sesion_no_anonima` | ALL | Restrictiva | `is_anonymous` distinto de `true` | `is_anonymous` distinto de `true` |

### Diferencia en privilegios

La base remota concede directamente SELECT, INSERT, UPDATE y DELETE a nivel de tabla a `anon` y `authenticated`. La migración revoca los privilegios de `PUBLIC` y `anon`, y para `authenticated` concede SELECT y DELETE a nivel de tabla, INSERT solo sobre `user_id, nombre, sku, cantidad, minimo` y UPDATE solo sobre `nombre, sku, cantidad, minimo`.

Las políticas vigentes no conceden acceso a filas a `anon` y comprueban la propiedad en las escrituras de `authenticated`. Los permisos adicionales permiten que un usuario autenticado proporcione o cambie `id` y `created_at` en filas propias, sujeto a las demás restricciones. También aumentan el impacto de un cambio futuro que debilite RLS. Se propone alinear los privilegios remotos con la migración mediante un cambio revisado, conservar las cinco políticas y verificar después los permisos efectivos. La corrección no se aplicó.

### Evidencia de aislamiento y pruebas pendientes

- **Interfaz.** La evidencia del Día 3 documenta que cada una de dos cuentas reales vio su propio inventario. Express también filtra por propietario. [Evidencia del Día 3](../dia-03/evidencias/06-aislamiento-interfaz-real.md)
- **Data API directa.** Sigue pendiente consultar la misma fila con ambas sesiones sin pasar por Express. Los intentos de edición y eliminación entre cuentas solo se probaron por simulación.

## Propuesta de ajuste de privilegios de productos

La propuesta está en [20261120000000_ajustar_privilegios_productos.sql](../../supabase/migrations/20261120000000_ajustar_privilegios_productos.sql). La migración histórica permanece intacta. Se consultaron las dos skills oficiales y la regla de mínimo privilegio. Una nueva lectura del catálogo confirmó que los permisos de tabla adicionales son directos y que los permisos por columna definidos localmente ya existen en Supabase.

| Rol | Cambio propuesto |
| --- | --- |
| `PUBLIC` | Revocar cualquier privilegio de tabla. El catálogo consultado no mostró una concesión a `PUBLIC`. |
| `anon` | Revocar los permisos directos de tabla, incluidos SELECT, INSERT, UPDATE y DELETE. |
| `authenticated` | Conservar SELECT y DELETE de tabla. Retirar INSERT y UPDATE de tabla. Conceder INSERT sobre `user_id, nombre, sku, cantidad, minimo` y UPDATE sobre `nombre, sku, cantidad, minimo`. |

El SQL solo cambia permisos de `public.productos`. Es transaccional e idempotente para el estado inspeccionado. No escribe filas ni cambia valores existentes, vigencia de RLS, políticas, valores por defecto, restricciones o disparadores.

### Compatibilidad comprobada en el código

- **Consulta.** SELECT de tabla cubre las columnas devueltas, el filtro por `user_id` y el orden por `created_at` e `id`.
- **Alta.** Express envía los cuatro campos editables y asigna `user_id` desde la sesión verificada. PostgreSQL sigue generando `id` y `created_at`. SELECT permite devolver la fila creada.
- **Edición.** Express modifica los cuatro campos editables y usa `id` y `user_id` como filtros. SELECT permite devolver la fila editada.
- **Eliminación.** DELETE y SELECT cubren la eliminación filtrada por `id` y `user_id` y la devolución de `id`. El frontend usa Express para todo el CRUD.
- Un cliente directo que hoy proporciona `id` o `created_at` al insertar o actualiza cualquiera de esos campos o `user_id` perdería ese permiso. La aplicación revisada no realiza esas operaciones.

`npm test` con Node.js 22.20.0 aprobó las tres pruebas locales, con Auth, Data API e interfaz simuladas. La compatibilidad con los nuevos permisos en PostgreSQL sigue pendiente de una prueba en un entorno aislado. Solo se ejecutó un SELECT de catálogo en Supabase durante esta preparación. El SQL propuesto no se ejecutó.

### Plan de pruebas y reversión

1. Antes de aplicar, volver a verificar y guardar los privilegios efectivos y las cinco políticas. Probar la migración dos veces en PostgreSQL local o de pruebas con la misma estructura, las mismas políticas y datos sintéticos. Verificar que las filas de prueba conserven su contenido al aplicar el ajuste.
2. Con dos cuentas de prueba, verificar en ese entorno el CRUD propio desde la interfaz y consultar la misma fila directamente por Data API con ambas sesiones. Probar que el rol `anon` carece de permisos, que no se puede leer ni modificar una fila ajena y que se rechazan las escrituras de las columnas protegidas. Confirmar que el alta sigue generando `id` y `created_at`.
3. Tras la aprobación y la eventual aplicación remota, repetir la consulta de metadatos para confirmar permisos efectivos por tabla y columna y las cinco políticas. Cualquier prueba remota que escriba o elimine requiere autorización específica y productos de prueba.
4. Si la transacción falla antes de confirmar, PostgreSQL revierte el ajuste. Si se confirma y hay una regresión atribuible al cambio, preparar y autorizar una reversión transaccional que restaure los permisos de tabla observados. Con el estado actual, la reversión concede SELECT, INSERT, UPDATE y DELETE a `anon` y restituye INSERT y UPDATE de tabla a `authenticated`. Los permisos por columna y RLS se conservan. Volver a comprobar el catálogo tras la reversión.

La aplicación remota queda pendiente de aprobación.

### Disponibilidad del entorno aislado

- `git branch --show-current` confirmó `dia-04-supabase`.
- No se encontró una instalación local utilizable de PostgreSQL, Supabase CLI, Docker ni Podman. `netstat` no mostró servicios en escucha en los puertos 5432, 54322 o 6543. `wsl.exe --list --quiet` devolvió `Wsl/E_ACCESSDENIED`, por lo que no se pudo comprobar si hay una distribución utilizable. PGlite no estaba instalado en el proyecto.
- `npm test` con Node.js 22.20.0 aprobó 3 de 3 pruebas con servicios simulados. `git diff --check` terminó con código 0. La migración nueva todavía no está rastreada por Git y quedó fuera de esa comprobación. La búsqueda separada con `rg` no encontró espacios ni tabulaciones al final de sus líneas.
- Quedaron pendientes las dos ejecuciones de la migración, la comparación de privilegios efectivos, el CRUD con los roles de prueba, la generación automática de `id` y `created_at` y la validación funcional de las cinco políticas RLS.
- Opciones para continuar: PostgreSQL aislado en memoria con PGlite y funciones de identidad de prueba, Supabase local con CLI y Docker para incluir Auth y Data API, o una instancia vacía de PostgreSQL de pruebas ya disponible. Se presentan las opciones antes de instalar herramientas o crear recursos. No se ejecutó la migración en ninguna base.

## Informe académico del Día 4

Se integró el MCP oficial de Supabase para auditar `public.productos` y se validó una corrección de mínimo privilegio en PostgreSQL aislado. La integración usa OAuth y una URL de MCP restringida al mismo proyecto de Mini Inventario con `read_only=true`. El catálogo respondió en una transacción de solo lectura. Las dos skills oficiales de Supabase se instalaron en `.agents/skills` y quedaron disponibles en Codex. Las notas anteriores sobre OAuth pendiente corresponden al primer intento de configuración.

| Actividad | Resultado | Evidencia |
| --- | --- | --- |
| MCP y catálogo remoto | RLS habilitado y cinco políticas confirmadas. Los permisos amplios de tabla para `anon` y `authenticated` siguen vigentes. Las concesiones por columna coinciden con la migración histórica. | [Metadatos](evidencias/02-supabase-metadatos.txt) |
| Migración aislada | PGlite 0.5.17 con PostgreSQL 18.7 ejecutó dos veces la migración. Coincidieron privilegios, políticas y filas ficticias después de ambas ejecuciones. `PUBLIC` y `anon` quedaron sin permisos y `authenticated` conservó los previstos. | [Salida de PGlite](evidencias/01-pglite.txt) |
| CRUD, valores automáticos y aislamiento | Pasaron el CRUD propio, los rechazos para `anon`, el bloqueo de columnas protegidas, la generación de `id` y `created_at`, el rechazo de inserción ajena y el bloqueo de lectura, edición y eliminación cruzadas. También se comprobó la política restrictiva para una sesión anónima de Auth y el `WITH CHECK` de UPDATE mediante un permiso temporal revertido en la base en memoria. | [Validador reproducible](validar-pglite.mjs) |
| Aplicación | Tres pruebas aprobadas con servicios simulados. La revisión de Express y el frontend confirmó que las columnas de escritura coinciden con los permisos propuestos. `git diff --check` devolvió 0. | [Salida de pruebas](evidencias/03-pruebas-proyecto.txt) |
| Entrega | Borrador de PR local. La revisión se preparó con evidencia de texto y la migración propuesta. | [Borrador](PR-borrador.md) |

PGlite ejecutó las migraciones SQL del proyecto con dos usuarios sintéticos y sustitutos locales de `auth.uid()` y `auth.jwt()`. La prueba cubre PostgreSQL, incluidas las reglas RLS. Sigue pendiente la prueba directa de aislamiento con dos sesiones reales mediante la Data API, que incluye Supabase Auth y PostgREST. El Día 3 documentó aislamiento desde la interfaz, donde también interviene el filtro de Express.

No hubo fallos en la ejecución final de PGlite ni en las pruebas de la aplicación. El bloqueo previo de WSL quedó resuelto para la validación SQL con PGlite. Se hicieron dos consultas remotas de catálogo y ninguna operación sobre registros reales. La corrección está lista para revisión. Aplicarla a Supabase y publicar el PR requieren autorización independiente.

### Reproducción y paquete

La instalación temporal se hizo con `npm install --prefix <directorio temporal> --no-package-lock --ignore-scripts --no-audit --no-fund @electric-sql/pglite`. Para repetir la prueba con la versión observada, usar `@electric-sql/pglite@0.5.17` y ejecutar desde el repositorio `node entregas/dia-04/validar-pglite.mjs <directorio temporal>/node_modules/@electric-sql/pglite/dist/index.js`.

El ZIP conserva las rutas del repositorio para la bitácora, evidencia, validador, borrador y ambas migraciones. La evidencia histórica del Día 3 se consulta desde el repositorio.

La revisión final cotejó los enlaces locales y la lista explícita de archivos del ZIP. Las huellas de los archivos privados e históricos inspeccionados y la referencia del stash coincidieron antes y después. El primer intento de empaquetado no cargó el ensamblado de compresión de .NET. Se cargó el ensamblado y se verificó que cada entrada del ZIP coincide con su archivo de origen.

## Revisión previa a publicación

El MCP confirmó el proyecto, el modo de solo lectura, RLS activo y las cinco políticas. El catálogo conserva los privilegios amplios de tabla para `anon` y `authenticated`. Las concesiones por columna permanecen vigentes y `list_migrations` devolvió una lista vacía. El ajuste propuesto no figura en ese historial y el catálogo confirma que sus efectos no están presentes.

No se encontraron dos sesiones de prueba accesibles y autorizadas ni dos productos sintéticos existentes confirmados. No se ejecutaron consultas a filas reales a través de la Data API. La evidencia real de esta revisión se limita a metadatos. La prueba con dos cuentas del Día 3 pasó por Express. La prueba de roles y políticas del Día 4 sí se ejecutó en PGlite con identidades ficticias. La suite de la aplicación volvió a pasar 3 de 3 con servicios simulados.

| Evidencia adicional | Contenido |
| --- | --- |
| [Verificación final](evidencias/04-verificacion-final.txt) | Configuración sin valores sensibles, catálogo remoto, historial MCP y comprobaciones locales. |
| [Procedimiento Data API](procedimiento-data-api.md) | Matriz reproducible de lecturas y criterios de aprobación. |
| [Aplicación y reversión](plan-aplicacion.md) | Pasos, criterios de detención, verificación posterior y SQL de reversión. |

La migración está lista para revisión técnica. El proyecto real conserva su configuración vigente. El borrador de publicación distingue las pruebas simuladas, aisladas y remotas.

## Seguimiento de la autorización condicionada

La migración no se ejecutó. Sigue pendiente la matriz directa de aislamiento: no hay dos sesiones de prueba autorizadas y dos filas sintéticas verificables disponibles para esta revisión. El procedimiento mantiene las sesiones separadas en memoria y registra únicamente cuatro conteos con alias A/B. No se consultaron filas ni se crearon cuentas o productos.

Se revisaron el SQL exacto y la reversión. El SQL cambia exclusivamente privilegios. No modifica el inventario, la estructura de la tabla ni las cinco políticas RLS. PostgreSQL sí registra GRANT y REVOKE en su catálogo de privilegios. Si la condición de no modificar el catálogo se refiere también a esas entradas, la corrección es incompatible con esa condición. El plan describe un operador autorizado fuera del MCP, pero su acceso para ejecutar el cambio todavía no está confirmado.

La comparación de referencia confirmó el destino correcto, una transacción de solo lectura, las cinco políticas y los privilegios amplios aún vigentes. Se repitieron las tres pruebas locales con servicios simulados y `git diff --check`. La validación aislada de PGlite se conserva como evidencia separada.

- [Salida de seguimiento](evidencias/05-autorizacion-condicionada.txt)
- [Procedimiento directo](procedimiento-data-api.md)
- [Aplicación y reversión](plan-aplicacion.md)

## Preparación de la prueba directa con recursos sintéticos

No se identificaron dos cuentas de prueba autorizadas con filas sintéticas disponibles. Se definieron las cuentas A/B y los SKU `PRUEBA-D04-RLS-A` y `PRUEBA-D04-RLS-B`. La creación requiere una sola aprobación para ambos pares y la disponibilidad de dos buzones de prueba bajo control del titular. La matriz se ejecutará directamente en PostgREST con sesiones de Supabase Auth en memoria.

Las operaciones negativas de escritura quedan diseñadas para productos sintéticos. En el proyecto real requerirían aprobación propia por su posible efecto si RLS falla. La migración de privilegios sigue pendiente de autorización independiente. No se crearon recursos durante esta preparación.

- [Procedimiento de Data API y recursos propuestos](procedimiento-data-api.md)
- [Salida de la preparación y de las pruebas locales](evidencias/06-preparacion-data-api.txt)

## Alta autorizada y comprobación previa pendiente

El titular confirmó disponibilidad de dos buzones y autorizó dos altas, dos productos sintéticos y cuatro lecturas por SKU. El alta no se inició. La respuesta pública de `signUp` puede ocultar que un correo ya está registrado, según la configuración de confirmación. El flujo disponible no permite descartar ambas coincidencias por adelantado sin acceso administrativo, que queda fuera de la autorización. El titular puede verificar ambos correos en privado en Authentication → Users si ya tiene acceso al Dashboard. Solo debe comunicar si ambos están libres. Si hay una coincidencia, se conserva la cuenta y se elige otro buzón de prueba. [Referencia de signUp](https://supabase.com/docs/reference/javascript/auth-signup)

Tras la verificación, se comprobarán los SKU visibles desde ambas sesiones antes de insertar. RLS limita lo que esas sesiones pueden ver y la unicidad del SKU se aplica por propietario. La matriz directa usará los SKU, sin filtrar por propietario. No se crearon recursos y no hay conteos reales. Las tres pruebas simuladas pasaron y `git diff --check` devolvió 0.

## Sesiones existentes de prueba A y B

Se confirmó con el titular que no hace falta registrar cuentas. El conteo de los SKU `PRUEBA-D04-RLS-A` y `PRUEBA-D04-RLS-B` devolvió cero para ambos antes de habilitar el flujo local. El servidor de prueba devolvió HTTP 200 y publicó el formulario en loopback con `Cache-Control: no-store`. La entrega sigue a la espera de que el titular inicie ambas sesiones. En este punto no se ha recibido ningún resultado de alta ni de la matriz.

- [Procedimiento de autenticación y lectura directa](procedimiento-data-api.md)
- [Asistente local de aislamiento](aislamiento-local.mjs)
- [Salida de preparación de las dos sesiones](evidencias/07-sesiones-existentes.txt)

### Resultado final de Supabase Auth y PostgREST

La prueba directa se completó con las dos cuentas de prueba existentes. La identidad devuelta por Auth fue distinta para cada sesión. Ambos SKU estaban ausentes en las lecturas previas y se creó un producto sintético por cuenta. Las cuatro consultas de conteo usaron el SKU como único filtro y fueron directamente a PostgREST.

| Sesión | SKU A | SKU B |
| --- | ---: | ---: |
| A | 1 | 0 |
| B | 0 | 1 |

Quedan para una limpieza autorizada posterior `PRUEBA-D04-RLS-A` (cuenta A) y `PRUEBA-D04-RLS-B` (cuenta B), ambos con cantidad 1 y mínimo 0. No se crearon ni modificaron usuarios. Tampoco se ejecutaron ediciones, eliminaciones ni la migración de privilegios. [Resultado anónimo](evidencias/07-sesiones-existentes.txt)

## Cierre técnico y operaciones pendientes de autorización

El MCP volvió a confirmar RLS y las cinco políticas en una transacción de solo lectura. La propuesta cambia únicamente las ACL de `public.productos` mediante GRANT y REVOKE. No ejecuta DML ni altera tablas, usuarios o políticas. La repetición en PGlite aprobó ambas ejecuciones y preservó las filas y políticas de prueba. `npm test` aprobó tres pruebas y `git diff --check` salió con código 0. [Salida de cierre](evidencias/08-cierre-tecnico.txt)

La prueba directa de Supabase Auth y PostgREST del Día 4 aprobó A/A=1, A/B=0, B/A=0 y B/B=1. La consulta de cierre confirmó exactamente dos candidatos, uno por cada SKU y nombre esperados, cantidad 1, mínimo 0 y dos propietarios distintos. La asignación A/B se basa en la matriz autenticada anterior. La limpieza volverá a verificar la identidad del propietario inmediatamente antes del borrado. No se eliminaron filas.

La migración y la limpieza requieren autorizaciones expresas separadas. El Editor SQL oficial es el mecanismo previsto para la migración, sujeto a que el operador autorizado tenga acceso al Editor del proyecto correcto. No se probó ese permiso de escritura. El MCP se conserva en solo lectura. [Plan de aplicación y limpieza](plan-aplicacion.md)

La lista de publicación está en el [borrador definitivo](PR-borrador.md). Se excluyen las skills instaladas localmente, su archivo de bloqueo, SQLite histórico, archivos privados, respaldos y entregas previas. El ZIP incluye la migración histórica solo como referencia necesaria para reproducir la prueba aislada. El commit y el PR siguen sin crearse.

## Autorización y verificación previa a la aplicación

Se recibió la autorización para ejecutar el ajuste de privilegios y, solo tras aprobar la verificación posterior, eliminar ambos productos de prueba. El MCP conserva `read_only=true` y apunta al proyecto de Mini Inventario. La lectura previa confirmó RLS, las cinco políticas y los privilegios anteriores al ajuste. La huella SHA-256 del SQL coincide con la copia del ZIP anterior y se mantuvo antes y después de repetir la validación doble de PGlite.

Se solicitó al titular ejecutar el archivo íntegro en el Editor SQL oficial del proyecto. La revisión remota posterior y la limpieza quedan pendientes de esa ejecución. El asistente local tiene preparado el modo explícito `--post-migration-cleanup` para repetir la matriz con las dos sesiones y confirmar las dos filas por identificador, SKU y propietario. Ese modo se usará únicamente después de validar el catálogo remoto. [Evidencia previa](evidencias/09-preaplicacion-autorizada.txt)

## Verificación posterior a la aplicación remota

El titular ejecutó la transacción en el Editor SQL oficial e informó éxito. El MCP confirmó en solo lectura que RLS sigue habilitado y las cinco políticas coinciden con la referencia previa. PUBLIC y anon carecen de los permisos comprobados sobre productos. authenticated conserva SELECT y DELETE de tabla, INSERT limitado a user_id, nombre, sku, cantidad y minimo, y UPDATE limitado a nombre, sku, cantidad y minimo.

El archivo ejecutado contiene exclusivamente cambios de privilegios. No se dispone de una huella de las filas originales anterior a la aplicación, por lo que no hay comparación directa de contenido para ese intervalo. Se tomó una huella agregada de las filas no sintéticas posterior a la migración y anterior a la limpieza, para verificar la conservación durante la limpieza sin exponer datos de las filas.

[Salida de verificación posterior](evidencias/10-verificacion-posterior.txt)

### Aislamiento posterior y limpieza completados

La matriz directa en PostgREST, por SKU y sin filtro de propietario, volvió a aprobar.

| Sesión | SKU A | SKU B |
| --- | ---: | ---: |
| A | 1 | 0 |
| B | 0 | 1 |

El asistente confirmó para ambas filas su identificador, SKU exacto, propietario autenticado, nombre y valores sintéticos. Se eliminaron únicamente `PRUEBA-D04-RLS-A` y `PRUEBA-D04-RLS-B`. Ambas operaciones confirmaron una fila y los conteos por sesión y por MCP quedaron en cero. El conteo y la huella agregada de todas las demás filas coincidieron antes y después de la limpieza. No se eliminaron cuentas.

Pasaron las tres pruebas simuladas de `npm test` y `git diff --check`. La entrega queda preparada para publicar con autorización independiente. La aplicación desde el Editor SQL queda registrada como ejecución manual. [Evidencia final anónima](evidencias/10-verificacion-posterior.txt)
