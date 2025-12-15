// js/panel-ong.js

let mapOng, userLocation;
let markersGroup = L.layerGroup();
let filtros = { patio: false, cuidados: false, sinMascotas: false, sinNinos: false, radio: 10 };
let currentOngId = null; // Guardaremos el ID de la ONG aprobada
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

document.addEventListener('click', (e) => {
    if(!e.target.closest('#search-user')) {
        document.getElementById('search-results').classList.add('hidden');
    }
});

async function verificarAccesoOng() {
    try {
        const res = await fetch(`${API_URL}/Organizaciones/mis-ongs/${user.id}`);
        const ongs = await res.json();
        const aprobada = ongs.find(o => o.estadoVerificacion === 'Aprobado');
        
        if (!aprobada) {
            bloquearAcceso("No tienes ninguna organización aprobada.");
            return;
        }

        // --- VALIDACIÓN DE ROL MEJORADA (Manejo de Mayúsculas/Minúsculas) ---
        // Algunos servidores devuelven 'Rol', otros 'rol'. Verificamos ambos.
        const rolRaw = aprobada.rol || aprobada.Rol || ''; 
        const rol = rolRaw.toLowerCase(); 

        console.log("Rol detectado:", rol); // Para depurar en consola (F12)

        if (rol !== 'admin' && rol !== 'creador') {
            bloquearAcceso(`Tu rol es '${rolRaw}'. Se requiere Admin o Creador.`);
            return;
        }

        // --- SI PASA LA SEGURIDAD ---
        currentOngId = aprobada.id;
        document.getElementById('ong-nombre-header').innerText = aprobada.nombre;
        
        // 1. Mostrar la pantalla
        const layout = document.getElementById('layout-principal');
        layout.classList.remove('hidden');

        // 2. CORRECCIÓN DEL MAPA (IMPORTANTE)
        // Le damos 100ms para que el navegador renderice el div y luego ajustamos el mapa
        setTimeout(() => {
            if (mapOng) mapOng.invalidateSize();
        }, 100);

        cargarMiembros(); 
    } catch (e) { 
        console.error(e);
        bloquearAcceso("Error de conexión.");
    }
}

function bloquearAcceso(mensaje) {
    // Ocultar todo por si acaso
    document.getElementById('layout-principal').classList.add('hidden');
    
    Swal.fire({
        icon: 'error',
        title: 'Acceso Restringido',
        text: mensaje,
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonText: 'Volver al Perfil',
        confirmButtonColor: '#7e22ce'
    }).then(() => {
        window.location.href = 'perfil.html';
    });
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

// --- PESTAÑAS ---
// 2. UX: Ocultar Filtros en Pestaña Equipo
function cambiarTab(tab) {
    const sidebar = document.getElementById('sidebar-filtros');
    const viewMapa = document.getElementById('view-mapa');
    const viewEquipo = document.getElementById('view-equipo');
    
    // Botones del Navbar
    const btnMapa = document.getElementById('tab-mapa');
    const btnEquipo = document.getElementById('tab-equipo');

    // Estilos de estado activo/inactivo
    const claseActiva = "px-3 py-1 bg-white text-purple-800 rounded shadow-sm font-bold text-xs transition flex items-center";
    const claseInactiva = "px-3 py-1 text-purple-200 hover:bg-white/10 rounded font-bold text-xs transition flex items-center";

    if(tab === 'mapa') {
        // Mostrar Mapa y Filtros
        sidebar.classList.remove('hidden'); 
        viewMapa.classList.remove('hidden');
        viewEquipo.classList.add('hidden');
        
        // Actualizar botones
        btnMapa.className = claseActiva;
        btnEquipo.className = claseInactiva;
    } else {
        // Mostrar Equipo (Ocultar Sidebar lateral)
        sidebar.classList.add('hidden');
        viewMapa.classList.add('hidden');
        viewEquipo.classList.remove('hidden');
        
        // Actualizar botones
        btnEquipo.className = claseActiva;
        btnMapa.className = claseInactiva;
    }
}

// --- GESTIÓN DE MIEMBROS ---

async function cargarMiembros() {
    if(!currentOngId) return;
    const tbody = document.getElementById('lista-miembros');
    
    try {
        const res = await fetch(`${API_URL}/Organizaciones/${currentOngId}/miembros`);
        const miembros = await res.json();
        
        document.getElementById('count-miembros').innerText = miembros.length;
        tbody.innerHTML = '';

        miembros.forEach(m => {
            const esCreador = m.rolEnOrganizacion === 'Creador';
            // Badge visual del rol
            let badgeColor = m.rolEnOrganizacion === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
            if(esCreador) badgeColor = 'bg-yellow-100 text-yellow-700';

            tbody.innerHTML += `
                <tr class="hover:bg-gray-50">
                    <td class="p-4 font-medium text-gray-800">${m.nombreUsuario}</td>
                    <td class="p-4">
                        <span class="${badgeColor} text-xs font-bold px-2 py-1 rounded uppercase">${m.rolEnOrganizacion}</span>
                    </td>
                    <td class="p-4 text-right">
                        ${!esCreador ? `
                        <button onclick="eliminarMiembro(${m.id})" class="text-gray-400 hover:text-red-500 transition" title="Eliminar">
                            <i class="fa-solid fa-trash"></i>
                        </button>` : ''}
                    </td>
                </tr>
            `;
        });
    } catch(e) { console.error(e); }
}

// Búsqueda de usuarios en tiempo real
let debounceTimer;
function buscarUsuarios(query) {
    const resultsDiv = document.getElementById('search-results');
    clearTimeout(debounceTimer);
    
    if(query.length < 3) {
        resultsDiv.classList.add('hidden');
        return;
    }

    debounceTimer = setTimeout(async () => {
        try {
            const res = await fetch(`${API_URL}/Organizaciones/buscar-usuarios?query=${query}`);
            if(res.ok) {
                const usuarios = await res.json();
                renderResultadosBusqueda(usuarios);
            }
        } catch(e) { console.error(e); }
    }, 300);
}

function renderResultadosBusqueda(usuarios) {
    const div = document.getElementById('search-results');
    div.innerHTML = '';
    div.classList.remove('hidden');

    if(usuarios.length === 0) {
        div.innerHTML = '<div class="p-3 text-sm text-gray-500 text-center">No se encontraron usuarios.</div>';
        return;
    }

    usuarios.forEach(u => {
        const item = document.createElement('div');
        item.className = "p-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 flex justify-between items-center group";
        item.innerHTML = `
            <span class="font-bold text-gray-700 text-sm">${u.nombreUsuario}</span>
            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button onclick="agregarMiembro(${u.id}, 'Voluntario')" class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 font-bold">
                    + Voluntario
                </button>
                <button onclick="agregarMiembro(${u.id}, 'Admin')" class="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded hover:bg-purple-200 font-bold">
                    + Admin
                </button>
            </div>
        `;
        div.appendChild(item);
    });
}

async function agregarMiembro(usuarioId, rol) {
    const dto = {
        ongId: currentOngId,
        usuarioId: usuarioId,
        rol: rol
    };

    try {
        const res = await fetch(`${API_URL}/Organizaciones/agregar-miembro`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(dto)
        });

        if(res.ok) {
            const Toast = Swal.mixin({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
            });
            Toast.fire({ icon: 'success', title: 'Miembro agregado' });
            
            document.getElementById('search-user').value = '';
            document.getElementById('search-results').classList.add('hidden');
            cargarMiembros(); // Recargar tabla
        } else {
            Swal.fire('Error', await res.text(), 'error');
        }
    } catch(e) { console.error(e); }
}

async function eliminarMiembro(id) {
    if(!confirm("¿Estás seguro de eliminar a este miembro?")) return;
    
    try {
        const res = await fetch(`${API_URL}/Organizaciones/eliminar-miembro/${id}`, { method: 'DELETE' });
        if(res.ok) {
            cargarMiembros();
        }
    } catch(e) { console.error(e); }
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