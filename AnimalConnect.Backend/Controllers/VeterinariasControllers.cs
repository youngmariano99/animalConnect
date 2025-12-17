using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;
using AnimalConnect.Backend.Services;

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VeterinariasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VeterinariasController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Veterinarias (Para el Mapa)
       [HttpGet]
        public async Task<ActionResult> GetVeterinarias([FromQuery] double? lat, [FromQuery] double? lng, [FromQuery] double radio = 20)
        {
            var query = _context.Clinicas
                .Include(c => c.Dueño)
                .Where(c => c.Dueño != null && c.Dueño.EstadoVerificacion == "Aprobado");

            var lista = await query.ToListAsync();
            
            // --- [NUEVO] VALIDACIÓN DE 24HS ---
            bool huboCambios = false;
            foreach (var clinica in lista)
            {
                if (clinica.EsDeTurno && clinica.FechaInicioTurno.HasValue)
                {
                    // Si pasaron más de 24 horas desde el inicio del turno
                    if (DateTime.Now > clinica.FechaInicioTurno.Value.AddHours(24))
                    {
                        clinica.EsDeTurno = false;
                        clinica.FechaInicioTurno = null;
                        huboCambios = true;
                    }
                }
            }

            // Si desactivamos alguna clínica vencida, guardamos los cambios en la BD
            if (huboCambios) 
            {
                await _context.SaveChangesAsync();
            }
            // -----------------------------------

            var resultado = lista.Select(c => new
            {
                c.Id,
                NombreVeterinaria = c.Nombre,
                c.Direccion,
                TelefonoProfesional = c.Telefono,
                HorariosAtencion = c.HorariosEstructurados,
                c.LogoUrl,
                c.Latitud,
                c.Longitud,
                c.EsDeTurno,
                // Calculamos cuándo vence para mostrarlo en el front si quieres
                VenceTurno = c.EsDeTurno && c.FechaInicioTurno.HasValue ? c.FechaInicioTurno.Value.AddHours(24) : (DateTime?)null,
                MatriculaProfesional = c.Dueño?.MatriculaProfesional ?? "N/A",
                DistanciaKm = (lat.HasValue && lng.HasValue) 
                    ? GeoService.CalcularDistanciaKm(lat.Value, lng.Value, c.Latitud, c.Longitud) 
                    : 0
            });

            if (lat.HasValue && lng.HasValue)
            {
                resultado = resultado.Where(v => v.DistanciaKm <= radio).ToList();
            }

            return Ok(resultado);
        }

        // PUT: Establecer Turno (Sobre una CLÍNICA, no sobre una persona)
        [HttpPut("turno/{id}")]
        public async Task<IActionResult> SetTurno(int id)
        {
            var todas = await _context.Clinicas.ToListAsync();
            var seleccionada = todas.FirstOrDefault(c => c.Id == id);

            if (seleccionada == null) return NotFound("Clínica no encontrada.");

            // Si ya estaba de turno, lo apagamos
            if (seleccionada.EsDeTurno)
            {
                seleccionada.EsDeTurno = false;
                seleccionada.FechaInicioTurno = null; // [NUEVO] Limpiamos fecha
                await _context.SaveChangesAsync();
                return Ok(new { message = $"Se desactivó el turno de {seleccionada.Nombre}." });
            }

            // Apagamos todas las demás (Regla de "Solo una de turno")
            // Nota: Si quieres permitir múltiples de turno en distintas ciudades, 
            // deberías filtrar 'todas' por la ciudad de la seleccionada. 
            // Por ahora mantenemos la lógica global/regional actual.
            foreach (var c in todas) 
            {
                c.EsDeTurno = false;
                c.FechaInicioTurno = null;
            }

            // Prendemos la seleccionada
            seleccionada.EsDeTurno = true;
            seleccionada.FechaInicioTurno = DateTime.Now; // [NUEVO] Guardamos hora actual
            
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Ahora {seleccionada.Nombre} está de turno por 24hs." });
        }
    }
}