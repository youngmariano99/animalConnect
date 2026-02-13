using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;
using AnimalConnect.Backend.Services; // ITurnosService
using NetTopologySuite.Geometries; 
using NetTopologySuite; 

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClinicasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ITurnosService _turnosService; // Injected Service

        public ClinicasController(ApplicationDbContext context, ITurnosService turnosService)
        {
            _context = context;
            _turnosService = turnosService;
        }

        // --- 1. FARMACIAS DE TURNO (Lazy Cleanup) ---
        // GET: api/Clinicas/de-turno?lat=-34.6&lon=-58.4&radio=10
        [HttpGet("de-turno")]
        public async Task<ActionResult<IEnumerable<Clinica>>> GetClinicasDeTurno(
            [FromQuery] double lat, 
            [FromQuery] double lon, 
            [FromQuery] double radio = 10)
        {
            var clinicas = await _turnosService.ObtenerClinicasDeTurno(lat, lon, radio);
            return Ok(clinicas);
        }

        // --- 2. ACTIVAR TURNO (Veterinario) ---
        [HttpPost("{id}/activar-turno")]
        public async Task<IActionResult> ActivarTurno(int id)
        {
             // TODO: Verificar que el usuario sea dueño de la clínica (Security)
            await _turnosService.MarcarComoDeTurno(id);
            return Ok(new { message = "Clínica marcada como de turno por 24hs." });
        }

        // GET: api/Clinicas/mis-clinicas/{usuarioId}
        [HttpGet("mis-clinicas/{usuarioId}")]
        public async Task<ActionResult<IEnumerable<Clinica>>> GetMisClinicas(int usuarioId)
        {
            // Buscamos el perfil del vet usando el usuarioId
            var perfil = await _context.PerfilesVeterinarios.FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);
            if (perfil == null) return NotFound("Perfil veterinario no encontrado.");

            return await _context.Clinicas
                                 .Where(c => c.PerfilVeterinarioId == perfil.Id)
                                 .ToListAsync();
        }

        // POST: api/Clinicas
        [HttpPost]
        public async Task<ActionResult<Clinica>> PostClinica(ClinicaDto dto)
        {
            var perfil = await _context.PerfilesVeterinarios.FirstOrDefaultAsync(p => p.UsuarioId == dto.UsuarioId);
            if (perfil == null) return BadRequest("Usuario no es veterinario.");

            // Create Point
            var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
            var ubicacion = geometryFactory.CreatePoint(new Coordinate(dto.Longitud, dto.Latitud));

            var nuevaClinica = new Clinica
            {
                Nombre = dto.Nombre,
                Direccion = dto.Direccion,
                Telefono = dto.Telefono,
                Ubicacion = ubicacion, 
                HorariosEstructurados = dto.Horarios, 
                PerfilVeterinarioId = perfil.Id,
                EsDeTurno = false
            };

            _context.Clinicas.Add(nuevaClinica);
            await _context.SaveChangesAsync();

            return Ok(nuevaClinica);
        }

        // DTO para recibir datos limpios del front
        public class ClinicaDto
        {
            public int UsuarioId { get; set; }
            public string Nombre { get; set; } = string.Empty;
            public string Direccion { get; set; } = string.Empty;
            public string Telefono { get; set; } = string.Empty;
            public double Latitud { get; set; }
            public double Longitud { get; set; }
            public string Horarios { get; set; } = string.Empty;
        }
    }
}