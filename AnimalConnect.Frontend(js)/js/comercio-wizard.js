// js/comercio-wizard.js

let currentStep = 1;
const totalSteps = 3;
let mapWizard, markerWizard, coordsSelected;
const user = getUsuario();
let rubrosSeleccionados = [];

// Validación de Acceso
document.addEventListener('DOMContentLoaded', () => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    AppState.onReady((loc) => {
        initMap(loc);
    });
});

// --- NAVEGACIÓN DE PASOS ---
function cambiarPaso(delta) {
    // Validaciones antes de avanzar
    if (delta > 0) {
        if (!validarPaso(currentStep)) return;
    }

    // Ocultar actual
    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    
    currentStep += delta;
    
    // Mostrar nuevo
    document.getElementById(`step-${currentStep}`).classList.remove('hidden');

    // Actualizar UI (Barra y Botones)
    actualizarUI();

    // Fix Map Size (Leaflet bug en hidden tabs)
    if (currentStep === 2) {
        setTimeout(() => {
            if (mapWizard) mapWizard.invalidateSize();
        }, 200);
    }
}

function validarPaso(step) {
    if (step === 1) {
        const nombre = document.getElementById('com-nombre').value;
        const tel = document.getElementById('com-tel').value;
        if (!nombre || !tel) {
            Swal.fire('Faltan datos', 'Nombre y Teléfono son obligatorios.', 'warning');
            return false;
        }
    }
    if (step === 2) {
        if (!coordsSelected) {
            Swal.fire('Ubicación', 'Por favor marca la ubicación en el mapa.', 'warning');
            return false;
        }
    }
    return true;
}

function actualizarUI() {
    // Barra de Progreso
    const percent = ((currentStep) / (totalSteps)) * 100;
    document.getElementById('progress-bar').style.width = `${percent}%`;

    // Botones
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnSubmit = document.getElementById('btn-submit');

    if (currentStep === 1) btnPrev.classList.add('hidden');
    else btnPrev.classList.remove('hidden');

    if (currentStep === totalSteps) {
        btnNext.classList.add('hidden');
        btnSubmit.classList.remove('hidden');
    } else {
        btnNext.classList.remove('hidden');
        btnSubmit.classList.add('hidden');
    }
}

// --- MAPA ---
function initMap(loc) {
    if (mapWizard) return; // Evitar doble init
    
    mapWizard = L.map('map-wizard').setView([loc.lat, loc.lng], 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapWizard);

    const iconShop = L.divIcon({
        html: '<i class="fa-solid fa-store text-4xl text-orange-600 drop-shadow-md"></i>',
        className: 'bg-transparent border-none',
        iconSize: [30, 40],
        iconAnchor: [15, 40]
    });

    mapWizard.on('click', e => {
        coordsSelected = e.latlng;
        if (markerWizard) markerWizard.setLatLng(e.latlng);
        else markerWizard = L.marker(e.latlng, {icon: iconShop}).addTo(mapWizard);
        
        const msg = document.getElementById('coords-msg');
        msg.innerHTML = '<i class="fa-solid fa-check-circle mr-1"></i> Ubicación guardada';
        msg.className = "text-center text-sm font-bold text-green-600 bg-green-50 py-2 rounded-lg border border-green-100";
    });
}

// --- RUBROS ---
function toggleRubro(element) {
    const val = element.getAttribute('data-val');
    
    if (rubrosSeleccionados.includes(val)) {
        // Deseleccionar
        rubrosSeleccionados = rubrosSeleccionados.filter(r => r !== val);
        element.classList.remove('bg-orange-100', 'border-orange-500');
        element.querySelector('i').classList.replace('text-orange-600', 'text-gray-400');
    } else {
        // Seleccionar
        rubrosSeleccionados.push(val);
        element.classList.add('bg-orange-100', 'border-orange-500');
        element.querySelector('i').classList.replace('text-gray-400', 'text-orange-600');
    }
}

// --- ENVÍO AL BACKEND ---
async function finalizarWizard() {
    if (rubrosSeleccionados.length === 0) {
        Swal.fire('Rubros', 'Selecciona al menos una categoría.', 'warning');
        return;
    }

    const btn = document.getElementById('btn-submit');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Guardando...';
    btn.disabled = true;

    // Armar Objeto DTO
    const comercioDto = {
        usuarioId: user.id,
        nombre: document.getElementById('com-nombre').value,
        descripcion: document.getElementById('com-desc').value,
        telefono: document.getElementById('com-tel').value,
        direccion: document.getElementById('com-dir').value,
        logoUrl: document.getElementById('com-logo').value,
        latitud: coordsSelected.lat,
        longitud: coordsSelected.lng,
        etiquetas: rubrosSeleccionados.join(','), // "Alimento,Juguetes"
        nivelPlan: 0 // Free por defecto
    };

    try {
        const res = await fetch(`${API_URL}/Comercios`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(comercioDto)
        });

        if (res.ok) {
            await Swal.fire({
                title: '¡Comercio Creado!',
                text: 'Tu tienda ya es parte de AnimalConnect.',
                icon: 'success',
                confirmButtonText: 'Ir a mi Panel'
            });
            window.location.href = 'perfil.html'; // Deberíamos enviarlo a 'panel-comercio.html' en el futuro
        } else {
            const txt = await res.text();
            throw new Error(txt);
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo crear el comercio. Intenta nuevamente.', 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}