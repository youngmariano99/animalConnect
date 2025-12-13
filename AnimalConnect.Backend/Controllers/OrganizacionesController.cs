using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrganizacionesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrganizacionesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // DTO para recibir datos limpios
        public class NuevaOrganizacionDto
        {
            public int UsuarioId { get; set; }
            public string Nombre { get; set; } = string.Empty;
            public string Descripcion { get; set; } = string.Empty;
            public string Telefono { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Redes { get; set; } = string.Empty;
            public string Barrio { get; set; } = string.Empty;
            public string Ciudad { get; set; } = string.Empty;
            // Lat/Lng opcionales
            public double? Latitud { get; set; }
            public double? Longitud { get; set; }
        }

        // POST: api/Organizaciones/crear
        [HttpPost("crear")]
        public async Task<IActionResult> CrearOrganizacion([FromBody] NuevaOrganizacionDto dto)
        {
            // 1. Crear el Perfil de la Organización
            var nuevaOng = new PerfilOrganizacion
            {
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                TelefonoContacto = dto.Telefono,
                EmailContacto = dto.Email,
                RedesSociales = dto.Redes,
                Barrio = dto.Barrio,
                Ciudad = dto.Ciudad,
                LatitudSede = dto.Latitud,
                LongitudSede = dto.Longitud,
                EstadoVerificacion = "Pendiente", // Requiere aprobación del municipio
                FechaRegistro = DateTime.Now
            };

            _context.PerfilesOrganizaciones.Add(nuevaOng);
            await _context.SaveChangesAsync(); // Guardamos para obtener el ID de la ONG

            // 2. Vincular al usuario creador como "Admin"
            var membresia = new MiembroOrganizacion
            {
                UsuarioId = dto.UsuarioId,
                PerfilOrganizacionId = nuevaOng.Id,
                RolEnOrganizacion = "Admin"
            };

            _context.MiembrosOrganizaciones.Add(membresia);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Organización creada. Pendiente de aprobación.", id = nuevaOng.Id });
        }

        // GET: api/Organizaciones/mis-ongs/{usuarioId}
        [HttpGet("mis-ongs/{usuarioId}")]
        public async Task<ActionResult> GetMisOrganizaciones(int usuarioId)
        {
            var ongs = await _context.MiembrosOrganizaciones
                                     .Include(m => m.Organizacion)
                                     .Where(m => m.UsuarioId == usuarioId)
                                     .Select(m => new {
                                         m.Organizacion.Id,
                                         m.Organizacion.Nombre,
                                         m.Organizacion.EstadoVerificacion,
                                         Rol = m.RolEnOrganizacion
                                     })
                                     .ToListAsync();
            return Ok(ongs);
        }
    }
}