// js/ong-wizard.js

let currentStep = 1;
const totalSteps = 3;
let mapOng, markerOng, coordsSelected = null;
const user = getUsuario();

if (!user) window.location.href = 'login.html';

document.addEventListener('DOMContentLoaded', () => {
    AppState.onReady((loc) => {
        initMap(loc);
    });
});

function cambiarPaso(delta) {
    // Validaciones simples
    if (delta > 0) {
        if (currentStep === 1) {
            if (!document.getElementById('ong-nombre').value) 
                return Swal.fire('Falta Nombre', 'Indica el nombre de la organización.', 'warning');
        }
        if (currentStep === 2) {
            if (!document.getElementById('ong-tel').value) 
                return Swal.fire('Falta Contacto', 'Es necesario un teléfono de referencia.', 'warning');
        }
    }

    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    currentStep += delta;
    document.getElementById(`step-${currentStep}`).classList.remove('hidden');

    actualizarUI();

    if (currentStep === 3) setTimeout(() => mapOng.invalidateSize(), 200);
}

function actualizarUI() {
    const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    document.getElementById('progress-bar').style.width = `${percent}%`;

    document.getElementById('btn-prev').disabled = (currentStep === 1);
    
    if (currentStep === totalSteps) {
        document.getElementById('btn-next').classList.add('hidden');
        document.getElementById('btn-submit').classList.remove('hidden');
    } else {
        document.getElementById('btn-next').classList.remove('hidden');
        document.getElementById('btn-submit').classList.add('hidden');
    }

    // Actualizar bolitas
    for (let i = 1; i <= totalSteps; i++) {
        const ind = document.getElementById(`step-ind-${i}`);
        if (i <= currentStep) {
            ind.className = "w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-md transition-all";
        } else {
            ind.className = "w-10 h-10 bg-white border-2 border-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold shadow-sm";
        }
    }
}

function initMap(loc) {
    if (mapOng) return;
    mapOng = L.map('map-ong').setView([loc.lat, loc.lng], 14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapOng);
    
    mapOng.on('click', e => {
        coordsSelected = e.latlng;
        if (markerOng) markerOng.setLatLng(e.latlng);
        else markerOng = L.marker(e.latlng).addTo(mapOng);
        document.getElementById('coords-msg').innerText = "Ubicación marcada";
    });
}

async function finalizarOngWizard(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Guardando...';
    btn.disabled = true;

    const dto = {
        usuarioId: user.id,
        nombre: document.getElementById('ong-nombre').value,
        descripcion: document.getElementById('ong-desc').value,
        telefono: document.getElementById('ong-tel').value,
        email: document.getElementById('ong-email').value,
        redes: document.getElementById('ong-redes').value,
        ciudad: document.getElementById('ong-ciudad').value,
        barrio: document.getElementById('ong-barrio').value,
        latitud: coordsSelected ? coordsSelected.lat : null,
        longitud: coordsSelected ? coordsSelected.lng : null
    };

    try {
        const res = await fetch(`${API_URL}/Organizaciones/crear`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(dto)
        });

        if (res.ok) {
            await Swal.fire({
                title: '¡Solicitud Enviada!',
                text: 'Tu organización ha sido registrada. Un administrador la validará pronto.',
                icon: 'success'
            });
            window.location.href = 'perfil.html';
        } else {
            throw new Error(await res.text());
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo registrar la ONG.', 'error');
        btn.innerHTML = 'Registrar ONG';
        btn.disabled = false;
    }
}