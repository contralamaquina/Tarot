let tarotData = null;
let activeCards = [];

// 1. Cargar la base de datos completa desde cards.json
async function initApp() {
  try {
    const res = await fetch('./cards.json');
    tarotData = await res.json();
    renderSelectorList();
    setupEventListeners();
  } catch (err) {
    console.error("Error al cargar cards.json:", err);
  }
}

// 2. Poblar la barra lateral con la lista de cartas
function renderSelectorList(filter = '') {
  const container = document.getElementById('card-selector-list');
  container.innerHTML = '';

  if (!tarotData) return;

  const allCards = [
    ...tarotData.arcanos_mayores,
    ...Object.values(tarotData.arcanos_menores).flatMap(palo => palo.cartas)
  ];

  allCards
    .filter(c => c.nombre.toLowerCase().includes(filter.toLowerCase()))
    .forEach(card => {
      const item = document.createElement('div');
      item.className = 'selector-item';
      item.innerText = card.nombre;
      item.onclick = () => spawnCardOnBoard(card);
      container.appendChild(item);
    });
}

// 3. Crear e instanciar la carta dentro del lienzo interactivo
function spawnCardOnBoard(cardData) {
  const canvas = document.getElementById('board-canvas');
  
  const cardEl = document.createElement('div');
  cardEl.className = 'tarot-card-hud';
  
  // Posicionamiento en cascada para no solaparse
  const offset = (activeCards.length % 10) * 25;
  cardEl.style.left = `${80 + offset}px`;
  cardEl.style.top = `${80 + offset}px`;
  
  // Imagen directa desde la web con sistema de respaldo automático
  const imgUrl = cardData.imagen || `https://dummyimage.com/120x180/0a0f19/00f3ff.png&text=${encodeURIComponent(cardData.nombre)}`;

  cardEl.innerHTML = `
    <div class="card-title">${cardData.nombre}</div>
    <div class="card-image-container">
      <img src="${imgUrl}" 
           alt="${cardData.nombre}" 
           class="card-img" 
           onerror="this.onerror=null; this.src='https://dummyimage.com/120x180/0a0f19/00f3ff.png&text=Tarot+HUD';" />
    </div>
  `;

  // Habilitar la función de arrastrar
  makeDraggable(cardEl);

  // Evento al presionar para abrir el panel Inspector
  cardEl.onclick = (e) => {
    e.stopPropagation();
    openInspector(cardData);
  };

  canvas.appendChild(cardEl);
  activeCards.push({ element: cardEl, data: cardData });
}

// 4. Sistema de Arrastre Libre (Drag and Drop)
function makeDraggable(el) {
  let posX = 0, posY = 0, mouseX = 0, mouseY = 0;

  el.onmousedown = (e) => {
    e.preventDefault();
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Colocar la carta arrastrada por encima de las demás
    document.querySelectorAll('.tarot-card-hud').forEach(card => card.style.zIndex = "1");
    el.style.zIndex = "10";

    document.onmousemove = (e) => {
      posX = mouseX - e.clientX;
      posY = mouseY - e.clientY;
      mouseX = e.clientX;
      mouseY = e.clientY;

      el.style.top = `${el.offsetTop - posY}px`;
      el.style.left = `${el.offsetLeft - posX}px`;
    };

    document.onmouseup = () => {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
}

// 5. Cargar los datos del elemento seleccionado en el panel Inspector
function openInspector(data) {
  const inspector = document.getElementById('hud-inspector');

  inspector.innerHTML = `
    <div class="hud-header">
      <h3>${data.nombre}</h3>
      <small>ID: ${data.id}</small>
    </div>
    <div class="hud-body">
      ${data.mirada ? `<p><strong>Dirección de Mirada:</strong> ${data.mirada}</p>` : ''}
      ${data.eje_optico ? `<p><strong>Eje Óptico:</strong> ${data.eje_optico}</p>` : ''}
      ${data.sintaxis_espacial ? `<p><strong>Sintaxis Espacial:</strong> ${data.sintaxis_espacial}</p>` : ''}
      
      <h4>Simbología Principal</h4>
      <ul>
        ${Object.entries(data.simbologia || {}).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('')}
      </ul>

      ${data.significados ? `
        <h4>Interpretación Analítica</h4>
        <p><strong>Clave:</strong> ${data.significados.clave}</p>
        <p><strong>Psicológico:</strong> ${data.significados.psicologico}</p>
        <p><strong>Esotérico:</strong> ${data.significados.esoterico}</p>
      ` : ''}
    </div>
  `;
}

// 6. Configurar eventos generales del teclado y botones
function setupEventListeners() {
  document.getElementById('card-search').addEventListener('input', (e) => {
    renderSelectorList(e.target.value);
  });

  document.getElementById('btn-clear-board').onclick = () => {
    document.getElementById('board-canvas').innerHTML = '';
    activeCards = [];
    document.getElementById('hud-inspector').innerHTML = `
      <div class="hud-placeholder">
        <p>// SELECCIONA UNA CARTA EN LA MESA PARA INSPECCIONAR SUS VECTORES Y SIMBOLOGÍA</p>
      </div>
    `;
  };
}

document.addEventListener('DOMContentLoaded', initApp);