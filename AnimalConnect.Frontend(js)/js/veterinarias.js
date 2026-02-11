// js/veterinarias.js

let mapVets;
let markersGroup = L.layerGroup();

document.addEventListener('DOMContentLoaded', () => {
    // Esperamos a que el sistema geolocalice al usuario
    AppState.onReady((location) => {
        initMap(location);
        cargarDatosVeterinarias(location);
    });
});

function initMap(loc) {
    mapVets = L.map('map-vets').setView([loc.lat, loc.lng], 14);
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(mapVets);

    // Marcador del usuario
    const iconUser = L.divIcon({
        className: 'user-location-dot',
        html: '<div class="dot"></div><div class="pulse"></div>',
        iconSize: [20, 20]
    });
    L.marker([loc.lat, loc.lng], {icon: iconUser}).addTo(mapVets).bindPopup("Tu ubicación");
    
    markersGroup.addTo(mapVets);
}

async function cargarDatosVeterinarias(loc) {
    try {
        const res = await fetch(`${API_URL}/Veterinarias?lat=${loc.lat}&lng=${loc.lng}&radio=20`);
        if(res.ok) {
            const lista = await res.json();
            renderizarTodo(lista);
        } else {
            console.error("Error API Vets");
        }
    } catch(e) { console.error(e); }
}

function renderizarTodo(lista) {
    const contenedorLista = document.getElementById('lista-vets');
    contenedorLista.innerHTML = '';
    markersGroup.clearLayers();

    // 1. Buscar si hay alguno de turno
    const deTurno = lista.find(v => v.esDeTurno);
    renderizarWidgetTurno(deTurno);

    // 2. Renderizar Lista y Mapa
    if (lista.length === 0) {
        contenedorLista.innerHTML = '<p class="text-center text-gray-400 mt-4">No se encontraron veterinarias cercanas.</p>';
        return;
    }

    lista.forEach(v => {
        // A. LISTA LATERAL
        const item = document.createElement('div');
        item.className = `p-4 rounded-xl border transition cursor-pointer hover:shadow-md ${v.esDeTurno ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:border-blue-200'}`;
        item.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-bold text-gray-800 text-sm">${v.nombreVeterinaria}</h4>
                    <p class="text-xs text-gray-500 mt-1"><i class="fa-solid fa-location-dot mr-1"></i> ${v.distanciaKm.toFixed(1)} km</p>
                </div>
                ${v.esDeTurno ? '<i class="fa-solid fa-star-of-life text-green-500 animate-pulse"></i>' : ''}
            </div>
            <div class="mt-2 flex gap-2">
                <a href="https://wa.me/549${v.telefonoProfesional}" target="_blank" onclick="event.stopPropagation()" class="text-xs bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-700 px-3 py-1 rounded-full font-bold transition">
                    <i class="fa-brands fa-whatsapp"></i>
                </a>
                <button onclick="centrarEnMapa(${v.latitud}, ${v.longitud})" class="text-xs bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 px-3 py-1 rounded-full font-bold transition">
                    Ver
                </button>
            </div>
        `;
        // Al hacer clic en la tarjeta de la lista, vamos al mapa
        item.onclick = () => centrarEnMapa(v.latitud, v.longitud);
        contenedorLista.appendChild(item);

        // B. MARCADOR MAPA
        // Icono diferente si es de turno
        const colorIcon = v.esDeTurno ? 'text-green-600' : 'text-blue-600';
        const zIndex = v.esDeTurno ? 1000 : 1; // El de turno siempre arriba

        const iconVet = L.divIcon({
            html: `<i class="fa-solid fa-location-dot text-4xl ${colorIcon} drop-shadow-md"></i>`,
            className: 'bg-transparent border-none',
            iconSize: [30, 40],
            iconAnchor: [15, 40],
            popupAnchor: [0, -40]
        });

        const marker = L.marker([v.latitud, v.longitud], { icon: iconVet, zIndexOffset: zIndex })
            .bindPopup(`
                <div class="text-center">
                    <strong class="${v.esDeTurno ? 'text-green-600' : 'text-blue-600'}">${v.nombreVeterinaria}</strong><br>
                    <span class="text-xs text-gray-600">${v.direccion}</span><br>
                    <span class="text-xs font-mono block mt-1">${v.horariosAtencion}</span>
                    ${v.esDeTurno ? '<span class="block mt-2 text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">¡DE GUARDIA!</span>' : ''}
                </div>
            `);
        
        markersGroup.addLayer(marker);
        
        // Si es de turno, abrir el popup por defecto
        if(v.esDeTurno) marker.openPopup();
    });
}

function renderizarWidgetTurno(vet) {
    const panel = document.getElementById('panel-guardia');
    const noGuardia = document.getElementById('no-guardia');

    if (!vet) {
        panel.classList.add('hidden');
        noGuardia.classList.remove('hidden');
        return;
    }

    noGuardia.classList.add('hidden');
    panel.classList.remove('hidden');

    document.getElementById('guardia-nombre').innerText = vet.nombreVeterinaria;
    document.getElementById('guardia-direccion').innerText = vet.direccion;
    
    // Calcular vencimiento (Si el backend mandó 'venceTurno')
    if (vet.venceTurno) {
        const horaFin = new Date(vet.venceTurno).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        document.getElementById('guardia-vence').innerText = `Finaliza hoy a las ${horaFin} hs`;
    }

    // Botones del widget
    document.getElementById('guardia-btn-wsp').href = `https://wa.me/549${vet.telefonoProfesional}?text=Tengo una urgencia veterinaria`;
    document.getElementById('guardia-btn-map').onclick = () => centrarEnMapa(vet.latitud, vet.longitud);
}

function centrarEnMapa(lat, lng) {
    mapVets.flyTo([lat, lng], 16, { duration: 1.5 });
}