// ---------------------------------------
// DATOS
// ---------------------------------------
const personajes = [
  "Calabaza", "Maestro Gatuno", "Molly", "Nui", "Parfait", "Peter", "Rapunzel",
  "Ravi", "Wukong", "Zepeta", "Alí", "Caperucita", "Kurenai", "Lobo Feroz", "Nieves",
  "Aoi", "Brick", "Ceni", "Don Quijote", "Kaiser", "Maya", "Timun", "Yong Yong",
  "Fulgor", "Garfio", "Gumi", "Ovinus", "Robin", "Alicia", "Octavia", "Reina Bruja",
  "Ricitos", "Lauren y Vex", "Patita y Cisne", "Victor", "Hamelin", "Pinocho",
  "Briar", "Woochi", "Narsha", "Marina", "Javert", "Proc", "Sra Lettuce", "Tyrfing", "Hatter"
];

let resultado1 = null;
let resultado2 = null;

// PRELOAD IMAGENES
personajes.forEach(nombre => {
  const img = new Image();
  img.src = `./img/${nombre}.png`;
});

// ---------------------------------------
// CANVAS: dibujar ruleta
// ---------------------------------------
const canvas = document.getElementById('ruleta');
const ctx = canvas.getContext('2d');
const radius = canvas.width / 2;

function dibujarRuleta() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const anguloPorSector = (2 * Math.PI) / personajes.length;
  for (let i = 0; i < personajes.length; i++) {
    const inicio = i * anguloPorSector;
    const fin = inicio + anguloPorSector;
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, inicio, fin);
    ctx.fillStyle = i % 2 === 0 ? '#04a0faff' : '#d5d1e4ff';
    ctx.fill();

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(inicio + anguloPorSector / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'black';
    ctx.font = '15px Arial';
    ctx.fillText(personajes[i], radius - 6, 5);
    ctx.restore();
  }
}

dibujarRuleta();

// ---------------------------------------
// Giro suave por 5 segundos
// ---------------------------------------
const btnGirar = document.getElementById('girarBtn');
const slotIzq = document.getElementById('slotIzq');
const slotDer = document.getElementById('slotDer');
let spinning = false;

btnGirar.addEventListener('click', iniciarGiro);

function iniciarGiro() {
  if (spinning) return;
  spinning = true;
  btnGirar.style.display = 'none';

  const intervalSlots = setInterval(() => {
    slotIzq.innerHTML = `<img src="./img/${aleatorioPersonaje()}.png" style="width:100%;height:100%;object-fit:contain">`;
    slotDer.innerHTML = `<img src="./img/${aleatorioPersonaje()}.png" style="width:100%;height:100%;object-fit:contain">`;
  }, 70);

  const duracion = 5000;
  const inicio = performance.now();
  const vueltas = Math.random() * 3 + 6;
  const anguloObjetivo = vueltas * 2 * Math.PI + Math.random() * 2 * Math.PI;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function frame(now) {
    const t = Math.min(1, (now - inicio) / duracion);
    const eased = easeOutCubic(t);
    const anguloActual = anguloObjetivo * eased;

    canvas.style.transform = `rotate(${anguloActual}rad) translateZ(0)`;

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      clearInterval(intervalSlots);

      resultado1 = aleatorioPersonaje();
      resultado2 = aleatorioPersonaje();

      slotIzq.innerHTML = `<img src="./img/${resultado1}.png" alt="${resultado1}" style="width:100%;height:100%;object-fit:contain">`;
      slotDer.innerHTML = `<img src="./img/${resultado2}.png" alt="${resultado2}" style="width:100%;height:100%;object-fit:contain">`;

      const finalAng = anguloObjetivo % (2 * Math.PI);
      canvas.style.transform = `rotate(${finalAng}rad)`;

      showBattleOverlay();

      spinning = false;
    }
  }
  requestAnimationFrame(frame);
}

function aleatorioPersonaje() {
  return personajes[Math.floor(Math.random() * personajes.length)];
}

// ---------------------------------------
// OVERLAY DE BATALLA
// ---------------------------------------
const overlay = document.getElementById('overlayBatalla');
const textoBatalla = document.getElementById('textoBatalla');
const personajesBatalla = document.getElementById('personajesBatalla');
const victoriaBtn = document.getElementById('victoriaBtn');
const derrotaBtn = document.getElementById('derrotaBtn');

function showBattleOverlay() {
  textoBatalla.textContent = 'Hora de la batalla';
  personajesBatalla.innerHTML = '';

  const cont = document.createElement('div');
  cont.style.display = 'flex';
  cont.style.flexDirection = 'row';
  cont.style.gap = '20px';
  cont.style.alignItems = 'center';

  [resultado1, resultado2].forEach(nombre => {
    const c = document.createElement('div');
    c.className = 'personaje';
    const img = document.createElement('img');
    img.src = `./img/${nombre}.png`;
    img.alt = nombre;
    img.style.width = '200px';
    img.style.height = '200px';
    const label = document.createElement('span');
    label.textContent = nombre;
    c.appendChild(img);
    c.appendChild(label);
    cont.appendChild(c);
  });

  personajesBatalla.appendChild(cont);

  overlay.style.display = 'flex';
}

victoriaBtn.addEventListener('click', () => guardarResultado(true));
derrotaBtn.addEventListener('click', () => guardarResultado(false));

function guardarResultado(gano) {
  const duo = [resultado1, resultado2].slice().sort();
  const entrada = { duo, gano: !!gano, fecha: new Date().toISOString() };
  agregarHistorial(entrada);

  overlay.style.display = 'none';
  slotIzq.innerHTML = '';
  slotDer.innerHTML = '';
  btnGirar.style.display = 'inline-block';
}

// ---------------------------------------
// ESTADÍSTICAS
// ---------------------------------------
const verEstBtn = document.getElementById('verEstadisticasBtn');
const verRuletaBtn = document.getElementById('verRuletaBtn');
const panel = document.getElementById('panelEstadisticas');
const cerrarPanelBtn = document.getElementById('cerrarPanel');
const customSelectBtn = document.getElementById('customSelectBtn');
const customSelectList = document.getElementById('customSelectList');
const contenidoEst = document.getElementById('contenidoEstadisticas');

verEstBtn.addEventListener('click', () => {
  panel.classList.add('visible');
  panel.setAttribute('aria-hidden', 'false');
  construirFiltro();
  cargarEstadisticas();
});

cerrarPanelBtn.addEventListener('click', () => {
  panel.classList.remove('visible');
  panel.setAttribute('aria-hidden', 'true');
  contenidoEst.innerHTML = '';
});

verRuletaBtn.addEventListener('click', () => {
  panel.classList.remove('visible');
  panel.setAttribute('aria-hidden', 'true');
});

// construir filtro
function construirFiltro() {
  customSelectList.innerHTML = '';

  const allItem = document.createElement('div');
  allItem.className = 'custom-select-item';
  allItem.textContent = 'Todos';
  allItem.addEventListener('click', () => {
    customSelectBtn.textContent = 'Todos ▾';
    customSelectList.style.display = 'none';
    cargarEstadisticas('Todos');
  });
  customSelectList.appendChild(allItem);

  personajes.slice().sort((a, b) => a.localeCompare(b, 'es')).forEach(nombre => {
    const item = document.createElement('div');
    item.className = 'custom-select-item';
    const img = document.createElement('img');
    img.src = `./img/${nombre}.png`;
    img.alt = nombre;
    const span = document.createElement('span');
    span.textContent = nombre;
    item.appendChild(img);
    item.appendChild(span);
    item.addEventListener('click', () => {
      customSelectBtn.textContent = nombre + ' ▾';
      customSelectList.style.display = 'none';
      cargarEstadisticas(nombre);
    });
    customSelectList.appendChild(item);
  });

  customSelectBtn.onclick = () =>
    customSelectList.style.display =
      customSelectList.style.display === 'block' ? 'none' : 'block';

  document.addEventListener('click', function (e) {
    if (!document.getElementById('customSelect').contains(e.target))
      customSelectList.style.display = 'none';
  });
}

function cargarEstadisticas(filtro = 'Todos') {
  const datos = obtenerHistorial();
  procesarEstadisticas(datos, filtro);
}

function procesarEstadisticas(datos, filtro) {
  const resumen = {};
  datos.forEach(d => {
    const clave = d.duo.slice().sort().join(' - ');
    if (!resumen[clave]) resumen[clave] = { g: 0, p: 0 };
    d.gano ? resumen[clave].g++ : resumen[clave].p++;
  });

  const arr = Object.keys(resumen).map(k => {
    const g = resumen[k].g;
    const p = resumen[k].p;
    const total = g + p;
    const coef = total === 0 ? 0 : (g / total);
    return { duo: k, ganadas: g, perdidas: p, total, coef };
  });

  const porCoef = arr.slice().sort((a, b) =>
    b.coef - a.coef || b.total - a.total || a.duo.localeCompare(b.duo, 'es')
  );
  const top10 = porCoef.slice(0, 10);

  const totales = datos.reduce(
    (acc, d) => {
      acc.total++;
      d.gano ? acc.ganadas++ : acc.perdidas++;
      return acc;
    },
    { total: 0, ganadas: 0, perdidas: 0 }
  );

  const duoMasGanador = porCoef[0] || null;
  const duoMasPerdedor = porCoef.slice().reverse()[0] || null;

  let mostrados = arr;
  if (filtro && filtro !== 'Todos') {
    mostrados = arr.filter(r => r.duo.split(' - ').includes(filtro));
  }

  if (filtro === 'Todos')
    mostrados.sort((a, b) =>
      b.coef - a.coef || b.total - a.total || a.duo.localeCompare(b.duo, 'es')
    );
  else mostrados.sort((a, b) => a.duo.localeCompare(b.duo, 'es'));

  let html = '';
  html += `<p class="resumen-global" style="margin-top:50px">Batallas totales: <strong>${totales.total}</strong> — Ganadas: <strong>${totales.ganadas}</strong> — Perdidas: <strong>${totales.perdidas}</strong></p>`;

  html += `<table class="tabla-estad"><thead><tr><th style="width:40%">Duo</th><th>Ganadas</th><th>Perdidas</th><th>Total</th><th>Coef.</th></tr></thead><tbody>`;

  mostrados.forEach(r => {
    const partes = r.duo.split(' - ');
    const duoHtml =
      `<div class="duo-inline">` +
      partes.map(p =>
        `<img src="./img/${p}.png" alt="${p}"><span>${p}</span>`
      ).join('<span> vs </span>') +
      `</div>`;

    html += `<tr><td class="duo-cell">${duoHtml}</td><td>${r.ganadas}</td><td>${r.perdidas}</td><td>${r.total}</td><td>${r.coef.toFixed(
      2
    )}</td></tr>`;
  });
  html += `</tbody></table>`;

  html += `<div class="resumen-global">`;
  if (duoMasGanador)
    html += `<div class="duo-highlight"><img src="./img/${duoMasGanador.duo.split(' - ')[0]}.png"><p>Duo más ganador: ${duoMasGanador.duo} — Coef: ${duoMasGanador.coef.toFixed(
      2
    )}</p></div>`;
  if (duoMasPerdedor)
    html += `<div class="duo-highlight"><img src="./img/${duoMasPerdedor.duo.split(' - ')[0]}.png"><p>Duo más perdedor: ${duoMasPerdedor.duo} — Coef: ${duoMasPerdedor.coef.toFixed(
      2
    )}</p></div>`;
  html += `</div>`;

  if (top10.length) {
    html += `<div style="display:flex;justify-content:center;margin:10px 0;">
              <div class="top10-badge" style="margin-top:30px">★ Top 10</div>
            </div>`;

    html += `<table class="tabla-estad">
              <thead>
                <tr>
                  <th>Duo</th>
                  <th>Ganadas</th>
                  <th>Perdidas</th>
                  <th>Total</th>
                  <th>Coef.</th>
                </tr>
              </thead>
              <tbody>`;

    top10.forEach(t => {
      const partes = t.duo.split(' - ');
      const duoHtml =
        `<div class="duo-inline">` +
        partes.map(p =>
          `<img src="./img/${p}.png" alt="${p}"><span>${p}</span>`
        ).join('<span> vs </span>') +
        `</div>`;

      html += `<tr>
                <td class="duo-cell">${duoHtml}</td>
                <td>${t.ganadas}</td>
                <td>${t.perdidas}</td>
                <td>${t.total}</td>
                <td>${t.coef.toFixed(2)}</td>
              </tr>`;
    });

    html += `</tbody></table>`;
  }

  contenidoEst.innerHTML = html;
}

// ---------------------------------------
// MENÚ DESPLEGABLE (INTEGRADO AL FINAL)
// ---------------------------------------
const menuBtn = document.getElementById("menuEstadisticasBtn");
const menuPanel = document.getElementById("menuPanel");

if (!menuBtn || !menuPanel) {
    console.warn("⚠ No se encontró el menú o el botón.");
} else {
    menuBtn.addEventListener("click", () => {
        const abierto = menuPanel.classList.toggle("show");
        menuPanel.setAttribute("aria-hidden", !abierto);
        console.log("✔ Menú toggle:", abierto);
    });
}