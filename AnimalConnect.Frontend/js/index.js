// js/index.js

// Variables globales
let mapPerdidos, mapModal, markerModal;
let coordsReporte = null;

// Obtenemos el usuario
const currentUser = JSON.parse(localStorage.getItem('zoonosis_user'));

document.addEventListener('DOMContentLoaded', () => {
    // 1. PRIMERO: Inicializamos el mapa vacío (Síncrono)
    inicializarMapaBase();
    
    // 2. DESPUÉS: Cargamos los datos (Asíncrono)
    cargarPerdidos();
    cargarVeterinarias();
});

// --- 1. INICIALIZACIÓN DEL MAPA ---
function inicializarMapaBase() {
    // Si ya existe, lo limpiamos (aunque al cargar página suele ser null)
    if (mapPerdidos) mapPerdidos.remove();
    
    // Crear el mapa inmediatamente
    mapPerdidos = L.map('map-perdidos').setView([-37.994, -61.353], 14);
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(mapPerdidos);

    // Agregar la leyenda visual
    agregarLeyenda(mapPerdidos);
}

// --- 2. CARGAR ANIMALES (Perdidos/Encontrados) ---
async function cargarPerdidos() {
    try {
        const res = await fetch(`${API_URL}/Animales`);
        const todos = await res.json();
        
        // Filtramos solo Perdidos (2) y Encontrados-Avisos (3)
        const activos = todos.filter(a => a.idEstado === 2 || a.idEstado === 3);

        const grid = document.getElementById('grid-perdidos');
        if(grid) grid.innerHTML = '';

        activos.forEach(a => {
            if (a.ubicacionLat) {
                const icono = crearIconoPersonalizado(a.idEspecie, a.idEstado);
                
                const etiqueta = a.idEstado === 2 ? "BUSCAN A SU FAMILIA" : "BUSCAN A SU DUEÑO";
                const colorTexto = a.idEstado === 2 ? "text-red-600" : "text-green-600";

                // Agregamos marcador AL MAPA que ya existe
                L.marker([a.ubicacionLat, a.ubicacionLon], { icon: icono })
                 .addTo(mapPerdidos)
                 .bindPopup(`
                    <div class="text-center">
                        <strong class="${colorTexto} uppercase text-xs">${etiqueta}</strong><br>
                        <span class="text-lg font-bold">${a.nombre}</span><br>
                        <span class="text-sm text-gray-600">${a.descripcion}</span>
                    </div>
                 `);
            }

            // Tarjeta en Grid
            if(grid) {
                const colorBorde = a.idEstado === 2 ? 'border-red-500' : 'border-green-500';
                const badge = a.idEstado === 2 
                    ? '<span class="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded shadow"><i class="fa-solid fa-search mr-1"></i>SE BUSCA</span>'
                    : '<span class="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded shadow"><i class="fa-solid fa-eye mr-1"></i>ENCONTRADO</span>';

                const iconoEspecie = a.idEspecie === 1 ? '<i class="fa-solid fa-dog"></i>' : '<i class="fa-solid fa-cat"></i>';

                grid.innerHTML += `
                    <div class="bg-white rounded-lg shadow overflow-hidden border-l-4 ${colorBorde} hover:shadow-md transition">
                        <div class="relative h-40">
                            <img src="${a.imagenUrl || 'https://via.placeholder.com/400'}" class="w-full h-full object-cover">
                            <div class="absolute top-2 right-2">${badge}</div>
                            <div class="absolute bottom-2 right-2 bg-white/80 px-2 rounded-full text-gray-700 text-xs shadow">
                                ${iconoEspecie}
                            </div>
                        </div>
                        <div class="p-4">
                            <h3 class="font-bold text-gray-800 text-lg">${a.nombre}</h3>
                            <p class="text-xs text-gray-500 mb-3 line-clamp-2">${a.descripcion}</p>
                            ${generarBotonWsp(a)}
                        </div>
                    </div>
                `;
            }
        });
    } catch (e) { console.error("Error mapa perdidos:", e); }
}

// --- 3. CARGAR VETERINARIAS ---
async function cargarVeterinarias() {
    try {
        const res = await fetch(`${API_URL}/Veterinarias`);
        if (res.ok) {
            const lista = await res.json();
            
            // Icono de Farmacia/Vet Mejorado
            const iconVet = L.divIcon({
                html: `
                    <span class="fa-stack fa-2x" style="font-size: 1.5rem;">
                        <i class="fa-solid fa-location-pin fa-stack-2x text-blue-600 drop-shadow-md"></i>
                        <i class="fa-solid fa-staff-snake fa-stack-1x fa-inverse" style="margin-top: -5px; font-size: 0.6em;"></i>
                    </span>
                `,
                className: 'bg-transparent border-none',
                iconSize: [40, 40],
                iconAnchor: [20, 40], 
                popupAnchor: [0, -35]
            });

            lista.forEach(v => {
                // Aquí estaba el error: mapPerdidos ya existe, así que esto funcionará
                L.marker([v.latitud, v.longitud], { icon: iconVet })
                    .addTo(mapPerdidos) 
                    .bindPopup(`
                        <div class="text-center min-w-[150px]">
                            <h3 class="font-bold text-blue-700">${v.nombreVeterinaria}</h3>
                            <p class="text-xs text-gray-500 mb-2">${v.direccion}</p>
                            ${v.esDeTurno ? '<div class="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded mb-2 animate-pulse">¡DE TURNO!</div>' : ''}
                            <a href="https://wa.me/549${v.telefonoProfesional}" target="_blank" class="block w-full bg-blue-500 text-white py-1 rounded text-xs font-bold hover:bg-blue-600">
                                Contactar
                            </a>
                        </div>
                    `);

                if (v.esDeTurno) mostrarWidgetTurno(v);
            });
        }
    } catch (e) { console.error("Error veterinarias", e); }
}

// --- UTILIDADES ---

function crearIconoPersonalizado(idEspecie, idEstado) {
    let iconoAnimal = 'fa-paw';
    if (idEspecie === 1) iconoAnimal = 'fa-dog';
    if (idEspecie === 2) iconoAnimal = 'fa-cat';

    let colorPin = idEstado === 2 ? 'text-red-500' : 'text-green-500';

    const htmlIcon = `
        <span class="fa-stack fa-2x" style="font-size: 1.8rem;">
            <i class="fa-solid fa-location-pin fa-stack-2x ${colorPin} drop-shadow-md"></i>
            <i class="fa-solid ${iconoAnimal} fa-stack-1x fa-inverse" style="margin-top: -6px; font-size: 0.5em;"></i>
        </span>
    `;

    return L.divIcon({
        html: htmlIcon,
        className: 'bg-transparent border-none',
        iconSize: [40, 40],
        iconAnchor: [20, 35],
        popupAnchor: [0, -35]
    });
}

function agregarLeyenda(map) {
    const legend = L.control({ position: 'topright' });
    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = "white";
        div.style.padding = "10px";
        div.style.borderRadius = "8px";
        div.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
        div.style.fontSize = "12px";
        div.innerHTML = `
            <div class="font-bold mb-2 text-gray-700 border-b pb-1">Referencias</div>
            <div class="flex items-center mb-1"><i class="fa-solid fa-location-pin text-red-500 text-lg mr-2"></i> <span>Perdido</span></div>
            <div class="flex items-center mb-1"><i class="fa-solid fa-location-pin text-green-500 text-lg mr-2"></i> <span>Encontrado</span></div>
            <div class="flex items-center"><i class="fa-solid fa-location-pin text-blue-600 text-lg mr-2"></i> <span>Veterinaria</span></div>
        `;
        return div;
    };
    legend.addTo(map);
}

function mostrarWidgetTurno(vet) {
    const widget = document.getElementById('widget-turno');
    if (widget) {
        // Inyectamos el contenido correcto para que coincida con layout.js
        widget.innerHTML = `
            <div class="flex items-center">
                <span class="text-[10px] font-bold text-green-700 mr-2 uppercase tracking-tighter leading-tight text-right">
                    GUARDIA<br>${vet.nombreVeterinaria}
                </span>
                <a href="https://wa.me/549${vet.telefonoProfesional}?text=Urgencia" target="_blank" class="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-green-600 shadow-sm transition">
                    <i class="fa-brands fa-whatsapp"></i>
                </a>
            </div>
        `;
        widget.classList.remove('hidden');
        widget.classList.add('flex');
    }
}

// --- MODAL REPORTE ---
function abrirModalReporte() {
    if (!currentUser) {
        if (confirm("Para publicar un aviso debes estar registrado.\n¿Quieres iniciar sesión ahora?")) {
            window.location.href = 'login.html';
        }
        return;
    }

    const modal = document.getElementById('modal-reporte');
    const select = document.getElementById('rep-estado');
    select.innerHTML = '<option value="2">🚨 Se perdió mi mascota</option><option value="3">👀 Encontré una mascota</option>';
    modal.classList.remove('hidden');

    setTimeout(() => {
        if (!mapModal) {
            mapModal = L.map('map-modal').setView([-37.994, -61.353], 13);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapModal);
            mapModal.on('click', e => {
                coordsReporte = e.latlng;
                if (markerModal) markerModal.setLatLng(e.latlng); 
                else markerModal = L.marker(e.latlng).addTo(mapModal);
            });
        } else {
            mapModal.invalidateSize();
        }
    }, 200);
}

function cerrarModal() { document.getElementById('modal-reporte').classList.add('hidden'); }

async function enviarReporte(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const btnTxt = btn.innerText;
    btn.innerText = "Publicando..."; btn.disabled = true;

    try {
        const fileInput = document.getElementById('rep-foto');
        let imgUrl = "";
        if (fileInput.files[0]) {
            const fd = new FormData(); fd.append('file', fileInput.files[0]);
            const resImg = await fetch(`${API_URL}/Archivos/subir`, { method: 'POST', body: fd });
            const dataImg = await resImg.json();
            imgUrl = dataImg.url;
        }

        const nuevoAnimal = {
            nombre: document.getElementById('rep-nombre').value,
            descripcion: document.getElementById('rep-desc').value,
            idEspecie: parseInt(document.getElementById('rep-especie').value),
            idEstado: parseInt(document.getElementById('rep-estado').value),
            usuarioId: currentUser.id,
            telefonoContacto: document.getElementById('rep-tel').value,
            imagenUrl: imgUrl,
            ubicacionLat: coordsReporte ? coordsReporte.lat : -37.994,
            ubicacionLon: coordsReporte ? coordsReporte.lng : -61.353,
            fechaPublicacion: new Date().toISOString(),
            atributos: [] 
        };

        const res = await fetch(`${API_URL}/Animales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoAnimal)
        });

        if (res.ok) {
            alert("¡Aviso publicado con éxito!");
            cerrarModal();
            e.target.reset();
            markerModal = null; coordsReporte = null;
            cargarPerdidos(); // Solo recargamos los pines
        } else {
            alert("Error al publicar.");
        }
    } catch (err) {
        console.error(err);
        alert("Error de conexión");
    } finally {
        btn.innerText = btnTxt; btn.disabled = false;
    }
}

function generarBotonWsp(a) {
    if (!a.telefonoContacto) return '';
    const num = a.telefonoContacto.replace(/\D/g, '');
    return `<a href="https://wa.me/549${num}" target="_blank" class="flex-1 bg-green-500 text-white text-center px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition flex items-center justify-center"><i class="fa-brands fa-whatsapp mr-2"></i> Contactar</a>`;
}