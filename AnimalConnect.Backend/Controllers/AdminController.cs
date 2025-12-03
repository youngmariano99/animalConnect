using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- 1. OBTENER LISTA DE PENDIENTES ---
        // GET: api/Admin/solicitudes
        [HttpGet("solicitudes")]
        public async Task<ActionResult> GetSolicitudesPendientes()
        {
            // EF Core traduce esto a un JOIN SQL automáticamente
            var pendientes = await _context.Usuarios
                .Where(u => u.Rol == "Veterinario" && u.PerfilVeterinario.EstadoVerificacion == "Pendiente")
                .Select(u => new
                {
                    u.Id,
                    u.NombreUsuario,
                    // Proyectamos datos del perfil relacionado
                    NombreVeterinaria = u.PerfilVeterinario.NombreVeterinaria,
                    Matricula = u.PerfilVeterinario.MatriculaProfesional,
                    Direccion = u.PerfilVeterinario.Direccion,
                    FechaRegistro = u.PerfilVeterinario.Id // O cualquier dato de fecha si tuvieras
                })
                .ToListAsync();

            return Ok(pendientes);
        }

        // --- 2. APROBAR SOLICITUD ---
        // POST: api/Admin/aprobar/5
        [HttpPost("aprobar/{id}")]
        public async Task<IActionResult> AprobarVeterinario(int id)
        {
            var usuario = await _context.Usuarios
                .Include(u => u.PerfilVeterinario) // Importante: Cargar el perfil para editarlo
                .FirstOrDefaultAsync(u => u.Id == id);

            if (usuario == null || usuario.PerfilVeterinario == null)
            {
                return NotFound("Veterinario no encontrado.");
            }

            usuario.PerfilVeterinario.EstadoVerificacion = "Aprobado";
            await _context.SaveChangesAsync();

            return Ok(new { message = $"El veterinario {usuario.NombreUsuario} ha sido aprobado exitosamente." });
        }

        // --- 3. RECHAZAR SOLICITUD ---
        // POST: api/Admin/rechazar/5
        [HttpPost("rechazar/{id}")]
        public async Task<IActionResult> RechazarVeterinario(int id)
        {
            var usuario = await _context.Usuarios
                .Include(u => u.PerfilVeterinario)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (usuario == null || usuario.PerfilVeterinario == null)
            {
                return NotFound("Veterinario no encontrado.");
            }

            usuario.PerfilVeterinario.EstadoVerificacion = "Rechazado";
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Solicitud rechazada para {usuario.NombreUsuario}." });
        }
    }
}