# Aislamiento en la interfaz con Supabase real

Resultado manual confirmado por la usuaria. La cuenta A vio su producto Mouse Logitech, SKU `0001`. La cuenta B, desde otra sesión, no vio ese producto.

La prueba pasó por Express, que también filtra por propietario. La comparación directa de la misma fila en la Data API sigue pendiente porque las dos sesiones no estuvieron disponibles para esta revisión.

Los escenarios GET, PATCH y DELETE entre dos usuarios simulados están documentados en [la salida de npm test](05-aislamiento-simulado.txt). En esta revisión no se realizaron escrituras remotas.
