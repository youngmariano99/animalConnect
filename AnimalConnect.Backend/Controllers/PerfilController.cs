using Microsoft.AspNetCore.Mvc;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PerfilController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PerfilController(ApplicationDbContext context) { _context = context; }

        public class PerfilDto
        {
            public int UsuarioId { get; set; }
            public string TipoVivienda { get; set; } = "Depto"; // Depto, Casa, CasaPatio
            public bool TienePatio { get; set; }
            public int HorasFuera { get; set; } // 1 (Poco tiempo libre) a 3 (Mucho tiempo libre) - Invertido en front
            public int NivelActividad { get; set; } // 1-3
            public bool TieneHijos { get; set; }
            public bool TieneOtrasMascotas { get; set; }
            public int NivelExperiencia { get; set; } // 1-3 (Nuevo)
            public string? Telefono { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> CrearPerfil([FromBody] PerfilDto dto)
        {
            if (await _context.PerfilesAdoptantes.AnyAsync(p => p.UsuarioId == dto.UsuarioId))
                return BadRequest("Perfil ya existe.");

            var nuevoPerfil = new PerfilAdoptante { UsuarioId = dto.UsuarioId, TelefonoContacto = dto.Telefono };
            _context.PerfilesAdoptantes.Add(nuevoPerfil);
            await _context.SaveChangesAsync();

            // --- TRADUCCIÓN DE RESPUESTAS A ATRIBUTOS (IDs fijos según Seed) ---
            var prefs = new List<PreferenciaAdoptante>();

            // 1. Energía (Directo)
            prefs.Add(NewPref(nuevoPerfil.Id, 1, dto.NivelActividad));

            // 2. Requiere Patio (Directo)
            prefs.Add(NewPref(nuevoPerfil.Id, 2, dto.TienePatio ? 1 : 0));

            // 3. Niños (Mapeamos "Tiene Hijos" a "Necesita Tolerar Niños")
            prefs.Add(NewPref(nuevoPerfil.Id, 3, dto.TieneHijos ? 1 : 0));

            // 4. Mascotas (Mapeamos "Tiene Mascotas" a "Necesita Tolerar Mascotas")
            prefs.Add(NewPref(nuevoPerfil.Id, 4, dto.TieneOtrasMascotas ? 1 : 0));

            // 5. Tiempo Disponible (Invertimos: Si está 8hs fuera, tiene "Poco" tiempo = 1)
            // Asumimos que el front manda: 1 (Poco tiempo libre), 3 (Mucho tiempo)
            prefs.Add(NewPref(nuevoPerfil.Id, 5, dto.HorasFuera)); // Ojo: Ajustar lógica en front si es necesario

            // 6. Tamaño Máximo (Mapeo Vivienda -> Tamaño)
            // Depto -> 1 (Pequeño), Casa -> 2 (Mediano), CasaPatio -> 3 (Grande)
            int tamanoMax = 1;
            if (dto.TipoVivienda == "Casa") tamanoMax = 2;
            if (dto.TipoVivienda == "CasaPatio") tamanoMax = 3;
            prefs.Add(NewPref(nuevoPerfil.Id, 6, tamanoMax));

            // 7. Experiencia (Directo)
            prefs.Add(NewPref(nuevoPerfil.Id, 7, dto.NivelExperiencia));

            _context.PreferenciasAdoptantes.AddRange(prefs);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Perfil Guardado" });
        }

        private PreferenciaAdoptante NewPref(int perfilId, int attrId, int val)
        {
            return new PreferenciaAdoptante { PerfilAdoptanteId = perfilId, AtributoId = attrId, ValorPreferido = val };
        }
    }
}