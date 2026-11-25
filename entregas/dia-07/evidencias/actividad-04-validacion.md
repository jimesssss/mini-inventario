# Actividad 4 · Creación y validación de revisor-pr

Se creó `.codex/agents/revisor-pr.toml` en la rama `dia-07-revisor-pr`. Define los tres campos requeridos: `name`, `description` y `developer_instructions`. Las instrucciones limitan al agente a inspección de solo lectura. [Copia completa](actividad-04-revisor-pr.toml) · [Documentación oficial del formato](https://learn.chatgpt.com/docs/agent-configuration/subagents)

| Incidencia | Resolución |
| --- | --- |
| `git switch -c dia-07-revisor-pr` recibió permiso denegado al crear el bloqueo de la referencia Git. | El mismo comando se ejecutó con el permiso ampliado concedido. Git confirmó `Switched to a new branch 'dia-07-revisor-pr'`. |
| El lanzador `py` no estaba disponible. | Se probó el comando `python` del entorno. |
| El comando `python` apuntaba a un entorno virtual cuyo ejecutable base devolvió acceso denegado. | Se usó el ejecutable de Python 3.12 del runtime de Codex. |
| La primera espera de la revisión agotó su plazo de 30 segundos. | Se volvió a esperar al mismo subagente y se recibió su respuesta final. |

La validación cargó el archivo UTF-8 con `tomllib`, comprobó el conjunto exacto de campos, el nombre `revisor-pr` y que los tres valores fueran cadenas no vacías. El comando terminó con código 0 y registró «TOML válido con los tres campos requeridos». Durante la delegación se usó el identificador `revisor_pr` por la restricción de nombres de la herramienta. El subagente recibió la instrucción de leer y aplicar el TOML del proyecto. [Registro de delegación](actividad-04-delegacion.txt)
