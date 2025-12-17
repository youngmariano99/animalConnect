// js/tiendas.js

let mapTiendas;
let markersGroup = L.layerGroup();
let ubicacionUsuario = null;
let filtroActual = null;

document.addEventListener('DOMContentLoaded', () => {
    AppState.onReady((loc) => {
        ubicacionUsuario = loc;
        initMap(loc);
        cargarComercios(); // Carga inicial sin filtros
    });
});

function initMap(loc) {
    mapTiendas = L.map('map-tiendas').setView([loc.lat, loc.lng], 14);
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(mapTiendas);

    // Usuario
    const iconUser = L.divIcon({
        className: 'user-location-dot',
        html: '<div class="dot"></div><div class="pulse"></div>',
        iconSize: [20, 20]
    });
    L.marker([loc.lat, loc.lng], {icon: iconUser}).addTo(mapTiendas).bindPopup("Estás aquí");
    
    markersGroup.addTo(mapTiendas);
}

// --- LÓGICA DE FILTROS ---
function filtrar(rubro) {
    filtroActual = rubro;
    
    // Actualizar botones visualmente
    document.querySelectorAll('.filter-btn').forEach(btn => {
        // Lógica simple: si el texto del botón coincide o es "Todos"
        if(rubro === null && btn.innerText.includes('Todos')) {
            activarBtn(btn);
        } else if (rubro && btn.innerText.includes(rubro)) {
            activarBtn(btn);
        } else {
            desactivarBtn(btn);
        }
    });

    cargarComercios();
}

function activarBtn(btn) {
    btn.classList.remove('bg-white', 'text-gray-600', 'border-gray-200');
    btn.classList.add('bg-orange-600', 'text-white', 'border-orange-600', 'active');
}

function desactivarBtn(btn) {
    btn.classList.add('bg-white', 'text-gray-600', 'border-gray-200');
    btn.classList.remove('bg-orange-600', 'text-white', 'border-orange-600', 'active');
}

// --- CARGA DE DATOS ---
async function cargarComercios() {
    const listaDiv = document.getElementById('lista-tiendas');
    listaDiv.innerHTML = '<div class="text-center py-10"><i class="fa-solid fa-circle-notch fa-spin text-orange-500"></i> Buscando...</div>';
    markersGroup.clearLayers();

    try {
        let url = `${API_URL}/Comercios?lat=${ubicacionUsuario.lat}&lng=${ubicacionUsuario.lng}&radio=15`;
        if (filtroActual) url += `&rubro=${filtroActual}`;

        const res = await fetch(url);
        if (res.ok) {
            const tiendas = await res.json();
            renderizarResultados(tiendas);
        } else {
            listaDiv.innerHTML = '<p class="text-center text-red-400">Error cargando datos.</p>';
        }
    } catch (e) {
        console.error(e);
        listaDiv.innerHTML = '<p class="text-center text-red-400">Error de conexión.</p>';
    }
}

function renderizarResultados(tiendas) {
    const listaDiv = document.getElementById('lista-tiendas');
    document.getElementById('contador-tiendas').innerText = tiendas.length;
    listaDiv.innerHTML = '';

    if (tiendas.length === 0) {
        listaDiv.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <i class="fa-solid fa-shop-slash text-4xl mb-2"></i>
                <p>No encontramos tiendas de este rubro en tu zona.</p>
            </div>`;
        return;
    }

    tiendas.forEach(t => {
        // 1. CARD LISTA
        const tagsHtml = t.etiquetas.split(',').map(tag => 
            `<span class="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded mr-1">${tag}</span>`
        ).join('');

        const card = document.createElement('div');
        card.className = `p-4 rounded-xl border bg-white hover:border-orange-300 hover:shadow-md transition cursor-pointer flex gap-3 ${t.esDestacado ? 'border-l-4 border-l-orange-500' : 'border-gray-100'}`;
        card.innerHTML = `
            <div class="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 text-xl flex-shrink-0">
                ${t.logoUrl ? `<img src="${t.logoUrl}" class="w-full h-full object-cover rounded-lg">` : '<i class="fa-solid fa-store"></i>'}
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <h3 class="font-bold text-gray-800 text-sm leading-tight">${t.nombre}</h3>
                    ${t.esDestacado ? '<i class="fa-solid fa-star text-yellow-400 text-xs"></i>' : ''}
                </div>
                <p class="text-xs text-gray-500 mt-1 mb-2"><i class="fa-solid fa-location-arrow mr-1"></i> A ${t.distanciaKm.toFixed(1)} km</p>
                <div class="flex flex-wrap gap-1">${tagsHtml}</div>
            </div>
        `;
        
        card.onclick = () => {
            mapTiendas.flyTo([t.latitud, t.longitud], 16);
            // Aquí podríamos abrir un modal con el detalle/catálogo
            // verDetalleComercio(t.id); <-- Para el futuro
        };
        listaDiv.appendChild(card);

        // 2. MARKER MAPA
        const iconShop = L.divIcon({
            html: `<div class="relative drop-shadow-xl hover:scale-110 transition-transform duration-300">
                    <i class="fa-solid fa-location-pin text-6xl ${t.esDestacado ? 'text-orange-600' : 'text-slate-700'}"></i>
                    <i class="fa-solid fa-store absolute top-2 left-1/2 -translate-x-1/2 text-white text-lg mt-1"></i>
                   </div>`,
            className: 'bg-transparent border-none',
            iconSize: [60, 60],
            iconAnchor: [30, 60], // Punta del pin exacta
            popupAnchor: [0, -60]  // Popup justo arriba
        });

        // Diseño del Popup "Tipo Tarjeta"
        const popupContent = `
            <div class="font-sans min-w-[200px] p-1">
                <div class="flex items-center gap-3 mb-3 border-b border-gray-100 pb-2">
                    <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                        ${t.logoUrl ? `<img src="${t.logoUrl}" class="w-full h-full object-cover">` : '<i class="fa-solid fa-store text-gray-400"></i>'}
                    </div>
                    <div class="leading-tight">
                        <strong class="text-gray-800 text-sm block">${t.nombre}</strong>
                        <span class="text-[10px] text-gray-500 bg-gray-50 px-1 rounded border border-gray-100">${t.etiquetas.split(',')[0]}</span>
                    </div>
                </div>
                
                <p class="text-xs text-gray-500 mb-3 flex items-center">
                    <i class="fa-solid fa-map-pin mr-1.5 text-orange-400"></i> ${t.direccion}
                </p>

                <button onclick="verCatalogo(${t.id})" class="w-full bg-slate-800 hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2">
                    <span>Ver Productos</span> <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;

        const marker = L.marker([t.latitud, t.longitud], { icon: iconShop })
            .bindPopup(popupContent, {
                closeButton: false,   // Quitamos la X por defecto fea
                className: 'custom-popup-moderno', // Para estilos extra si quieres
                maxWidth: 260
            });
        
        markersGroup.addLayer(marker);
    });
}
// Placeholder para el futuro
async function verCatalogo(id) {
    // 1. Mostrar estado de carga (opcional, podrías poner un spinner global)
    Swal.fire({
        title: 'Cargando...',
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
        background: 'transparent',
        color: 'white',
        backdrop: 'rgba(0,0,0,0.5)'
    });

    try {
        const res = await fetch(`${API_URL}/Comercios/${id}`);
        if(res.ok) {
            const comercio = await res.json();
            Swal.close(); // Cerramos spinner
            abrirModal(comercio);
        } else {
            Swal.fire('Error', 'No se pudo cargar la información.', 'error');
        }
    } catch(e) {
        console.error(e);
        Swal.fire('Error', 'Fallo de conexión.', 'error');
    }
}

function abrirModal(c) {
    // A. Llenar Info Básica
    document.getElementById('m-nombre').innerText = c.nombre;
    document.getElementById('m-desc').innerText = c.descripcion || "Sin descripción disponible.";
    
    // Logo
    const img = document.getElementById('m-logo');
    const icon = document.getElementById('m-logo-icon');
    if(c.logoUrl) {
        img.src = c.logoUrl;
        img.classList.remove('hidden');
        icon.classList.add('hidden');
    } else {
        img.classList.add('hidden');
        icon.classList.remove('hidden');
    }

    // Tags
    const tagsContainer = document.getElementById('m-tags');
    tagsContainer.innerHTML = c.etiquetas.split(',').map(tag => 
        `<span class="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-1 rounded-md uppercase">${tag}</span>`
    ).join('');

    // Botones Contacto
    document.getElementById('btn-wsp').href = `https://wa.me/549${c.telefono}?text=Hola, vi tu tienda en AnimalConnect`;
    document.getElementById('btn-tel').href = `tel:${c.telefono}`;

    // B. Llenar Catálogo
    const grid = document.getElementById('m-catalogo');
    grid.innerHTML = '';

    if (!c.catalogo || c.catalogo.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-6 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                <i class="fa-solid fa-box-open text-3xl mb-2 opacity-50"></i>
                <p class="text-sm">Este comercio aún no cargó productos.</p>
            </div>`;
    } else {
        c.catalogo.forEach(item => {
            grid.innerHTML += `
                <div class="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3 hover:border-orange-200 transition">
                    <div class="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        ${item.imagenUrl 
                            ? `<img src="${item.imagenUrl}" class="w-full h-full object-cover">` 
                            : '<div class="w-full h-full flex items-center justify-center text-gray-300"><i class="fa-solid fa-image"></i></div>'}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h5 class="font-bold text-gray-800 text-sm truncate">${item.nombre}</h5>
                        <p class="text-xs text-gray-500 line-clamp-2 mb-1">${item.descripcion}</p>
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-orange-600 text-sm">$${item.precio > 0 ? item.precio : 'Consultar'}</span>
                            <a href="https://wa.me/549${c.telefono}?text=Me interesa: ${item.nombre}" target="_blank" class="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100">
                                Pedir <i class="fa-brands fa-whatsapp"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // C. Mostrar Modal
    document.getElementById('modal-comercio').classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modal-comercio').classList.add('hidden');
}

// Cerrar con tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
});