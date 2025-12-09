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
            // Buscamos en la tabla CLINICAS, pero filtramos por dueños APROBADOS
            var query = _context.Clinicas
                .Include(c => c.Dueño) // Incluimos al dueño para verificar estado
                .Where(c => c.Dueño != null && c.Dueño.EstadoVerificacion == "Aprobado");

            var lista = await query.ToListAsync();

            var resultado = lista.Select(c => new
            {
                c.Id,
                NombreVeterinaria = c.Nombre, // Mapeamos al nombre que espera el frontend
                c.Direccion,
                TelefonoProfesional = c.Telefono,
                HorariosAtencion = c.HorariosEstructurados, // Mapeo temporal
                c.LogoUrl,
                c.Latitud,
                c.Longitud,
                c.EsDeTurno,
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

            if (seleccionada.EsDeTurno)
            {
                seleccionada.EsDeTurno = false;
                await _context.SaveChangesAsync();
                return Ok(new { message = $"Se desactivó el turno de {seleccionada.Nombre}." });
            }

            // Apagamos todas, prendemos una
            foreach (var c in todas) c.EsDeTurno = false;
            seleccionada.EsDeTurno = true;
            
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Ahora {seleccionada.Nombre} está de turno." });
        }
    }
}