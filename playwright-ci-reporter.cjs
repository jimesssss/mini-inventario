const { writeFileSync } = require('node:fs');

class ReporteCI {
  constructor() {
    this.pruebas = [];
  }

  printsToStdio() {
    return true;
  }

  onTestEnd(prueba, resultado) {
    this.pruebas.push({
      prueba: prueba.title,
      estado: resultado.status,
      duracionMs: resultado.duration,
    });
  }

  onEnd(resultado) {
    const archivo = process.env.PLAYWRIGHT_SAFE_REPORT;
    if (!archivo) throw new Error('Falta la ruta del reporte de Playwright.');
    // El artefacto excluye errores detallados, stdout, adjuntos y datos de sesión.
    const reporte = { estado: resultado.status, pruebas: this.pruebas };
    writeFileSync(archivo, JSON.stringify(reporte, null, 2) + '\n', 'utf8');
    console.log(`Playwright: ${resultado.status} (${this.pruebas.length} pruebas registradas).`);
  }
}

module.exports = ReporteCI;
