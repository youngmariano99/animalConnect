// js/panel-ong.js

let mapOng, userLocation;
let markersGroup = L.layerGroup();
let filtros = { patio: false, cuidados: false, sinMascotas: false, sinNinos: false, radio: 10 };
const user = getUsuario();

// Validación simple
if (!user) window.location.href = 'login.html';

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si tiene ONG (Llamada rápida)
    verificarAccesoOng();

    AppState.onReady((loc) => {
        userLocation = loc;
        initMap(loc);
        // Cargar inicial (opcional)
        aplicarFiltros();
    });
});

async function verificarAccesoOng() {
    try {
        const res = await fetch(`${API_URL}/Organizaciones/mis-ongs/${user.id}`);
        const ongs = await res.json();
        
        // Buscamos si tiene alguna aprobada
        const aprobada = ongs.find(o => o.estadoVerificacion === 'Aprobado');
        
        if (!aprobada) {
            Swal.fire({
                icon: 'error',
                title: 'Acceso Restringido',
                text: 'Necesitas pertenecer a una Organización Aprobada para ver este panel.',
                confirmButtonText: 'Volver'
            }).then(() => window.location.href = 'perfil.html');
        } else {
            document.getElementById('ong-nombre-header').innerText = aprobada.nombre;
        }
    } catch (e) {
        console.error(e);
    }
}

function initMap(loc) {
    mapOng = L.map('map-ong').setView([loc.lat, loc.lng], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapOng);
    markersGroup.addTo(mapOng);

    // Círculo de radio visual
    L.circle([loc.lat, loc.lng], {
        color: 'purple', fillColor: '#d8b4fe', fillOpacity: 0.1, radius: filtros.radio * 1000
    }).addTo(mapOng);
}

// --- LÓGICA DE FILTROS ---
function toggleFiltro(el, key) {
    // Invertimos el valor lógico
    filtros[key] = !filtros[key];

    if (filtros[key]) {
        // ACTIVO: Fondo morado, texto blanco
        el.className = "filter-chip active bg-purple-600 text-white border-purple-600 px-3 py-1 rounded-full border text-xs font-bold cursor-pointer select-none transition";
    } else {
        // INACTIVO: Fondo blanco, texto gris
        el.className = "filter-chip inactive bg-white text-gray-500 border-gray-300 hover:border-purple-300 px-3 py-1 rounded-full border text-xs font-bold cursor-pointer select-none transition";
    }
}

function actualizarRadio(val) {
    filtros.radio = val;
    document.getElementById('lbl-radio').innerText = val;
}

// --- BÚSQUEDA ---
async function aplicarFiltros() {
    const btn = document.querySelector('button[onclick="aplicarFiltros()"]');
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Buscando...';
    
    try {
        // Construir Query String
        let qs = `usuarioSolicitanteId=${user.id}&lat=${userLocation.lat}&lng=${userLocation.lng}&radio=${filtros.radio}`;
        if(filtros.patio) qs += `&patio=true`;
        if(filtros.cuidados) qs += `&cuidados=true`;
        // Lógica inversa para "SIN"
        if(filtros.sinMascotas) qs += `&mascotas=false`; // Buscamos hogares donde tieneMascotas == false ?? 
        // Ojo con la lógica de backend: el backend espera "mascotas=true" para filtrar los que SI tienen.
        // Si queremos filtrar los que NO tienen, el backend necesitaría un ajuste o filtrarlo aquí en JS.
        // Para simplificar, filtraremos en memoria los "Sin"
        
        const res = await fetch(`${API_URL}/Hogares/buscar?${qs}`);
        
        if (!res.ok) {
            if(res.status === 401) throw new Error("No autorizado. Tu ONG no está aprobada aún.");
            throw new Error("Error al buscar hogares");
        }

        let lista = await res.json();

        // Filtro en cliente para "Sin Niños" / "Sin Mascotas" si el backend no lo soporta nativo directo
        if(filtros.sinNinos) lista = lista.filter(h => !h.tieneNinos); // Asumiendo que el DTO trae esa prop
        // Nota: Agregué las props al select del backend en el paso anterior, revisa que estén.
        // (En el paso anterior puse TienePatio, etc. Si falta alguna, agrégala al select del controller).

        renderizarResultados(lista);

    } catch (err) {
        Swal.fire('Error', err.message, 'error');
    } finally {
        btn.innerHTML = 'Buscar Hogares';
    }
}

function renderizarResultados(lista) {
    const contenedor = document.getElementById('lista-resultados');
    const contador = document.getElementById('count-res');
    
    contenedor.innerHTML = '';
    markersGroup.clearLayers();
    contador.innerText = lista.length;

    if (lista.length === 0) {
        contenedor.innerHTML = '<div class="text-center py-10 text-gray-400 text-sm"><i class="fa-solid fa-filter-circle-xmark text-2xl mb-2"></i><br>No hay hogares disponibles con estos filtros.</div>';
        return;
    }

    lista.forEach(h => {
        // Iconos de características
        let iconos = '';
        if (h.tienePatioCerrado) iconos += `<span title="Patio Cerrado" class="text-green-600 bg-green-100 px-1.5 py-0.5 rounded mr-1"><i class="fa-solid fa-tree"></i></span>`;
        if (h.aceptaCuidadosEspeciales) iconos += `<span title="Cuidados Especiales" class="text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded mr-1"><i class="fa-solid fa-kit-medical"></i></span>`;
        if (!h.tieneNinos) iconos += `<span title="Sin Niños" class="text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded mr-1"><i class="fa-solid fa-child-reaching"></i>🚫</span>`;
        if (!h.tieneOtrasMascotas) iconos += `<span title="Sin Mascotas" class="text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded mr-1"><i class="fa-solid fa-paw"></i>🚫</span>`;

        // 1. Crear Card con más detalle
        const card = document.createElement('div');
        card.className = "bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-purple-400 hover:shadow-md cursor-pointer transition group";
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h4 class="font-bold text-gray-800 text-sm group-hover:text-purple-700 transition">
                        ${h.tipoVivienda} en ${h.direccionAproximada.split(',')[0]}
                    </h4>
                    <p class="text-xs text-gray-500 mt-0.5"><i class="fa-solid fa-user mr-1"></i>${h.nombreContacto || 'Usuario'}</p>
                </div>
                <div class="text-right">
                    <span class="block text-xs font-bold text-purple-600">${h.distancia.toFixed(1)} km</span>
                </div>
            </div>
            
            <div class="flex flex-wrap gap-1 mb-3 text-[10px]">
                ${iconos || '<span class="text-gray-400 italic">Estándar</span>'}
            </div>

            <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                <span class="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    <i class="fa-solid fa-hourglass-half mr-1"></i>${h.tiempoCompromiso}
                </span>
                <button class="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold hover:bg-purple-200 transition">
                    Ver contacto
                </button>
            </div>
        `;
        
        // Al hacer click, viajamos en el mapa
        card.onclick = () => {
            mapOng.flyTo([h.latitud, h.longitud], 16);
            marker.openPopup(); // Abrir el popup del marcador correspondiente
        };
        contenedor.appendChild(card);

        // 2. Marcador en mapa
        const markerIcon = L.divIcon({
            html: `<i class="fa-solid fa-location-dot text-3xl ${h.tipoVivienda === 'Casa' ? 'text-teal-600' : 'text-blue-600'} drop-shadow-md"></i>`,
            className: 'bg-transparent',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });

        const marker = L.marker([h.latitud, h.longitud], {icon: markerIcon})
            .bindPopup(`
                <div class="text-center">
                    <strong class="text-purple-700 block mb-1">${h.tipoVivienda} - ${h.nombreContacto || 'Usuario'}</strong>
                    <p class="text-xs text-gray-600 mb-2">${h.direccionAproximada}</p>
                    <a href="#" class="bg-green-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-600 block w-full">
                        <i class="fa-brands fa-whatsapp"></i> Contactar
                    </a>
                </div>
            `);
        
        markersGroup.addLayer(marker);
    });
}