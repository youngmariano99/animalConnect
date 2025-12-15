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

        // --- GESTIÓN DE MIEMBROS ---

        // 1. BUSCAR USUARIOS (Para invitar)
        // GET: api/Organizaciones/buscar-usuarios?query=juan
        [HttpGet("buscar-usuarios")]
        public async Task<ActionResult> BuscarUsuarios([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 3)
                return BadRequest("Escribe al menos 3 letras.");

            var usuarios = await _context.Usuarios
                .Where(u => u.NombreUsuario.ToLower().Contains(query.ToLower()))
                .Select(u => new { u.Id, u.NombreUsuario, u.Rol }) // Solo info pública
                .Take(5)
                .ToListAsync();

            return Ok(usuarios);
        }

        // 2. LISTAR MIEMBROS DE UNA ONG
        [HttpGet("{ongId}/miembros")]
        public async Task<ActionResult> GetMiembros(int ongId)
        {
            var miembros = await _context.MiembrosOrganizaciones
                .Include(m => m.Usuario)
                .Where(m => m.PerfilOrganizacionId == ongId)
                .Select(m => new {
                    m.Id, // Id de la membresía (para borrar)
                    m.UsuarioId,
                    NombreUsuario = m.Usuario.NombreUsuario,
                    m.RolEnOrganizacion // "Creador", "Admin", "Voluntario"
                })
                .ToListAsync();

            return Ok(miembros);
        }

        // 3. AGREGAR MIEMBRO
        public class AgregarMiembroDto
        {
            public int OngId { get; set; }
            public int UsuarioId { get; set; }
            public string Rol { get; set; } = "Voluntario"; // Admin o Voluntario
        }

        [HttpPost("agregar-miembro")]
        public async Task<IActionResult> AgregarMiembro([FromBody] AgregarMiembroDto dto)
        {
            // Validar que no exista ya
            var existe = await _context.MiembrosOrganizaciones
                .AnyAsync(m => m.PerfilOrganizacionId == dto.OngId && m.UsuarioId == dto.UsuarioId);
            
            if (existe) return BadRequest("El usuario ya es miembro de la organización.");

            var miembro = new MiembroOrganizacion
            {
                PerfilOrganizacionId = dto.OngId,
                UsuarioId = dto.UsuarioId,
                RolEnOrganizacion = dto.Rol
            };

            _context.MiembrosOrganizaciones.Add(miembro);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Miembro agregado correctamente." });
        }

        // 4. ELIMINAR MIEMBRO
        [HttpDelete("eliminar-miembro/{id}")]
        public async Task<IActionResult> EliminarMiembro(int id)
        {
            var miembro = await _context.MiembrosOrganizaciones.FindAsync(id);
            if (miembro == null) return NotFound();

            // Evitar que se borre al Creador (opcional, regla de negocio)
            if (miembro.RolEnOrganizacion == "Creador") 
                return BadRequest("No se puede eliminar al creador.");

            _context.MiembrosOrganizaciones.Remove(miembro);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Miembro eliminado." });
        }
    }
}