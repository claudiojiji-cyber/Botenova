// =============== EnovaBot v3.0 (capacitador humano + modal técnico) ===============
let productos = [];

// DOM
const chatBox   = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn   = document.getElementById('send-btn');
const clearBtn  = document.getElementById('clear-chat');
const btnMenu   = document.getElementById('btn-menu');

// Modal
const modalOverlay = document.getElementById('modal-overlay');
const modalClose   = document.getElementById('modal-close');
const modalContent = document.getElementById('modal-content');

// ====== Carga JSON principal (extendido con mensajes y ficha) ======
fetch('productos.json')
  .then(res => res.json())
  .then(data => { productos = data; })
  .catch(err => {
    console.error('Error cargando productos:', err);
    appendBotMessage('Error cargando catálogo. Asegurate que <code>productos.json</code> esté en la misma carpeta.');
  });

// ====== scrool resultados ======
function scrollBottom() {
  // Si hay muchos elementos en el chat, no bajamos del todo
  const totalMensajes = chatBox.querySelectorAll('.bot-message, .user-message, .product-card').length;

  if (totalMensajes <= 6) {
    // Si hay pocos mensajes, baja al final
    chatBox.scrollTop = chatBox.scrollHeight;
  } else {
    // Si hay muchos (ej. 10 TV o más), se queda arriba
    chatBox.scrollTop = 0;
  }
}


function appendUserMessage(text){
  const div = document.createElement('div');
  div.className = 'user-message';
  div.textContent = text;
  chatBox.appendChild(div);
  scrollBottom();
}

function appendBotMessage(html){
  const div = document.createElement('div');
  div.className = 'bot-message';
  div.innerHTML = html;
  chatBox.appendChild(div);
  scrollBottom();
}

function escapeHtml(unsafe=''){
  return String(unsafe)
    .replaceAll('&', "&amp;")
    .replaceAll('<', "&lt;")
    .replaceAll('>', "&gt;");
}

// ====== Pitch comercial (si no hay mensaje_vendedor en JSON, generamos por categoría) ======
function buildSalesPitch(prod){
  if (prod.mensaje_vendedor) return prod.mensaje_vendedor;

  const cat = (prod.categoria || '').toLowerCase();
  if (cat === 'lavarropas') {
    const cap = prod.capacidad_lavado_kg ? `${prod.capacidad_lavado_kg} kg` : '';
    return `Este lavarropas ${cap} es ideal para familias chicas: ahorra energía, cuida la ropa y ocupa poco espacio.`;
  }
  if (cat === 'heladera') {
    const nf = /no\s*frost/i.test(prod.tecnologia||'') ? 'No Frost' : '';
    const inv = /inverter/i.test(prod.motor||'') ? 'inverter' : '';
    return `Con esta heladera ${nf} ${inv ? 'inverter ' : ''}te olvidás de la escarcha y ganás ahorro energético con menos ruido.`;
  }
  if (cat === 'tv') {
    return `No es solo una TV: es Google TV, con control por voz y todas las apps. Fabricación nacional con soporte cercano.`;
  }
  if (cat === 'aire') {
    return prod.tecnologia_inverter ? `Inverter R32 para confort estable y ahorro real todo el día.` :
                                      `ON/OFF potente para climatizar rápido ambientes chicos a medianos.`;
  }
  if (cat === 'celular') {
    return `Fluidez y espacio para el día a día: cámara nítida y batería que acompaña tu rutina.`;
  }
  if (cat === 'microondas') {
    return `Simplicidad que rinde: perillas mecánicas, 20L y potencia para calentar y descongelar sin vueltas.`;
  }
  if (cat === 'notebook') {
    return `Lista para usar: Windows 11, batería para el día y peso liviano para estudiar y trabajar.`;
  }
  return prod.descripcion || 'Producto Enova con excelente relación precio/valor.';
}

// ====== Texto de features cortos (mini resumen en tarjeta) ======
function buildMiniFeatures(prod){
  const feats = [];

  // Campos comunes por categoría
  if (prod.categoria === 'TV') {
    if (prod.pulgadas) feats.push(prod.pulgadas);
    if (prod.resolucion) feats.push(prod.resolucion);
    if (prod.sistema_operativo) feats.push(prod.sistema_operativo);
    if (prod.hdr) feats.push(prod.hdr);
  }
  if (prod.categoria === 'Heladera') {
    if (prod.capacidad) feats.push(prod.capacidad);
    if (prod.tecnologia) feats.push(prod.tecnologia);
    if (prod.eficiencia) feats.push(`Efic.: ${prod.eficiencia}`);
    if (prod.motor) feats.push(prod.motor);
  }
  if (prod.categoria === 'Lavarropas' || prod.categoria === 'Lavasecarropas') {
    if (prod.tipo_carga) feats.push(prod.tipo_carga);
    if (prod.capacidad_lavado_kg) feats.push(`${prod.capacidad_lavado_kg} kg`);
    if (prod.velocidad_centrifugado_rpm) feats.push(`${prod.velocidad_centrifugado_rpm} RPM`);
    if (prod.tecnologia_inverter) feats.push('Inverter');
  }
  if (prod.categoria === 'Notebook') {
    if (prod.pulgadas) feats.push(prod.pulgadas);
    if (prod.procesador) feats.push(prod.procesador.split('(')[0].trim());
    if (prod.ram) feats.push(`RAM: ${prod.ram}`);
    if (prod.almacenamiento) feats.push(prod.almacenamiento);
  }
  if (prod.categoria === 'Aire') {
    if (prod.tecnologia_inverter) feats.push('Inverter');
    if (prod.frigorias) feats.push(`${prod.frigorias} fg`);
    if (prod.gas_refrigerante) feats.push(prod.gas_refrigerante);
    if (prod.eficiencia_refrigeracion) feats.push(`EE Frío: ${prod.eficiencia_refrigeracion}`);
  }
  if (prod.categoria === 'Celular') {
    if (prod.pantalla_pulgadas) feats.push(`${prod.pantalla_pulgadas}"`);
    if (prod.almacenamiento) feats.push(prod.almacenamiento);
    if (prod.ram) feats.push(`RAM ${prod.ram}`);
    if (prod.camaras) feats.push(prod.camaras.split(';')[0]);
  }
  if (prod.categoria === 'Microondas') {
    if (prod.capacidad_l) feats.push(`${prod.capacidad_l} L`);
    if (prod.potencia_w) feats.push(`${prod.potencia_w} W`);
    if (prod.control) feats.push(prod.control);
  }

  return feats.filter(Boolean).join(' • ') ||
         (prod.descripcion ? prod.descripcion.slice(0,110)+'…' : 'Ver detalles del producto');
}

// ====== Render de tarjeta de producto ======
function renderProductCard(prod){
  const thumb = prod.image || `img/${(prod.sku || prod.nombre || 'noimg').replaceAll(' ','_')}.jpg`;
  const card = document.createElement('div');
  card.className = 'product-card';

  const thumbDiv = document.createElement('div');
  thumbDiv.className = 'product-thumb';
  const img = document.createElement('img');
  img.src = thumb;
  img.alt = prod.nombre || prod.nombre_comercial || prod.sku || 'Producto';
  img.onerror = () => { img.style.display = 'none'; thumbDiv.textContent = (prod.nombre || prod.sku || 'Imagen'); };
  thumbDiv.appendChild(img);

  const info = document.createElement('div');
  info.className = 'product-info';

  const title = document.createElement('strong');
  // Mostrar nombre correcto (no "Lavado Enova" genérico)
  title.textContent = prod.nombre || prod.nombre_comercial || prod.sku;

  const pitch = document.createElement('div');
  pitch.className = 'features';
  pitch.textContent = buildSalesPitch(prod);

  const feats = document.createElement('div');
  feats.className = 'features';
  feats.textContent = buildMiniFeatures(prod);

  const actions = document.createElement('div');
  actions.className = 'product-actions';

  // Botón: Ver más características (abre modal)
  const btnVer = document.createElement('button');
  btnVer.className = 'btn-small';
  btnVer.textContent = 'Ver más características';
  btnVer.addEventListener('click', () => openModalWithProduct(prod));

  // Botón: ex boton  SKU (texto en chat)
actions.appendChild(btnVer);


  info.appendChild(title);
  info.appendChild(pitch);       // Mensaje vendedor humano
  info.appendChild(feats);       // Mini features
  info.appendChild(actions);

  card.appendChild(thumbDiv);
  card.appendChild(info);

  return card;
}

// ====== Modal: contenido técnico + beneficios ======
function openModalWithProduct(prod){
  const imgSrc = prod.image || `img/${(prod.sku || prod.nombre || 'noimg').replaceAll(' ','_')}.jpg`;
  const beneficios = prod.beneficios_clave && prod.beneficios_clave.length
    ? prod.beneficios_clave.map(b => `<li>${escapeHtml(b)}</li>`).join('')
    : '';

  // Ficha técnica en grilla (si existe)
  let fichaHTML = '';
  if (prod.ficha_tecnica) {
    fichaHTML += '<div class="modal-section"><h4>Ficha técnica</h4><div class="kv">';
    Object.entries(prod.ficha_tecnica).forEach(([k,v])=>{
      fichaHTML += `<div class="k">${escapeHtml(k)}</div><div class="v">${escapeHtml(v)}</div>`;
    });
    fichaHTML += '</div></div>';
  }

  // Botón compartir (simple: copia nombre + sku al portapapeles)
  const shareBtn = `<button class="btn-ghost" id="btn-share">Compartir</button>`;

  modalContent.innerHTML = `
    <div class="modal-header">
      <img src="${imgSrc}" alt="${escapeHtml(prod.nombre || prod.sku || 'Producto')}" onerror="this.style.display='none'">
      <div>
        <h3 class="modal-title">${escapeHtml(prod.nombre || prod.nombre_comercial || prod.sku)}</h3>
        <div class="badge">${escapeHtml(prod.categoria || 'Producto Enova')}</div>
      </div>
    </div>

    <div class="modal-section">
      <h4>¿Por qué elegirlo?</h4>
      <div>${escapeHtml(buildSalesPitch(prod))}</div>
    </div>

    ${beneficios ? `<div class="modal-section"><h4>Beneficios clave</h4><ul>${beneficios}</ul></div>` : ''}

    ${prod.descripcion ? `<div class="modal-section"><h4>Descripción</h4><div>${escapeHtml(prod.descripcion)}</div></div>` : ''}

    ${fichaHTML}

    <div class="modal-section" style="display:flex; gap:8px; margin-top:14px;">
      <button class="btn-small" id="btn-close-modal">Volver al chat</button>
      ${shareBtn}
    </div>
  `;

  // Abrir modal
  modalOverlay.classList.add('open');
  modalOverlay.setAttribute('aria-hidden','false');

  // Listeners de botones dentro del modal
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  const share = document.getElementById('btn-share');
  if (share) {
    share.addEventListener('click', async () => {
      const text = `${prod.nombre || prod.sku} - SKU: ${prod.sku || '—'}\n${buildSalesPitch(prod)}`;
      try {
        await navigator.clipboard.writeText(text);
        alert('Copiado al portapapeles ✅');
      } catch {
        alert('No se pudo copiar automáticamente. Podés copiarlo manualmente.');
      }
    });
  }
}

function closeModal(){
  modalOverlay.classList.remove('open');
  modalOverlay.setAttribute('aria-hidden','true');
}

// Cierre por ícono o clic afuera
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e)=>{ if(e.target === modalOverlay) closeModal(); });

// ====== Búsqueda flexible ======
function buscarProductos(query) {
  query = query.toLowerCase();

  // 🎯 Primero: coincidencias exactas en la categoría
  const exactos = productos.filter(p => (p.categoria || '').toLowerCase() === query);
  if (exactos.length > 0) return exactos;

  // 🔍 Si no hay exactos, busca coincidencias normales en texto
  return productos.filter(p => {
    for (const key in p) {
      const v = p[key];
      if (typeof v === 'string' && v.toLowerCase().includes(query)) return true;
      if (typeof v === 'number' && String(v).includes(query)) return true;
      if (Array.isArray(v) && v.join(' ').toLowerCase().includes(query)) return true;
      if (typeof v === 'boolean' && (query === 'true' || query === 'false') && String(v) === query) return true;
      if (typeof v === 'object' && v && key === 'ficha_tecnica') {
        if (Object.values(v).some(val => String(val).toLowerCase().includes(query))) return true;
      }
    }
    return false;
  });
}


// ====== Sugerencia por categoría / fallback ======
function buscarSimilares(query){
  const keys = ['heladera','heladeras','tv','televisor','televisores','notebook','notebooks','lavarropas','lavado','aire','aires','celular','celulares','microondas','microonda'];
  const qWords = query.split(/\s+/);
  let foundCat = null;
  for(const w of qWords){
    const low = w.toLowerCase();
    if(keys.includes(low)){
      if(['tv','televisor','televisores'].includes(low)) foundCat = 'TV';
      if(['heladera','heladeras'].includes(low)) foundCat = 'Heladera';
      if(['notebook','notebooks'].includes(low)) foundCat = 'Notebook';
      if(['lavarropas','lavado'].includes(low)) foundCat = 'Lavarropas';
      if(['aire','aires'].includes(low)) foundCat = 'Aire';
      if(['celular','celulares'].includes(low)) foundCat = 'Celular';
      if(['microondas','microonda'].includes(low)) foundCat = 'Microondas';
    }
  }
  if(foundCat){
    return productos.filter(p => (p.categoria || '').toLowerCase() === foundCat.toLowerCase());
  }
  // Fallback por nombre/desc
  const palabra = qWords[0] || query;
  return productos.filter(p => {
    return (p.nombre && p.nombre.toLowerCase().includes(palabra)) ||
           (p.descripcion && p.descripcion.toLowerCase().includes(palabra));
  });
}

// ====== Respuesta principal ======
function responderBot(query){
  const q = query.trim().toLowerCase();
    // 🧹 Limpiar solo los resultados anteriores (mantiene el saludo)
  const initialMessage = chatBox.querySelector('.bot-message.initial');
  if (initialMessage) {
    chatBox.innerHTML = ''; // limpiamos todo
    chatBox.appendChild(initialMessage.cloneNode(true)); // restauramos solo el saludo
  } else {
    chatBox.innerHTML = ''; // si no hay mensaje inicial, limpia igual
  }

  if(!q) { mostrarMenu(); return; }

  appendBotMessage('Buscando productos…');

  const resultados = buscarProductos(q);

  if(resultados.length === 0){
    const similares = buscarSimilares(q);
    if(similares.length === 0){
      appendBotMessage('No encontré coincidencias 😔. Probá con otra palabra clave o elegí una categoría.');
      mostrarMenu();
      return;
    }
    appendBotMessage(`No encontré exactos, pero sí <b>${similares.length}</b> similares. ¿Querés verlos?`);
    const choices = document.createElement('div');
    choices.className = 'inline-choices';
    const yes = document.createElement('button'); yes.className='choice-btn choice-yes'; yes.textContent='Sí';
    const no  = document.createElement('button'); no.className='choice-btn choice-no';   no.textContent='No';
    choices.appendChild(yes); choices.appendChild(no);
    const wrapper = document.createElement('div'); wrapper.className='bot-message'; wrapper.appendChild(choices);
    chatBox.appendChild(wrapper); scrollBottom();

    yes.addEventListener('click', ()=> {
      wrapper.remove();
      appendBotMessage('Mostrando productos similares…');
      similares.slice(0,6).forEach(p => chatBox.appendChild(renderProductCard(p)));
      if(similares.length > 6) appendBotMessage(`Mostré 6. Hay otros ${similares.length - 6} productos más.`);
      appendBotMessage('¿Querés volver al menú principal? Presioná 🔙 o escribí otra cosa.');
    });
    no.addEventListener('click', ()=> { wrapper.remove(); appendBotMessage('Perfecto 👍 Volvemos al menú principal.'); mostrarMenu(); });
    return;
  }

  if(resultados.length > 4){
    appendBotMessage(`Encontré <b>${resultados.length}</b> resultados. Te muestro los primeros 4:`);
    resultados.slice(0,4).forEach(p => chatBox.appendChild(renderProductCard(p)));
    const more = document.createElement('button'); more.className='btn-small'; more.id='ver-mas'; more.textContent='Ver más';
    const wrap = document.createElement('div'); wrap.className='bot-message'; wrap.appendChild(more);
    chatBox.appendChild(wrap); scrollBottom();
    more.addEventListener('click', ()=>{
      resultados.slice(4).forEach(p => chatBox.appendChild(renderProductCard(p)));
      wrap.remove();
      appendBotMessage('¿Querés volver al menú principal? Presioná 🔙 o escribí otra cosa.');
    });
    return;
  }

  // 1 a 4 resultados
  resultados.forEach(p => chatBox.appendChild(renderProductCard(p)));
  appendBotMessage('¿Querés volver al menú principal? Presioná 🔙 o escribí otra cosa.');
  scrollBottom();
}

// ====== Menú principal rápido ======
function mostrarMenu(){
  appendBotMessage('Elegí una categoría:');
  const div = document.createElement('div');
  div.className = 'bot-message';
  div.innerHTML = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;max-width:360px">
      <button class="btn-small cat-inline" data-cat="TV">📺 TV</button>
      <button class="btn-small cat-inline" data-cat="Notebook">💻 Notebooks</button>
      <button class="btn-small cat-inline" data-cat="Heladera">🧊 Heladeras</button>
      <button class="btn-small cat-inline" data-cat="Lavarropas">🧺 Lavado</button>
      <button class="btn-small cat-inline" data-cat="Aire">❄️ Aires</button>
      <button class="btn-small cat-inline" data-cat="Celular">📱 Celulares</button>
      <button class="btn-small cat-inline" data-cat="Microondas">🍲 Microondas</button>
    </div>
  `;
  chatBox.appendChild(div); scrollBottom();

  setTimeout(() => {
    document.querySelectorAll('.cat-inline').forEach(b => {
      b.addEventListener('click', () => {
        const cat = b.getAttribute('data-cat');
        appendUserMessage(cat);
        responderBot(cat);
      });
    });
  }, 80);
}

// ====== Eventos ======
userInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });
sendBtn.addEventListener('click', sendMessage);

clearBtn.addEventListener('click', () => {
  chatBox.innerHTML = `
    <div class="bot-message initial">
      Hola 👋 soy <strong>EnovaBot</strong>.<br>
      Elegí una categoría o escribí nombre, código o característica (ej.: <em>50 pulgadas</em>, <em>Inverter</em>, <em>No Frost</em>).
    </div>
  `;
});

btnMenu.addEventListener('click', () => {
  appendUserMessage('Menú principal');
  mostrarMenu();
});

// Categorías del header
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.getAttribute('data-cat');
    appendUserMessage(cat);
    responderBot(cat);
  });
});

function sendMessage(){
  const text = userInput.value.trim();
  if(!text) return;
  appendUserMessage(text);
  userInput.value = '';
  setTimeout(() => responderBot(text), 200);
}
