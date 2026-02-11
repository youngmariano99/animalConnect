// js/clinica-wizard.js

let currentStep = 1;
const totalSteps = 3;
let mapWizard, markerWizard, coordsSelected;
const user = getUsuario();

if (!user || user.rol !== 'Veterinario') {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    AppState.onReady((loc) => {
        initMap(loc);
    });
    actualizarPreviewHorario();
    
    // Listeners para actualizar preview de horario en tiempo real
    const inputsHorario = document.querySelectorAll('#step-3 input, #step-3 select');
    inputsHorario.forEach(inp => inp.addEventListener('change', actualizarPreviewHorario));
});

// --- LÓGICA DE PASOS ---
function cambiarPaso(delta) {
    // Validaciones antes de avanzar
    if (delta > 0) {
        if (currentStep === 1) {
            const nombre = document.getElementById('cli-nombre').value;
            const tel = document.getElementById('cli-tel').value;
            if (!nombre || !tel) return Swal.fire('Faltan datos', 'Completa nombre y teléfono.', 'warning');
        }
        if (currentStep === 2) {
            if (!coordsSelected) return Swal.fire('Ubicación', 'Por favor marca la ubicación en el mapa.', 'warning');
        }
    }

    // Ocultar paso actual
    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    
    // Actualizar índice
    currentStep += delta;
    
    // Mostrar nuevo paso
    document.getElementById(`step-${currentStep}`).classList.remove('hidden');

    // Actualizar barra e indicadores
    actualizarUI();

    // Si entramos al mapa, redibujarlo (bug clásico de Leaflet en tabs ocultos)
    if (currentStep === 2) {
        setTimeout(() => mapWizard.invalidateSize(), 200);
    }
}

function actualizarUI() {
    // Barra de progreso
    const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    document.getElementById('progress-bar').style.width = `${percent}%`;

    // Botones
    document.getElementById('btn-prev').disabled = (currentStep === 1);
    
    if (currentStep === totalSteps) {
        document.getElementById('btn-next').classList.add('hidden');
        document.getElementById('btn-submit').classList.remove('hidden');
    } else {
        document.getElementById('btn-next').classList.remove('hidden');
        document.getElementById('btn-submit').classList.add('hidden');
    }

    // Bolitas indicadores
    for (let i = 1; i <= totalSteps; i++) {
        const ind = document.getElementById(`step-ind-${i}`);
        if (i < currentStep) {
            ind.className = "w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold transition-all shadow-sm";
            ind.innerHTML = '<i class="fa-solid fa-check"></i>';
        } else if (i === currentStep) {
            ind.className = "w-10 h-10 bg-white border-2 border-orange-500 text-orange-600 rounded-full flex items-center justify-center font-bold transition-all shadow-lg scale-110";
            ind.innerHTML = i;
        } else {
            ind.className = "w-10 h-10 bg-white border-2 border-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold transition-all shadow-sm";
            ind.innerHTML = i;
        }
    }
}

// --- MAPA ---
function initMap(loc) {
    if (mapWizard) return;
    mapWizard = L.map('map-wizard').setView([loc.lat, loc.lng], 14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapWizard);
    
    // Icono Farmacia
    const iconVet = L.divIcon({
        html: '<i class="fa-solid fa-location-dot text-4xl text-orange-600 drop-shadow-md"></i>',
        className: 'bg-transparent border-none',
        iconSize: [30, 40],
        iconAnchor: [15, 40]
    });

    mapWizard.on('click', e => {
        coordsSelected = e.latlng;
        if (markerWizard) markerWizard.setLatLng(e.latlng);
        else markerWizard = L.marker(e.latlng, {icon: iconVet}).addTo(mapWizard);
        
        document.getElementById('coords-msg').innerText = "Ubicación marcada correctamente";
        document.getElementById('coords-msg').classList.replace('text-orange-600', 'text-green-600');
    });
}

// --- HORARIOS ---
function toggleCorte(tipo) {
    const boxTarde = document.getElementById('box-tarde');
    if (tipo === 'corrido') boxTarde.classList.add('hidden');
    else boxTarde.classList.remove('hidden');
    actualizarPreviewHorario();
}

function actualizarPreviewHorario() {
    const dias = document.getElementById('h-dias').value;
    const tipo = document.getElementById('h-tipo').value;
    const t1s = document.getElementById('h-t1-start').value;
    const t1e = document.getElementById('h-t1-end').value;
    
    let texto = `${dias}: ${t1s} - ${t1e}hs`;
    
    if (tipo === 'cortado') {
        const t2s = document.getElementById('h-t2-start').value;
        const t2e = document.getElementById('h-t2-end').value;
        texto += ` / ${t2s} - ${t2e}hs`;
    } else {
        texto += " (Corrido)";
    }
    
    document.getElementById('h-preview').innerText = texto;
}

// --- ENVÍO ---
async function finalizarWizard(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Guardando...';
    btn.disabled = true;

    const clinicaDto = {
        usuarioId: user.id,
        nombre: document.getElementById('cli-nombre').value,
        telefono: document.getElementById('cli-tel').value,
        direccion: document.getElementById('cli-dir').value,
        latitud: coordsSelected.lat,
        longitud: coordsSelected.lng,
        horarios: document.getElementById('h-preview').innerText
    };

    try {
        const res = await fetch(`${API_URL}/Clinicas`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(clinicaDto)
        });

        if (res.ok) {
            await Swal.fire({
                title: '¡Clínica Creada!',
                text: 'Tu consultorio ya aparece en el mapa.',
                icon: 'success',
                confirmButtonText: 'Ir a mi Perfil'
            });
            window.location.href = 'perfil.html';
        } else {
            const txt = await res.text();
            Swal.fire('Error', 'No se pudo crear: ' + txt, 'error');
            btn.innerHTML = 'Confirmar Alta';
            btn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Fallo de conexión.', 'error');
        btn.innerHTML = 'Confirmar Alta';
        btn.disabled = false;
    }
}