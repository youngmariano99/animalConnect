// js/hogar-wizard.js

let currentStep = 1;
const totalSteps = 3;
let mapHogar, markerHogar, coordsSelected = null;
const user = getUsuario();

// Validación inicial
if (!user) window.location.href = 'login.html';

document.addEventListener('DOMContentLoaded', () => {
    AppState.onReady((loc) => {
        initMap(loc);
    });
});

function cambiarPaso(delta) {
    // Validaciones
    if (delta > 0) {
        if (currentStep === 1) {
            if (!document.getElementById('h-direccion').value) return Swal.fire('Falta Dirección', 'Escribe una referencia de barrio o calle.', 'warning');
            if (!coordsSelected) return Swal.fire('Falta Ubicación', 'Por favor marca tu casa en el mapa.', 'warning');
        }
    }

    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    currentStep += delta;
    document.getElementById(`step-${currentStep}`).classList.remove('hidden');

    actualizarUI();
}

function actualizarUI() {
    // Barra
    const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    document.getElementById('progress-bar').style.width = `${percent}%`;

    // Indicadores
    for (let i = 1; i <= totalSteps; i++) {
        const ind = document.getElementById(`ind-${i}`);
        if (i <= currentStep) {
            ind.className = "w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all";
        } else {
            ind.className = "w-8 h-8 bg-white border-2 border-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm";
        }
    }

    // Botones
    document.getElementById('btn-prev').disabled = (currentStep === 1);
    
    if (currentStep === totalSteps) {
        document.getElementById('btn-next').classList.add('hidden');
        document.getElementById('btn-submit').classList.remove('hidden');
    } else {
        document.getElementById('btn-next').classList.remove('hidden');
        document.getElementById('btn-submit').classList.add('hidden');
    }
}

function initMap(loc) {
    if (mapHogar) return;
    mapHogar = L.map('map-hogar').setView([loc.lat, loc.lng], 15); // Zoom cercano para casas
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapHogar);
    
    const iconHome = L.divIcon({
        html: '<i class="fa-solid fa-house-chimney text-3xl text-teal-600 drop-shadow-md"></i>',
        className: 'bg-transparent',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });

    mapHogar.on('click', e => {
        coordsSelected = e.latlng;
        if (markerHogar) markerHogar.setLatLng(e.latlng);
        else markerHogar = L.marker(e.latlng, {icon: iconHome}).addTo(mapHogar);
        
        document.getElementById('coords-msg').innerText = "Ubicación marcada correctamente";
        document.getElementById('coords-msg').className = "text-center text-xs text-green-600 font-bold mt-2";
    });
}

async function finalizarHogarWizard(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creando...';
    btn.disabled = true;

    // Recopilar datos
    const dto = {
        usuarioId: user.id,
        direccion: document.getElementById('h-direccion').value,
        latitud: coordsSelected.lat,
        longitud: coordsSelected.lng,
        
        tipoVivienda: document.querySelector('input[name="tipo"]:checked').value,
        tienePatio: document.getElementById('chk-patio').checked,
        tieneMascotas: document.getElementById('chk-mascotas').checked,
        tieneNinos: document.getElementById('chk-ninos').checked,
        
        disponibilidad: parseInt(document.querySelector('input[name="disp"]:checked').value),
        tiempo: document.getElementById('sel-tiempo').value,
        cuidadosEsp: document.getElementById('chk-cuidados').checked
    };

    try {
        const res = await fetch(`${API_URL}/Hogares`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(dto)
        });

        if (res.ok) {
            await Swal.fire({
                title: '¡Hogar Registrado!',
                text: 'Gracias por abrir las puertas de tu casa. Las organizaciones podrán contactarte cuando lo necesiten.',
                icon: 'success',
                confirmButtonColor: '#0d9488'
            });
            window.location.href = 'perfil.html';
        } else {
            const txt = await res.text();
            Swal.fire('Error', 'No se pudo registrar: ' + txt, 'error');
            btn.innerHTML = 'Confirmar y Unirme';
            btn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Fallo de conexión.', 'error');
        btn.innerHTML = 'Confirmar y Unirme';
        btn.disabled = false;
    }
}