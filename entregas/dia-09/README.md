# Bitácora del Día 9 · Contenedor Docker y despliegue en Render

## Objetivo

Empaquetar `mini-inventario` en una imagen de producción y comprobar el ciclo de despliegue en Render: funcionamiento, fallo de compilación deliberado, diagnóstico y recuperación. El servicio objetivo es el de [`jimesssss/mini-inventario`](https://github.com/jimesssss/mini-inventario), no el ERP que está abierto en el workspace principal.

## Servicio y configuración observada

- Servicio: `mini-inventario` (`srv-dc45ucflk1mc739nlua0`), conectado a la rama `main` del repositorio correcto.
- URL pública: [https://mini-inventario-hbr5.onrender.com](https://mini-inventario-hbr5.onrender.com).
- Comprobación: `GET /api/salud` debe devolver HTTP 200 y `{"estado":"ok"}`. **Estado posterior a la corrección: pendiente de verificar.**
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

La URL pública no respondió durante las comprobaciones iniciales. Se publicará un commit de documentación para que el auto-despliegue de Git use el `Dockerfile` ya integrado en `main`; se verificará el resultado antes de probar el fallo solicitado.

## Fallo controlado `RUN npm run no-existe`

**Pendiente.** Se añadirá temporalmente esa instrucción al `Dockerfile` después de comprobar que la aplicación está estable, se observará el despliegue originado por el push y se anotarán el estado y el error exacto de Render. La reparación eliminará únicamente esa línea y se comprobará la recuperación pública.

## Bitácora de actividades

| Fecha | Actividad | Resultado / evidencia |
| --- | --- | --- |
| 26 nov 2026 | Revisión de Docker y de la aplicación | Dockerfile de producción, `.dockerignore`, listener `0.0.0.0` y puerto configurable integrados en [PR #23](https://github.com/jimesssss/mini-inventario/pull/23). |
| 26 nov 2026 | Pruebas locales | Imagen construida; contenedor temporal respondió 200 en `/api/salud`; suite del proyecto: 9/9. |
| 26 nov 2026 | Consulta inicial a Render | MCP oficial consultado en el workspace confirmado; se identificó el servicio, la URL y un despliegue fallido por ausencia del Dockerfile en el commit previo. |
| 26 nov 2026 | Prueba del fallo, diagnóstico y reparación | Pendiente de realizar y documentar con el resultado real de Render. |

### Prompts y decisiones

- **Prompt clave:** completar el Día 9 con Docker, servicio Render, despliegue fallido controlado, diagnóstico por logs y reparación.
- **Decisión de la IA:** la primera llamada a listar servicios omitió `workspaceId` y el MCP la rechazó; se consultaron los workspaces y se pidió confirmación antes de usar el único espacio disponible. Se continuó únicamente después de la confirmación.
- **Comando aprobado:** `docker build -t mini-inventario .`, seguido de `docker run ...`; se limitó la prueba a un contenedor local temporal y se eliminó al finalizar.
- **Verificación del resultado:** pruebas locales, respuesta HTTP del contenedor, inspección de la rama y commit en GitHub, y consulta de despliegues/logs del servicio mediante herramientas de solo lectura del MCP oficial de Render.
