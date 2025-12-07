// js/admin.js

// Variables globales
let mapHeat = null, mapAlta = null, markerAlta = null, mapCamp = null, markerCamp = null;
let coordsAlta = null, coordsCamp = null;
let chartInstance = null;

// Obtener usuario logueado de forma segura
const usuarioAdmin = JSON.parse(localStorage.getItem('zoonosis_user'));

// --- SEGURIDAD ---
if (!usuarioAdmin) {
    window.location.href = 'login.html';
} else if (usuarioAdmin.rol !== 'Municipio' && usuarioAdmin.rol !== 'Administrador') {
    // Si no es admin ni municipio, lo sacamos
    Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para ver este panel.',
        confirmButtonColor: '#d33'
    }).then(() => {
        window.location.href = 'index.html';
    });
}

function cerrarSesion() {
    localStorage.removeItem('zoonosis_user');
    window.location.href = 'login.html';
}

// Init global
document.addEventListener('DOMContentLoaded', () => {
    // Cargamos dashboard por defecto
    cargarDashboard();
});

// --- NAVEGACIÓN ---
function cambiarVista(vista) {
    // 1. Ocultar todas las vistas y resetear estilos de nav
    ['dashboard', 'ingreso', 'campanas', 'profesionales'].forEach(v => {
        const elView = document.getElementById(`view-${v}`);
        const elNav = document.getElementById(`nav-${v}`);
        if (elView) elView.classList.add('hidden');
        if (elNav) elNav.className = "w-full text-left py-2.5 px-4 rounded hover:bg-gray-800 text-gray-400 transition";
    });

    // 2. Mostrar vista seleccionada y activar estilo nav
    const viewToShow = document.getElementById(`view-${vista}`);
    const navToActive = document.getElementById(`nav-${vista}`);
    
    if (viewToShow) viewToShow.classList.remove('hidden');
    if (navToActive) navToActive.className = "w-full text-left py-2.5 px-4 rounded bg-orange-600 text-white transition";

    // 3. Ejecutar lógica específica de la vista
    if (vista === 'dashboard') cargarDashboard();
    if (vista === 'ingreso') initMapAlta();
    if (vista === 'campanas') initMapCampana();
    if (vista === 'profesionales') cargarModuloProfesionales();
}

// ==========================================
// 1. MÓDULO DASHBOARD
// ==========================================
async function cargarDashboard() {
    try {
        // Cargar Estadísticas
        const resStats = await fetch(`${API_URL}/Admin/dashboard-stats/${usuarioAdmin.id}`);
        
        if (resStats.ok) {
            const stats = await resStats.json();
            
            document.getElementById('total-count').innerText = stats.totalReportes;
            document.getElementById('dog-count').innerText = stats.perros;
            document.getElementById('cat-count').innerText = stats.gatos;
            document.getElementById('lost-count').innerText = stats.perdidosActivos;

            renderizarHeatmap(stats.puntosCalor);
            renderizarGrafico(stats.perros, stats.gatos);
        }

        // Cargar Tabla de Registros
        const resTabla = await fetch(`${API_URL}/Admin/animales-zona/${usuarioAdmin.id}`);
        if (resTabla.ok) {
            const lista = await resTabla.json();
            renderizarTabla(lista);
        }

    } catch(e) { console.error("Error dashboard", e); }
}

function renderizarHeatmap(puntos) {
    const container = document.getElementById('heatmap');
    if (!container || container.offsetWidth === 0) return;

    if (mapHeat) mapHeat.remove();
    
    // Centrar mapa (usamos el primer punto o un default)
    const centro = puntos.length > 0 ? [puntos[0].lat, puntos[0].lng] : [-38.416, -63.616];

    mapHeat = L.map('heatmap').setView(centro, 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapHeat);
    
    const heatData = puntos.map(p => [p.lat, p.lng, 0.8]);
    if (heatData.length) L.heatLayer(heatData, {radius: 25}).addTo(mapHeat);
}

function renderizarGrafico(perros, gatos) {
    const ctx = document.getElementById('speciesChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Perros', 'Gatos'],
            datasets: [{
                data: [perros, gatos], 
                backgroundColor: ['#f97316', '#22c55e'],
                borderWidth: 0
            }]
        },
        // --- AQUÍ ESTÁ EL ARREGLO VISUAL ---
        options: {
            responsive: true,
            maintainAspectRatio: false, // ¡Esto evita que el gráfico se haga gigante!
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, padding: 20 }
                }
            },
            cutout: '70%' // Hace el anillo más fino y elegante
        }
    });
}

function renderizarTabla(lista) {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '';
    
    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-500">No hay registros en tu jurisdicción.</td></tr>';
        return;
    }

    lista.slice(0, 10).forEach(a => {
        let estado = '<span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">Desconocido</span>';
        if (a.idEstado === 1) estado = '<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Adopción</span>';
        else if (a.idEstado === 2) estado = '<span class="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Perdido</span>';
        else if (a.idEstado === 3) estado = '<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Encontrado</span>';
        
        tbody.innerHTML += `
            <tr class="border-b hover:bg-gray-50">
                <td class="py-3 px-6 font-medium">${a.nombre}</td>
                <td class="py-3 px-6 text-xs text-gray-500">${a.descripcion.substring(0,30)}...</td>
                <td class="py-3 px-6">${estado}</td>
                <td class="py-3 px-6 text-center">
                    <button onclick="borrarAnimal(${a.id})" class="text-red-500 hover:text-red-700 transition" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

async function borrarAnimal(id) {
    const result = await Swal.fire({
        title: '¿Eliminar registro?',
        text: "Esta acción eliminará el registro de la base de datos.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch(`${API_URL}/Animales/${id}`, { method: 'DELETE' });
            if(res.ok) {
                Swal.fire('¡Eliminado!', 'El registro ha sido borrado.', 'success');
                cargarDashboard();
            } else {
                Swal.fire('Error', 'No se pudo eliminar.', 'error');
            }
        } catch(e) {
            Swal.fire('Error', 'Error de conexión.', 'error');
        }
    }
}

// ==========================================
// 2. MÓDULO PROFESIONALES
// ==========================================
async function cargarModuloProfesionales() {
    cargarSolicitudes();
    cargarDirectorioActivo();
}

// A. Solicitudes de Ingreso
async function cargarSolicitudes() {
    try {
        const res = await fetch(`${API_URL}/Admin/solicitudes`);
        if (res.ok) {
            const lista = await res.json();
            renderizarSolicitudes(lista);
        }
    } catch (e) { console.error(e); }
}

function renderizarSolicitudes(lista) {
    const tbody = document.getElementById('solicitudes-table-body');
    const emptyMsg = document.getElementById('no-solicitudes');
    const badge = document.getElementById('badge-solicitudes');
    
    tbody.innerHTML = '';

    if (lista.length === 0) {
        emptyMsg.classList.remove('hidden');
        badge.classList.add('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        badge.classList.remove('hidden');
        lista.forEach(u => {
            tbody.innerHTML += `
                <tr class="border-b hover:bg-yellow-50 transition">
                    <td class="py-3 px-6">
                        <p class="font-bold text-gray-800">${u.nombreVeterinaria}</p>
                        <p class="text-xs text-gray-500">${u.matricula} | ${u.nombreUsuario}</p>
                    </td>
                    <td class="py-3 px-6 text-right space-x-2">
                        <button onclick="gestionarSolicitud(${u.id}, 'aprobar')" class="bg-green-100 text-green-700 hover:bg-green-200 py-1 px-3 rounded text-xs font-bold transition">
                            <i class="fa-solid fa-check"></i>
                        </button>
                        <button onclick="gestionarSolicitud(${u.id}, 'rechazar')" class="bg-red-100 text-red-700 hover:bg-red-200 py-1 px-3 rounded text-xs font-bold transition">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
}

async function gestionarSolicitud(id, accion) {
    const verbo = accion === 'aprobar' ? "Aprobar" : "Rechazar";
    const colorBtn = accion === 'aprobar' ? '#22c55e' : '#d33';

    const result = await Swal.fire({
        title: `¿${verbo} solicitud?`,
        text: `Estás a punto de ${verbo.toLowerCase()} el acceso a este profesional.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: colorBtn,
        cancelButtonColor: '#6b7280',
        confirmButtonText: `Sí, ${verbo.toLowerCase()}`,
        cancelButtonText: 'Cancelar'
    });

    if(!result.isConfirmed) return;

    try {
        const res = await fetch(`${API_URL}/Admin/${accion}/${id}`, { method: 'POST' });
        if(res.ok) {
            Swal.fire('¡Listo!', accion === 'aprobar' ? "Veterinario aprobado." : "Solicitud rechazada.", 'success');
            cargarSolicitudes();
        } else {
            Swal.fire('Error', 'Hubo un problema en el servidor.', 'error');
        }
    } catch(e) {
        Swal.fire('Error', 'Problema de conexión.', 'error');
    }
}

// B. Directorio y Turnos
async function cargarDirectorioActivo() {
    try {
        const res = await fetch(`${API_URL}/Veterinarias`); 
        if (res.ok) {
            const lista = await res.json();
            const tbody = document.getElementById('profesionales-table-body');
            tbody.innerHTML = '';

            lista.forEach(v => {
                const btnTurno = v.esDeTurno 
                    ? `<button onclick="setTurno(${v.id})" class="w-8 h-8 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition" title="Desactivar turno"><i class="fa-solid fa-power-off"></i></button>`
                    : `<button onclick="setTurno(${v.id})" class="w-8 h-8 rounded-full bg-gray-200 text-gray-400 hover:bg-green-200 hover:text-green-600 transition" title="Activar turno"><i class="fa-solid fa-power-off"></i></button>`;

                const estadoVisual = v.esDeTurno 
                    ? `<span class="bg-green-100 text-green-800 py-1 px-3 rounded-full text-xs font-bold border border-green-200 shadow-sm animate-pulse">🔴 ACTIVO</span>`
                    : `<span class="text-gray-400 text-xs">Inactivo</span>`;

                const logoHtml = v.logoUrl 
                    ? `<img src="${v.logoUrl}" class="w-10 h-10 rounded-full object-cover border">`
                    : `<div class="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center border"><i class="fa-solid fa-user-doctor"></i></div>`;

                tbody.innerHTML += `
                    <tr class="border-b hover:bg-gray-50 ${v.esDeTurno ? 'bg-green-50' : ''}">
                        <td class="py-3 px-4 text-center">${btnTurno}</td>
                        <td class="py-3 px-4">
                            <div class="flex items-center">
                                ${logoHtml}
                                <div class="ml-3">
                                    <p class="font-bold text-gray-800 text-sm">${v.nombreVeterinaria}</p>
                                    <p class="text-xs text-gray-500">${v.direccion}</p>
                                </div>
                            </div>
                        </td>
                        <td class="py-3 px-4 text-xs text-gray-600">
                            <div class="flex items-center gap-1 mb-1">
                                <i class="fa-brands fa-whatsapp text-green-600"></i> ${v.telefonoProfesional}
                            </div>
                            <div class="flex items-center gap-1">
                                <i class="fa-regular fa-clock text-gray-400"></i> ${v.horariosAtencion}
                            </div>
                        </td>
                        <td class="py-3 px-4 text-center">${estadoVisual}</td>
                    </tr>
                `;
            });
        }
    } catch (e) { console.error(e); }
}

async function setTurno(id) {
    const result = await Swal.fire({
        title: '¿Cambiar Guardia?',
        text: "¿Confirmas que esta veterinaria será la única activa de turno?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#22c55e',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
        const res = await fetch(`${API_URL}/Veterinarias/turno/${id}`, { method: 'PUT' });
        if(res.ok) {
            cargarDirectorioActivo();
            Swal.fire({
                icon: 'success',
                title: 'Actualizado',
                text: 'La veterinaria de turno ha sido asignada.',
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            Swal.fire('Error', 'No se pudo asignar el turno.', 'error');
        }
    } catch(e) { console.error(e); }
}

// ==========================================
// 3. MÓDULO INGRESO (ALTA DE PACIENTES)
// ==========================================
function toggleFormularioIngreso() {
    const estado = document.getElementById('alta-estado').value;
    const colAtributos = document.getElementById('columna-atributos');
    const btnSimple = document.getElementById('btn-guardar-simple');
    
    if (estado === "1") { // Adopción
        colAtributos.classList.remove('hidden');
        btnSimple.classList.add('hidden');
    } else { // Perdido/Encontrado
        colAtributos.classList.add('hidden');
        btnSimple.classList.remove('hidden');
    }
}

function initMapAlta() {
    setTimeout(() => {
        if(mapAlta) mapAlta.remove();
        mapAlta = L.map('map-alta').setView([-37.994, -61.353], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapAlta);
        
        mapAlta.on('click', e => {
            coordsAlta = e.latlng;
            if(markerAlta) markerAlta.setLatLng(e.latlng); 
            else markerAlta = L.marker(e.latlng).addTo(mapAlta);
            document.getElementById('alta-coords').innerText = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
        });
        toggleFormularioIngreso();
    }, 200);
}

async function guardarAnimalCompleto(e) {
    e.preventDefault();
    const btn = document.querySelector('button[type="submit"]:not(.hidden)');
    const btnTxt = btn.innerText;
    btn.innerText = "Procesando..."; btn.disabled = true;

    try {
        const fileInput = document.getElementById('alta-foto');
        let imgUrl = "";
        if(fileInput.files[0]) {
            const fd = new FormData(); fd.append('file', fileInput.files[0]);
            const resImg = await fetch(`${API_URL}/Archivos/subir`, {method:'POST', body:fd});
            const dataImg = await resImg.json();
            imgUrl = dataImg.url;
        }

        const estado = parseInt(document.getElementById('alta-estado').value);
        const nuevoAnimal = {
            nombre: document.getElementById('alta-nombre').value,
            descripcion: document.getElementById('alta-desc').value,
            edadAproximada: document.getElementById('alta-edad').value || "Desconocida",
            idEspecie: parseInt(document.getElementById('alta-especie').value),
            idEstado: estado,
            imagenUrl: imgUrl,
            // Si no hay coords, usamos default
            ubicacionLat: coordsAlta ? coordsAlta.lat : -37.994,
            ubicacionLon: coordsAlta ? coordsAlta.lng : -61.353,
            fechaPublicacion: new Date().toISOString(),
            atributos: []
        };

        if(estado === 1) {
            const add = (id, val) => nuevoAnimal.atributos.push({ atributoId: id, valor: val });
            add(1, parseInt(document.getElementById('alta-energia').value)); 
            add(2, document.getElementById('alta-patio').checked ? 1 : 0);
            add(3, document.getElementById('alta-ninos').checked ? 1 : 0);
            add(4, document.getElementById('alta-otros').checked ? 1 : 0);
            add(5, 2);
            add(6, parseInt(document.querySelector('input[name="alta-tamano"]:checked').value));
            add(7, parseInt(document.getElementById('alta-exp').value));
        }

        const res = await fetch(`${API_URL}/Animales`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(nuevoAnimal)
        });

        if(res.ok) {
            Swal.fire('¡Registrado!', 'El animal ha sido ingresado al sistema.', 'success');
            e.target.reset();
            if(markerAlta) { markerAlta.remove(); coordsAlta = null; }
            cambiarVista('dashboard');
        } else {
            Swal.fire('Error', 'No se pudo guardar el registro.', 'error');
        }
    } catch(err) {
        console.error(err);
        Swal.fire('Error', 'Error de conexión.', 'error');
    } finally {
        btn.innerText = btnTxt; btn.disabled = false;
    }
}

// ==========================================
// 4. MÓDULO CAMPAÑAS
// ==========================================
function initMapCampana() {
    setTimeout(() => {
        if(mapCamp) mapCamp.remove();
        mapCamp = L.map('map-picker').setView([-37.994, -61.353], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapCamp);
        mapCamp.on('click', e => {
            coordsCamp = e.latlng;
            if(markerCamp) markerCamp.setLatLng(e.latlng); else markerCamp = L.marker(e.latlng).addTo(mapCamp);
        });
        cargarCampanasAdmin();
    }, 200);
}

async function cargarCampanasAdmin() {
    const res = await fetch(`${API_URL}/Campanias`);
    if(res.ok) {
        const lista = await res.json();
        const div = document.getElementById('lista-campanas-admin');
        div.innerHTML = '';
        lista.forEach(c => {
            div.innerHTML += `
            <div class="p-3 border rounded flex justify-between items-center bg-gray-50 mb-2">
                <div>
                    <span class="font-bold text-orange-600 block">${new Date(c.fechaHora).toLocaleDateString()}</span>
                    <span class="text-sm font-bold text-gray-700">${c.titulo}</span>
                    <p class="text-xs text-gray-500 truncate w-40">${c.descripcion}</p>
                </div>
                <button onclick="borrarCampana(${c.id})" class="text-red-500 hover:text-red-700 transition"><i class="fa-solid fa-trash"></i></button>
            </div>`;
        });
    }
}

async function guardarCampana() {
    const titulo = document.getElementById('camp-titulo').value;
    const fecha = document.getElementById('camp-fecha').value;
    const fin = document.getElementById('camp-fin').value;
    const tel = document.getElementById('camp-tel').value;
    let desc = document.getElementById('camp-desc').value;

    if(!titulo || !fecha || !coordsCamp) { 
        return Swal.fire('Faltan datos', 'Completa Título, Fecha y marca la ubicación en el mapa.', 'warning');
    }
    if(fin) desc += ` | Fin: ${fin} hs`;
    if(tel) desc += ` | Turnos: ${tel}`;

    const nueva = { 
        titulo, fechaHora: fecha, descripcion: desc, 
        ubicacionLat: coordsCamp.lat, ubicacionLon: coordsCamp.lng 
    };
    
    const res = await fetch(`${API_URL}/Campanias`, {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(nueva)
    });
    
    if(res.ok) { 
        Swal.fire('¡Campaña Creada!', 'El operativo ha sido agendado.', 'success');
        document.getElementById('camp-titulo').value='';
        document.getElementById('camp-desc').value='';
        cargarCampanasAdmin(); 
    } else {
        Swal.fire('Error', 'No se pudo crear la campaña.', 'error');
    }
}

async function borrarCampana(id) {
    const result = await Swal.fire({
        title: '¿Borrar campaña?',
        text: "Se eliminará del calendario público.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, borrar'
    });

    if(result.isConfirmed) {
        await fetch(`${API_URL}/Campanias/${id}`, { method: 'DELETE' });
        cargarCampanasAdmin();
        Swal.fire('Eliminada', 'La campaña ha sido borrada.', 'success');
    }
}