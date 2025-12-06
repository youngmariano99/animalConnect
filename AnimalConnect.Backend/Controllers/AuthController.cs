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
            
            // "Ciudadano" o "Veterinario"
            public string Rol { get; set; } = "Ciudadano"; 

            // --- Datos exclusivos para registro de Veterinarios ---
            public string? Matricula { get; set; }
            public string? NombreVeterinaria { get; set; }
            public string? Direccion { get; set; }
            public string? Telefono { get; set; } // <--- NUEVO
            public string? Horarios { get; set; } // <--- NUEVO
            public string? Biografia { get; set; } // <--- NUEVO
            public string? LogoUrl { get; set; }   // <--- NUEVO
            public double? Latitud { get; set; } 
            public double? Longitud { get; set; }
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
                // Validación estricta para vets
                if (string.IsNullOrEmpty(request.Matricula) || string.IsNullOrEmpty(request.NombreVeterinaria))
                {
                    return BadRequest("Para registrarse como veterinario, la Matrícula y el Nombre del local son obligatorios.");
                }

                nuevoUsuario.PerfilVeterinario = new PerfilVeterinario
                {
                    MatriculaProfesional = request.Matricula,
                    NombreVeterinaria = request.NombreVeterinaria,
                    Direccion = request.Direccion ?? "Sin dirección",
                    TelefonoProfesional = request.Telefono ?? "No especificado",
                    HorariosAtencion = request.Horarios ?? "Lunes a Viernes",
                    Biografia = request.Biografia, // <--- NUEVO
                    LogoUrl = request.LogoUrl,     // <--- NUEVO
                    EstadoVerificacion = "Pendiente", // ¡Importante! Nace pendiente
                    EsDeTurno = false,
                    Latitud = request.Latitud ?? -37.994, // Si no manda, usa default
                    Longitud = request.Longitud ?? -61.353
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