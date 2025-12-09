using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClinicasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClinicasController(ApplicationDbContext context)
        {
            _context = context;
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

            var nuevaClinica = new Clinica
            {
                Nombre = dto.Nombre,
                Direccion = dto.Direccion,
                Telefono = dto.Telefono,
                Latitud = dto.Latitud,
                Longitud = dto.Longitud,
                HorariosEstructurados = dto.Horarios, // Texto simple por ahora
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