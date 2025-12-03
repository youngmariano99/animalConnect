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

        public class LoginRequest
        {
            public string Usuario { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class RegisterRequest
        {
            public string Usuario { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        // --- 1. LOGIN ---
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Usuarios
                                     .FirstOrDefaultAsync(u => u.NombreUsuario == request.Usuario);

            if (user == null || user.PasswordHash != request.Password)
            {
                return Unauthorized("Credenciales inválidas.");
            }

            // ¿Ya hizo el quiz?
            var tienePerfil = await _context.PerfilesAdoptantes
                                            .AnyAsync(p => p.UsuarioId == user.Id);

            return Ok(new 
            { 
                id = user.Id, 
                nombre = user.NombreUsuario, 
                rol = user.Rol,
                tienePerfil = tienePerfil 
            });
        }

        // --- 2. REGISTRO (IMPORTANTE PARA LO QUE PIDES) ---
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Usuarios.AnyAsync(u => u.NombreUsuario == request.Usuario))
            {
                return BadRequest("El nombre de usuario ya existe.");
            }

            var nuevoUsuario = new Usuario
            {
                NombreUsuario = request.Usuario,
                PasswordHash = request.Password, 
                Rol = "Ciudadano" 
            };

            _context.Usuarios.Add(nuevoUsuario);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Usuario creado exitosamente" });
        }
    }
}