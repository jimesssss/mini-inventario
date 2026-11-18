## Día 1 — Preparación del entorno y repositorio

**Proyecto:** Mini Inventario  
**Fecha:** 11 de noviembre de 2026  
**Repositorio:** https://github.com/jimesssss/mini-inventario

## 1. Objetivo

Preparé el entorno de desarrollo para el proyecto Mini Inventario, configuré Git y GitHub, creé los archivos iniciales del repositorio y utilicé Codex para revisar la configuración.

## 2. Herramientas utilizadas

Durante la actividad se instalaron, configuraron o verificaron las siguientes herramientas:

| Herramienta | Versión |
|---|---|
| PowerShell | 7.7.0 |
| Git | 2.55.0 |
| GitHub CLI | 2.103.2 |
| Node.js | 22.20.0 |
| npm | 10.9.3 |
| Python | 3.12.10 |
| Scoop | 0.6.0 |
| Codex CLI | 0.170.0 |

También se comprobó que la cuenta de GitHub utilizada es `jimesssss`.

## 3. Creación del proyecto

Se creó una carpeta independiente llamada `mini-inventario` en el escritorio.

Dentro de ella se prepararon tres archivos iniciales:

- **README.md:** contiene el objetivo del proyecto, las tecnologías y las instrucciones generales.
- **.gitignore:** evita incluir archivos como `.env`, `node_modules/` y `.venv/`.
- **AGENTS.md:** contiene las instrucciones que debe seguir Codex durante el desarrollo.

El archivo `AGENTS.md` tiene 19 líneas e incluye reglas sobre ramas de Git, pull requests, protección de credenciales y autorización antes de realizar acciones destructivas.

## 4. Configuración de Git y GitHub

Se inicializó el repositorio con la rama principal `main`.

**Comandos utilizados:**

```powershell
git init -b main
git status
git add .gitignore README.md AGENTS.md
git commit -m "Configuracion inicial de Mini Inventario"
```

El primer intento de crear el commit falló porque Git no tenía configurados el nombre y el correo de la autora.

Para resolverlo, se configuró la identidad únicamente dentro de este repositorio.

Después se repitió el commit y se creó correctamente con el identificador:

`b5789c4`

Posteriormente, se publicó el repositorio en GitHub mediante:

```powershell
gh repo create mini-inventario --public --source=. --remote=origin --push
```

El repositorio se creó correctamente y se subió la rama `main`.

## 5. Verificación mediante clonación

Para comprobar que el repositorio podía descargarse correctamente, se clonó en otra carpeta del escritorio.

```powershell
gh repo clone jimesssss/mini-inventario "$HOME\Desktop\prueba-inventario"
```

Después se ejecutaron los siguientes comandos:

```powershell
git -C "$HOME\Desktop\prueba-inventario" ls-files
Get-Content "$HOME\Desktop\prueba-inventario\README.md"
```

Se confirmó que la copia descargada contenía los archivos `.gitignore`, `AGENTS.md` y `README.md`.

También se revisó el contenido del README y se comprobó que correspondía al proyecto original.

## 6. Uso de Codex

Se instaló Codex mediante npm y se verificó su versión:

```powershell
npm install -g @openai/codex
codex --version
```

El resultado fue `codex-cli 0.170.0`.

Posteriormente, se abrió Codex dentro de la carpeta `mini-inventario` y se autorizó el acceso al repositorio.

### Primer prompt utilizado

> Revisa los archivos README.md, AGENTS.md y .gitignore del proyecto Mini Inventario.
>
> Comprueba si la configuración inicial es adecuada para trabajar con Node.js 22, Python 3.12, Git y GitHub.
>
> Identifica posibles errores, riesgos o mejoras y explícame tus recomendaciones de forma clara.
>
> No modifiques archivos, no instales dependencias y no ejecutes comandos que cambien el proyecto. Solicita mi autorización antes de realizar cualquier cambio.

### Resultado

Codex revisó los archivos y consideró que la configuración inicial era adecuada para el Día 1.

Recomendó mejorar las instrucciones de instalación del README, revisar la protección de la rama `main` y evitar incluir credenciales en las capturas de pantalla.

También indicó que no podía verificar correctamente Node.js y Python dentro de su sesión.

Codex confirmó que no modificó archivos.

### Segundo prompt utilizado

> En la revisión anterior indicaste que Node.js 22 está instalado, pero no activo. Comprueba nuevamente el estado de NVM y dime qué comando exacto debo ejecutar para activar Node.js 22.20.0 en esta sesión de Windows.
>
> No ejecutes cambios todavía. Solo explica el diagnóstico y el comando recomendado.

### Resultado

Codex recomendó ejecutar:

```powershell
nvm use 22.20.0
```

Antes de aceptar la recomendación, verifiqué Node.js directamente en PowerShell:

```powershell
node --version
```

El resultado fue `v22.20.0`.

Por lo tanto, decidí no ejecutar nuevamente el comando de activación, ya que Node.js funcionaba correctamente en la terminal principal.

## 7. Problemas encontrados y soluciones

| Problema | Solución o decisión |
|---|---|
| npm presentó anteriormente un error relacionado con NVM. | Se instaló y activó Node.js 22.20.0 y se comprobó que npm funcionaba. |
| Git mostró advertencias LF/CRLF. | Se revisó su significado y se continuó porque eran advertencias sobre saltos de línea, no errores. |
| Git no permitió crear el primer commit. | Se configuraron el nombre y el correo privado de GitHub. |
| PowerShell no reconocía el comando `codex`. | Se instaló Codex con npm y se verificó su versión. |
| Codex indicó que Node.js no estaba activo. | Se comprobó en PowerShell que Node.js 22.20.0 sí funcionaba. |

## 8. Decisiones sobre las recomendaciones de IA

**Decisión aceptada:** utilizar Codex para revisar los archivos iniciales y detectar posibles mejoras, sin permitir modificaciones automáticas.

**Decisión no aplicada:** ejecutar nuevamente `nvm use 22.20.0` sin comprobar primero el entorno. La verificación mostró que Node.js ya estaba activo en PowerShell.

**Aspectos pendientes:** ampliar las instrucciones del README y revisar la configuración de protección de la rama `main`.

Durante esta actividad aprendí que las respuestas de la IA deben verificarse antes de ejecutar comandos o modificar archivos.

## 9. Evidencias

Las capturas de pantalla de la actividad se guardaron en la carpeta `entregas/dia-01/capturas`, después de revisar que no contuvieran información privada.

**Evidencias recopiladas:**

- Verificación de las herramientas instaladas.
- Archivos iniciales del proyecto y primer commit.
- Creación y publicación del repositorio en GitHub.
- Clonación y verificación de los archivos.
- Instalación y versión de Codex.
- Primera revisión de archivos realizada por Codex.
- Recomendaciones de Codex y comprobación de Node.js en PowerShell.

## 10. Conclusión

Durante el Día 1 se preparó el entorno de desarrollo, se creó y publicó el repositorio de Mini Inventario y se comprobó su funcionamiento mediante una clonación.

También se utilizó Codex para revisar la configuración inicial y se verificaron sus recomendaciones antes de realizar cambios.

El repositorio quedó preparado para continuar con la planificación y el desarrollo de la aplicación en los siguientes días.
