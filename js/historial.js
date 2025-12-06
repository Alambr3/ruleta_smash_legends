// HISTORIAL (LocalStorage + importar/exportar)
const HISTORIAL_KEY = 'historial_ruleta_duos_v1';

function obtenerHistorial() {
  const datos = localStorage.getItem(HISTORIAL_KEY);
  return datos ? JSON.parse(datos) : [];
}

function guardarHistorial(datos) {
  localStorage.setItem(HISTORIAL_KEY, JSON.stringify(datos));
}

function agregarHistorial(entrada) {
  const historial = obtenerHistorial();
  historial.push(entrada);
  guardarHistorial(historial);
}

function limpiarHistorial() {
  localStorage.removeItem(HISTORIAL_KEY);
  location.reload();
}

// botones del menú (solo visibles dentro del panel de estadísticas)
document.getElementById("limpiarBtn")?.addEventListener("click", () => {
  if (confirm("¿Seguro querés borrar todo el historial?")) limpiarHistorial();
});

function descargarHistorial() {
  const historial = obtenerHistorial();
  const fecha = new Date();
  const nombreArchivo = `datos_${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}_${String(fecha.getHours()).padStart(2, "0")}-${String(fecha.getMinutes()).padStart(2, "0")}-${String(fecha.getSeconds()).padStart(2, "0")}.json`;

  const blob = new Blob([JSON.stringify(historial, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("descargarBtn")?.addEventListener("click", e => { e.preventDefault(); descargarHistorial(); });

document.getElementById("cargarArchivo")?.addEventListener("change", function (event) {
  const archivo = event.target.files[0]; if (!archivo) return;
  const lector = new FileReader();
  lector.onload = function (e) {
    try {
      const datos = JSON.parse(e.target.result);
      if (!Array.isArray(datos)) return alert("El archivo JSON debe contener un array.");
      guardarHistorial(datos);
      alert("Historial cargado correctamente.");
      location.reload();
    } catch {
      alert("El archivo no es válido.");
    }
  };
  lector.readAsText(archivo);
});