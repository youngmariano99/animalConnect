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
    }
}