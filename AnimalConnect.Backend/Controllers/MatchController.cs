using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MatchController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MatchController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class AnimalMatchDto
        {
            public Animal Animal { get; set; } = null!;
            public int PorcentajeMatch { get; set; }
            public List<string> RazonesMatch { get; set; } = new();
            public bool Bloqueado { get; set; } = false; 
            public string MotivoBloqueo { get; set; } = string.Empty;
        }

        [HttpGet("{usuarioId}")]
        public async Task<ActionResult<IEnumerable<AnimalMatchDto>>> GetMatches(int usuarioId)
        {
            var perfil = await _context.PerfilesAdoptantes
                                       .Include(p => p.Preferencias)
                                       .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

            if (perfil == null || perfil.Preferencias == null)
                return BadRequest("Perfil no encontrado.");

            // Variables del Usuario
            var userEnergia = GetValor(perfil.Preferencias, 1);
            var userTienePatio = GetValor(perfil.Preferencias, 2) == 1;
            var userTieneHijos = GetValor(perfil.Preferencias, 3) == 1;
            var userTieneMascotas = GetValor(perfil.Preferencias, 4) == 1;
            var userTiempo = GetValor(perfil.Preferencias, 5); 
            var userViviendaSize = GetValor(perfil.Preferencias, 6);
            var userExperiencia = GetValor(perfil.Preferencias, 7);

            var animales = await _context.Animales
                                         .Include(a => a.Atributos)
                                         .Where(a => a.IdEstado == 1) // Solo Adopción
                                         .ToListAsync();

            var resultados = new List<AnimalMatchDto>();

            foreach (var animal in animales)
            {
                var dto = new AnimalMatchDto { Animal = animal };
                var animalAttrs = animal.Atributos;

                // --- 1. FILTROS EXCLUYENTES (Bloqueos) ---
                if (GetVal(animalAttrs, 3) == 0 && userTieneHijos) {
                    dto.Bloqueado = true; dto.MotivoBloqueo = "No convive con niños"; resultados.Add(dto); continue;
                }
                if (GetVal(animalAttrs, 4) == 0 && userTieneMascotas) {
                    dto.Bloqueado = true; dto.MotivoBloqueo = "No convive con otras mascotas"; resultados.Add(dto); continue;
                }
                if (GetVal(animalAttrs, 2) == 1 && !userTienePatio) {
                    dto.Bloqueado = true; dto.MotivoBloqueo = "Requiere patio obligatoriamente"; resultados.Add(dto); continue;
                }
                if (GetVal(animalAttrs, 7) == 3 && userExperiencia == 1) {
                    dto.Bloqueado = true; dto.MotivoBloqueo = "Requiere experiencia avanzada"; resultados.Add(dto); continue;
                }
                int tamanoAnimal = GetVal(animalAttrs, 6);
                if (tamanoAnimal > userViviendaSize) {
                    dto.Bloqueado = true; dto.MotivoBloqueo = "Necesita un espacio más grande"; resultados.Add(dto); continue;
                }

                // --- 2. CÁLCULO DE DETALLES (Feedback Detallado) ---
                double puntaje = 0;

                // A. Energía
                int energiaAnimal = GetVal(animalAttrs, 1);
                int difEnergia = Math.Abs(energiaAnimal - userEnergia);
                if (difEnergia == 0) {
                    puntaje += 30;
                    dto.RazonesMatch.Add("✅ Tienen el mismo nivel de energía.");
                } else if (difEnergia == 1) {
                    puntaje += 20;
                    dto.RazonesMatch.Add("⚠️ Su energía es un poco diferente a la tuya.");
                } else {
                    puntaje += 5;
                    dto.RazonesMatch.Add("❌ Sus niveles de actividad son opuestos.");
                }

                // B. Espacio
                if (userViviendaSize > tamanoAnimal) {
                    puntaje += 20;
                    dto.RazonesMatch.Add("✅ Tu hogar es muy espacioso para él/ella.");
                } else {
                    puntaje += 20; // Es igual (ya filtramos los menores)
                    dto.RazonesMatch.Add("✅ El tamaño de tu hogar es adecuado.");
                }

                // C. Tiempo
                int tiempoAnimal = GetVal(animalAttrs, 5);
                if (userTiempo >= tiempoAnimal) {
                    puntaje += 20;
                    dto.RazonesMatch.Add("✅ Tienes el tiempo libre que necesita.");
                } else {
                    // Penalización leve, no bloqueo
                    puntaje += 5; 
                    dto.RazonesMatch.Add("⚠️ Requiere más atención de la que dispones.");
                }

                // D. Social (Bonus)
                if (userTieneHijos && GetVal(animalAttrs, 3) == 1) {
                    puntaje += 7.5;
                    dto.RazonesMatch.Add("✅ ¡Le encantan los niños!");
                }
                if (userTieneMascotas && GetVal(animalAttrs, 4) == 1) {
                    puntaje += 7.5;
                    dto.RazonesMatch.Add("✅ Se lleva genial con otras mascotas.");
                }

                // E. Experiencia
                int expAnimal = GetVal(animalAttrs, 7);
                if (userExperiencia >= expAnimal) {
                    puntaje += 15;
                    dto.RazonesMatch.Add("✅ Tienes la experiencia perfecta para cuidarlo.");
                } else {
                    puntaje += 10;
                    dto.RazonesMatch.Add("⚠️ Podrías necesitar ayuda de un adiestrador al inicio.");
                }

                dto.PorcentajeMatch = (int)Math.Min(puntaje, 100);
                if (!dto.Bloqueado) resultados.Add(dto);
            }

            return Ok(resultados.Where(x => !x.Bloqueado).OrderByDescending(x => x.PorcentajeMatch));
        }

        private int GetValor(ICollection<PreferenciaAdoptante> prefs, int attrId) {
            var p = prefs.FirstOrDefault(x => x.AtributoId == attrId);
            return p != null ? p.ValorPreferido : 0;
        }

        private int GetVal(ICollection<AnimalAtributo>? attrs, int attrId) {
            if (attrs == null) return 0;
            var a = attrs.FirstOrDefault(x => x.AtributoId == attrId);
            return a != null ? a.Valor : 0;
        }
    }
}