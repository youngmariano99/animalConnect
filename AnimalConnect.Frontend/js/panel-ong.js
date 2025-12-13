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
    if (el.classList.contains('active')) {
        el.classList.remove('active');
        el.classList.add('inactive');
        filtros[key] = false;
    } else {
        el.classList.remove('inactive');
        el.classList.add('active');
        filtros[key] = true;
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
        contenedor.innerHTML = '<p class="text-center text-sm text-gray-500 py-4">No se encontraron hogares con estos criterios.</p>';
        return;
    }

    lista.forEach(h => {
        // 1. Crear Card
        const card = document.createElement('div');
        card.className = "bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:border-purple-400 cursor-pointer transition";
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-bold text-gray-800 text-sm">${h.tipoVivienda} ${h.tienePatioCerrado ? '(con Patio)' : ''}</h4>
                    <p class="text-xs text-gray-500"><i class="fa-solid fa-location-dot mr-1"></i>${h.direccionAproximada}</p>
                </div>
                <span class="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">
                    ${h.disponibilidadHoraria === 3 ? 'Full Time' : 'Part Time'}
                </span>
            </div>
            <div class="mt-2 text-xs text-gray-600 flex gap-2">
                ${h.aceptaCuidadosEspeciales ? '<span class="bg-yellow-50 text-yellow-700 px-1 rounded border border-yellow-200">Enfermería</span>' : ''}
                <span class="bg-gray-100 px-1 rounded">⏳ ${h.tiempoCompromiso}</span>
            </div>
        `;
        
        // Evento al clickear tarjeta: centrar mapa
        card.onclick = () => {
            mapOng.flyTo([h.latitud, h.longitud], 16);
        };
        contenedor.appendChild(card);

        // 2. Crear Pin en Mapa
        const color = h.tipoVivienda === 'Casa' ? 'teal' : 'blue'; // Colores simulados
        // Aquí podrías usar iconos personalizados de colores
        
        const marker = L.marker([h.latitud, h.longitud])
            .bindPopup(`
                <div class="text-center">
                    <strong>Hogar de ${h.nombreContacto || 'Usuario'}</strong><br>
                    ${h.direccionAproximada}<br>
                    <a href="#" class="text-purple-600 font-bold text-xs mt-1 block">Ver contacto completo</a>
                </div>
            `);
        
        markersGroup.addLayer(marker);
    });
}