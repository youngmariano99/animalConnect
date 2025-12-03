using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PerfilController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PerfilController(ApplicationDbContext context)
        {
            _context = context;
        }

        // DTO para recibir todo junto (Datos Fijos + Respuestas Dinámicas)
        public class PerfilDto
        {
            public int UsuarioId { get; set; }
            public string TipoVivienda { get; set; } = "Departamento";
            public bool TienePatio { get; set; }
            public int HorasFuera { get; set; }
            public int NivelActividad { get; set; }
            public bool TieneHijos { get; set; }
            public bool TieneOtrasMascotas { get; set; }
            public string? Telefono { get; set; }
            
            // Las respuestas al match dinámico
            public List<PreferenciaDto> Preferencias { get; set; } = new();
        }

        public class PreferenciaDto 
        {
            public int AtributoId { get; set; }
            public int Valor { get; set; } // 1-5 o 0/1
        }

        [HttpPost]
        public async Task<IActionResult> CrearPerfil([FromBody] PerfilDto dto)
        {
            // 1. Validar si ya existe
            if (await _context.PerfilesAdoptantes.AnyAsync(p => p.UsuarioId == dto.UsuarioId))
            {
                return BadRequest("El usuario ya tiene un perfil creado.");
            }

            // 2. Crear el Perfil Base (Datos duros para estadística)
            var nuevoPerfil = new PerfilAdoptante
            {
                UsuarioId = dto.UsuarioId,
                TelefonoContacto = dto.Telefono,
                // Nota: Podríamos guardar vivienda/patio aquí también si queremos redundancia,
                // pero por ahora lo convertiremos en Preferencias también para el algoritmo.
            };

            _context.PerfilesAdoptantes.Add(nuevoPerfil);
            await _context.SaveChangesAsync(); // Guardar para obtener el ID

            // 3. Guardar las Preferencias (Match Dinámico)
            foreach (var pref in dto.Preferencias)
            {
                _context.PreferenciasAdoptantes.Add(new PreferenciaAdoptante
                {
                    PerfilAdoptanteId = nuevoPerfil.Id,
                    AtributoId = pref.AtributoId,
                    ValorPreferido = pref.Valor,
                    Importancia = 3 // Por defecto importancia media (luego se puede mejorar)
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Perfil creado exitosamente" });
        }
    }
}