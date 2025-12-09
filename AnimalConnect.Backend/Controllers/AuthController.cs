using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- DTOs (Data Transfer Objects) ---
        
        public class LoginRequest
        {
            public string Usuario { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class RegisterRequest
        {
            public string Usuario { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string Rol { get; set; } = "Ciudadano";

            // Solo datos personales para Vets
            public string? Matricula { get; set; }
            public string? Biografia { get; set; }
        }

        // --- 1. LOGIN ---
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Buscamos usuario e incluimos sus perfiles para ver el estado
            var user = await _context.Usuarios
                                     .Include(u => u.PerfilVeterinario)
                                     .Include(u => u.PerfilCiudadano)
                                     .FirstOrDefaultAsync(u => u.NombreUsuario == request.Usuario);

            if (user == null || user.PasswordHash != request.Password)
            {
                return Unauthorized(new { message = "Credenciales inválidas." });
            }

            // Datos comunes de respuesta
            var response = new
            {
                id = user.Id,
                nombre = user.NombreUsuario,
                rol = user.Rol,
                
                // Lógica Match: ¿Tiene perfil de preferencias (Quiz) llenado?
                tienePerfilMatch = await _context.PerfilesAdoptantes.AnyAsync(p => p.UsuarioId == user.Id),

                puntos = user.Rol == "Ciudadano" && user.PerfilCiudadano != null ? user.PerfilCiudadano.Puntos : 0,

                // Lógica Vet: Estado de verificación (Solo si es vet)
                estadoVeterinario = user.Rol == "Veterinario" && user.PerfilVeterinario != null 
                                    ? user.PerfilVeterinario.EstadoVerificacion 
                                    : null, // "Pendiente", "Aprobado", "Rechazado"

                // Lógica Ciudadano: ¿Completó sus datos básicos? (Para futura validación)
                perfilCompleto = user.Rol == "Ciudadano" && user.PerfilCiudadano != null && !string.IsNullOrEmpty(user.PerfilCiudadano.Telefono)
            };

            return Ok(response);
        }

        // --- 2. REGISTRO INTELIGENTE ---
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Usuarios.AnyAsync(u => u.NombreUsuario == request.Usuario))
            {
                return BadRequest("El nombre de usuario ya existe.");
            }

            // 1. Preparamos el Usuario base
            var nuevoUsuario = new Usuario
            {
                NombreUsuario = request.Usuario,
                PasswordHash = request.Password,
                Rol = request.Rol
            };

            // 2. Lógica según Rol (Creación automática de Perfil)
            if (request.Rol == "Veterinario")
                {
                    // Validación simplificada (Solo matrícula)
                    if (string.IsNullOrEmpty(request.Matricula))
                    {
                        return BadRequest("La matrícula es obligatoria.");
                    }

                    nuevoUsuario.PerfilVeterinario = new PerfilVeterinario
                    {
                        MatriculaProfesional = request.Matricula,
                        Biografia = request.Biografia,
                        EstadoVerificacion = "Pendiente"
                        // Clinicas = se agregan después en el Wizard paso 2
                    };
                }
            else if (request.Rol == "Ciudadano")
            {
                // Creamos el cascarón del perfil para que no sea null
                nuevoUsuario.PerfilCiudadano = new PerfilCiudadano
                {
                    NombreCompleto = request.Usuario, // Por defecto usamos el user
                    FechaRegistro = DateTime.Now
                };
            }

            // 3. Guardado Atómico (EF Core guarda Usuario y Perfil en una sola transacción)
            _context.Usuarios.Add(nuevoUsuario);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Usuario y perfil creados exitosamente" });
        }
    }
}