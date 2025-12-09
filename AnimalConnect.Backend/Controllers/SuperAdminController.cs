using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuperAdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SuperAdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class CrearMunicipioDto
        {
            public string Usuario { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string NombreMunicipio { get; set; } = string.Empty;
            public string Provincia { get; set; } = string.Empty;
            public double Latitud { get; set; }
            public double Longitud { get; set; }
            public double RadioKm { get; set; }
        }

        [HttpPost("crear-municipio")]
        public async Task<IActionResult> CrearMunicipio([FromBody] CrearMunicipioDto dto)
        {
            // 1. Validar si ya existe el usuario
            if (await _context.Usuarios.AnyAsync(u => u.NombreUsuario == dto.Usuario))
                return BadRequest("El nombre de usuario ya existe.");

            // 2. Crear Usuario y Perfil
            var nuevoUsuario = new Usuario
            {
                NombreUsuario = dto.Usuario,
                PasswordHash = dto.Password,
                Rol = "Municipio", // Rol Específico
                PerfilMunicipio = new PerfilMunicipio
                {
                    NombreMunicipio = dto.NombreMunicipio,
                    Provincia = dto.Provincia,
                    LatitudCentro = dto.Latitud,
                    LongitudCentro = dto.Longitud,
                    RadioCoberturaKm = dto.RadioKm
                }
            };

            _context.Usuarios.Add(nuevoUsuario);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Municipio creado exitosamente." });
        }

        // --- NUEVA GESTIÓN DE VETERINARIOS GLOBAL ---

        // 1. Ver todas las solicitudes pendientes (De cualquier ciudad)
        [HttpGet("veterinarios-pendientes")]
        public async Task<ActionResult> GetVetsPendientes()
        {
            var pendientes = await _context.Usuarios
                .Include(u => u.PerfilVeterinario)
                .Where(u => u.Rol == "Veterinario" && u.PerfilVeterinario.EstadoVerificacion == "Pendiente")
                .Select(u => new
                    {
                        u.Id,
                        u.NombreUsuario,
                        NombreVeterinaria = "Pendiente de Carga", // Aún no creó la clínica
                        Matricula = u.PerfilVeterinario.MatriculaProfesional,
                        // Eliminamos Direccion, Lat, Lng de aquí porque pertenecen a la Clinica, no al Perfil
                    })
                .ToListAsync();

            return Ok(pendientes);
        }

        // 2. Aprobar Veterinario
        [HttpPost("aprobar-vet/{id}")]
        public async Task<IActionResult> AprobarVet(int id)
        {
            var usuario = await _context.Usuarios
                .Include(u => u.PerfilVeterinario)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (usuario?.PerfilVeterinario == null) return NotFound("Veterinario no encontrado.");

            usuario.PerfilVeterinario.EstadoVerificacion = "Aprobado";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Veterinario aprobado y activo en el mapa." });
        }

        // 3. Rechazar Veterinario
        [HttpPost("rechazar-vet/{id}")]
        public async Task<IActionResult> RechazarVet(int id)
        {
            var usuario = await _context.Usuarios.Include(u => u.PerfilVeterinario).FirstOrDefaultAsync(u => u.Id == id);
            if (usuario?.PerfilVeterinario == null) return NotFound();

            usuario.PerfilVeterinario.EstadoVerificacion = "Rechazado";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Solicitud rechazada." });
        }
    }
}
 