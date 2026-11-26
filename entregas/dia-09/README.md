# Bitácora del Día 9 · Contenedor Docker y despliegue en Render

## Objetivo

Empaquetar `mini-inventario` en una imagen de producción y comprobar el ciclo de despliegue en Render: funcionamiento, fallo de compilación deliberado, diagnóstico y recuperación. El servicio objetivo es el de [`jimesssss/mini-inventario`](https://github.com/jimesssss/mini-inventario), no el ERP que está abierto en el workspace principal.

## Servicio y configuración observada

- Servicio: `mini-inventario` (`srv-dc45ucflk1mc739nlua0`), conectado a la rama `main` del repositorio correcto.
- URL pública: [https://mini-inventario-hbr5.onrender.com](https://mini-inventario-hbr5.onrender.com).
- Configuración observada por MCP: `autoDeploy=yes`, repositorio `jimesssss/mini-inventario`, rama `main`.
- Comprobación: `GET /api/salud` debería devolver HTTP 200 y `{"estado":"ok"}`. Las peticiones realizadas durante esta sesión agotaron el tiempo de espera; no se obtuvo un HTTP 200 del servicio público.
- El servicio usa Docker y su configuración apunta al `Dockerfile` en la raíz.
- Se consultaron servicios, despliegues y logs desde el MCP oficial de Render en el workspace confirmado. No se modificaron variables de entorno ni se solicitó un despliegue desde MCP.

## Dockerfile, línea por línea

| Línea | Instrucción | Propósito |
| --- | --- | --- |
| 1 | `FROM node:22-alpine` | Usa Node.js 22 sobre Alpine como imagen base ligera. |
| 3 | `WORKDIR /app` | Define el directorio de trabajo dentro del contenedor. |
| 5 | `COPY package.json package-lock.json ./` | Copia primero los manifiestos para aprovechar la caché de dependencias. |
| 6 | `RUN npm ci --omit=dev` | Instala dependencias reproducibles y omite las de desarrollo. |
| 8 | `COPY src/ ./src/` | Incluye el código del servidor. |
| 9 | `COPY public/ ./public/` | Incluye los recursos estáticos de la aplicación. |
| 11 | `ENV NODE_ENV=production` | Activa el entorno de producción de Node. |
| 12 | `ENV PORT=3000` | Define el puerto predeterminado; Render puede proporcionar `PORT`. |
| 14 | `EXPOSE 3000` | Documenta el puerto esperado por el contenedor. |
| 16 | `USER node` | Ejecuta el proceso sin privilegios de root. |
| 18 | `CMD ["node", "src/server.js"]` | Inicia el servidor Express. |

`src/server.js` escucha en `0.0.0.0` y usa `process.env.PORT || 3000`, por lo que recibe tráfico de fuera del contenedor y respeta el puerto asignado por la plataforma.

## Exclusión de secretos y archivos locales

El archivo `.dockerignore` excluye `.env`, `.env.*`, `node_modules`, `.git`, `tests`, `entregas` y artefactos locales. Así, los archivos de entorno no forman parte del contexto enviado al constructor. El `Dockerfile` copia explícitamente solo manifiestos, `src/` y `public/`; no copia `.env`. No se incluyeron valores secretos en el repositorio ni en esta bitácora.

## Prueba local con Docker

- Imagen construida desde la raíz del proyecto: `docker build -t mini-inventario .`
- Contenedor temporal ejecutado con un `.env` local que contenía únicamente `SUPABASE_URL` y `PORT`; el archivo estaba ignorado por Git y se eliminó al terminar.
- Se consultó `http://localhost:3000/api/salud`: HTTP 200 y `{"estado":"ok"}`.
- El contenedor temporal `test-inv` se eliminó después de la prueba.
- La suite del proyecto pasó: 9 pruebas aprobadas, 0 fallidas.

## Diagnóstico inicial de Render

La consulta de solo lectura al último despliegue mostró `build_failed`. Los logs indicaron que Render revisó el commit `8d21845b5843b0e8756aff966f5626b8b06b49a2` en `main`, anterior al merge del Dockerfile, y falló con:

```text
error: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory
error: exit status 1
```

La URL pública no respondió durante las comprobaciones. Se publicó un commit de documentación (`4e8de269`) y luego el commit del fallo controlado (`ab342588`) en `main`. Aunque el servicio aparece vinculado y con `autoDeploy=yes`, Render siguió devolviendo solo el despliegue inicial, sin crear un despliegue para ninguno de esos commits. Se esperó más de 60 segundos tras el commit del fallo y se volvió a consultar la lista. La URL del dashboard compartida para ese despliegue redirigió a la pantalla de inicio de sesión; la API de solo lectura volvió a listar únicamente `dep-dc45ucnlk1mc739nlvgg`, commit `8d21845`.

## Fallo controlado `RUN npm run no-existe`

El cambio temporal se publicó en `main` como `ab342588`, insertando `RUN npm run no-existe` en la línea 7. La construcción local reprodujo el error exacto:

```text
npm error Missing script: "no-existe"
Dockerfile:7
ERROR: process "/bin/sh -c npm run no-existe" did not complete successfully: exit code: 1
```

**Límite de evidencia de Render:** no se generó un despliegue de ese commit. Por tanto, no existen logs de Render para `RUN npm run no-existe` en esta sesión; los únicos logs visibles corresponden al fallo previo de `Dockerfile: no such file or directory`. No se atribuye el error local a Render.

La instrucción fallida se eliminó. La imagen de producción se volvió a construir localmente con éxito y la suite pasó: 9 pruebas aprobadas, 0 fallidas. La reparación ya está publicada en `main` como `d19255a`; la recuperación de la URL pública queda sin verificar porque Render aún no muestra un despliegue de ese commit.

## Bitácora de actividades

| Fecha | Actividad | Resultado / evidencia |
| --- | --- | --- |
| 26 nov 2026 | Revisión de Docker y de la aplicación | Dockerfile de producción, `.dockerignore`, listener `0.0.0.0` y puerto configurable integrados en [PR #23](https://github.com/jimesssss/mini-inventario/pull/23). |
| 26 nov 2026 | Pruebas locales | Imagen construida; contenedor temporal respondió 200 en `/api/salud`; suite del proyecto: 9/9. |
| 26 nov 2026 | Consulta inicial a Render | MCP oficial consultado en el workspace confirmado; se identificó el servicio, la URL y un despliegue fallido por ausencia del Dockerfile en el commit previo. |
| 26 nov 2026 | Push inicial de evidencia | `4e8de269` se publicó en `main`; no apareció un despliegue nuevo en Render. |
| 26 nov 2026 | Prueba controlada | `ab342588` se publicó con `RUN npm run no-existe`; la compilación local falló exactamente en `Dockerfile:7` por script inexistente. Tras esperar más de 60 segundos, Render seguía mostrando solo el despliegue inicial, sin logs del commit. |
| 26 nov 2026 | Reparación y validación local | Se eliminó la línea deliberada; Docker volvió a construir la imagen y la suite pasó 9/9. `d19255a` se publicó en `main`, pero Render aún no muestra un despliegue nuevo y la recuperación pública sigue sin verificar. |

### Prompts y decisiones

- **Prompt clave:** completar el Día 9 con Docker, servicio Render, despliegue fallido controlado, diagnóstico por logs y reparación.
- **Decisión/error de la IA:** la primera consulta de servicios omitió `workspaceId` y MCP la rechazó; se pidió confirmación del workspace antes de reintentar. Además, el primer `docker build` se lanzó desde la raíz del workspace padre y falló porque allí no hay `Dockerfile`; se detectó por `open Dockerfile: no such file or directory` y se corrigió usando `mini-inventario-target` como contexto.
- **Comando aprobado:** `docker build -t mini-inventario .` y la ejecución de un contenedor local temporal; se verificó `/api/salud` y se eliminó el contenedor. El comando `RUN npm run no-existe` se limitó a la prueba deliberada solicitada y se retiró inmediatamente tras registrar el error.
- **Verificación del resultado:** suite (9/9), compilación de imagen reparada, rama y commits confirmados en GitHub; MCP confirmó el despliegue inicial fallido y que no hubo despliegue nuevo después de los pushes. La comprobación HTTP pública agotó el tiempo de espera, por lo que la restauración en Render no se declara completada.
