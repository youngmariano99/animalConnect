// js/salud.js

let mapCampanas;

document.addEventListener('DOMContentLoaded', () => {
    initMapCampanas();
});

async function initMapCampanas() {
    // 1. Inicializar Mapa (Coordenadas por defecto de tu municipio)
    // Asegúrate de que coincidan con las de tu config o usas las de siempre
    mapCampanas = L.map('map-campanas').setView([-37.994, -61.353], 14);
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(mapCampanas);

    // 2. Traer datos
    try {
        const res = await fetch(`${API_URL}/Campanias`);
        if (res.ok) {
            const lista = await res.json();
            renderizarCampanas(lista);
        } else {
            console.error("Error al obtener campañas");
            document.getElementById('lista-campanas').innerHTML = '<p class="text-red-500 text-center">No se pudo cargar la información.</p>';
        }
    } catch (e) {
        console.error(e);
        document.getElementById('lista-campanas').innerHTML = '<p class="text-red-500 text-center">Error de conexión.</p>';
    }
}

function renderizarCampanas(lista) {
    const contenedor = document.getElementById('lista-campanas');
    contenedor.innerHTML = ''; // Limpiar el "Cargando..."

    if (lista.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-10 text-gray-400">
                <i class="fa-solid fa-calendar-xmark text-4xl mb-3"></i>
                <p>No hay operativos programados por el momento.</p>
            </div>`;
        return;
    }

    lista.forEach(c => {
        // --- Parseo de Descripción (Tu lógica original para sacar hora fin y teléfono) ---
        const partes = c.descripcion.split('|');
        const descReal = partes[0].trim();
        const fin = partes.find(p => p.includes('Fin:'))?.replace('Fin:', '').trim();
        const tel = partes.find(p => p.includes('Turnos:'))?.replace('Turnos:', '').trim();

        // --- Formateo de Fechas ---
        const fecha = new Date(c.fechaHora);
        const dia = fecha.getDate();
        // Mes abreviado (Ej: "DIC")
        const mes = fecha.toLocaleString('es-ES', { month: 'short' }).toUpperCase().replace('.', '');
        const horaInicio = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const horarioTexto = fin ? `${horaInicio} a ${fin}` : `${horaInicio} hs`;

        // 1. Agregar Marcador al Mapa
        const marker = L.marker([c.ubicacionLat, c.ubicacionLon]).addTo(mapCampanas);
        marker.bindPopup(`
            <div class="text-center">
                <b class="text-orange-600">${c.titulo}</b><br>
                <span class="text-gray-600 text-xs">${horarioTexto}</span>
            </div>
        `);

        // 2. Botón de WhatsApp (si hay teléfono en la descripción)
        let btnWsp = '';
        if (tel) {
            const num = tel.replace(/\D/g, ''); // Solo números
            btnWsp = `
                <a href="https://wa.me/549${num}" target="_blank" onclick="event.stopPropagation()" 
                   class="inline-block mt-2 border border-green-500 text-green-600 text-[10px] font-bold px-2 py-1 rounded hover:bg-green-50 transition">
                    <i class="fa-brands fa-whatsapp"></i> Pedir Turno
                </a>`;
        }

        // 3. Crear Tarjeta en la Lista
        // Nota: Agregué onclick para que el mapa se mueva al hacer clic en la tarjeta
        contenedor.innerHTML += `
            <div class="flex items-start bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-orange-400 hover:shadow-md transition cursor-pointer group" 
                 onclick="centrarMapa(${c.ubicacionLat}, ${c.ubicacionLon})">
                
                <div class="bg-white text-center px-3 py-2 rounded-lg shadow-sm border border-gray-200 mr-4 group-hover:border-orange-200">
                    <span class="block text-2xl font-bold text-orange-600 leading-none">${dia}</span>
                    <span class="block text-[10px] font-bold text-gray-500">${mes}</span>
                </div>
                
                <div class="flex-1">
                    <h4 class="font-bold text-gray-800 leading-tight text-sm">${c.titulo}</h4>
                    <p class="text-xs text-gray-500 mt-1">
                        <i class="fa-regular fa-clock mr-1"></i> ${horarioTexto}
                    </p>
                    <p class="text-xs text-gray-600 mt-1 line-clamp-2">${descReal}</p>
                    ${btnWsp}
                </div>
            </div>
        `;
    });
}

// Función auxiliar para mover el mapa suavemente
function centrarMapa(lat, lon) {
    if(mapCampanas) {
        mapCampanas.flyTo([lat, lon], 16, { duration: 1.5 });
    }
}