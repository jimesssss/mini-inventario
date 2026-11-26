import os
from pathlib import Path
from typing import Any

import psycopg
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP
from psycopg.rows import dict_row

load_dotenv(Path(__file__).with_name(".env"))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL no está definida en mcp-inventario/.env")

mcp = FastMCP("inventario-lectura")


def _fetch_read_only(
    query: str, parameters: tuple[str, ...] = ()
) -> list[dict[str, Any]]:
    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SET TRANSACTION READ ONLY")
            cursor.execute(query, parameters)
            return [dict(row) for row in cursor.fetchall()]


@mcp.tool()
def buscar_producto(texto: str) -> list[dict[str, Any]]:
    """Busca productos por coincidencia parcial en nombre o SKU (el esquema no tiene categoría)."""
    texto = texto.strip()
    if not texto:
        raise ValueError("El texto de búsqueda no puede estar vacío.")

    patron = f"%{texto}%"
    return _fetch_read_only(
        """
        SELECT nombre, sku, cantidad, minimo
        FROM public.productos
        WHERE nombre ILIKE %s OR sku ILIKE %s
        ORDER BY nombre, sku
        """,
        (patron, patron),
    )


@mcp.tool()
def stock_bajo() -> list[dict[str, Any]]:
    """Devuelve productos cuya cantidad es menor o igual a su mínimo."""
    return _fetch_read_only(
        """
        SELECT nombre, sku, cantidad, minimo
        FROM public.productos
        WHERE cantidad <= minimo
        ORDER BY nombre, sku
        """
    )


if __name__ == "__main__":
    mcp.run()
