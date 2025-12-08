using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;
using AnimalConnect.Backend.Services;

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

        // GET: api/Match/5?lat=-38...&lng=-61...
        [HttpGet("{usuarioId}")]
        public async Task<ActionResult<IEnumerable<AnimalMatchDto>>> GetMatches(int usuarioId, [FromQuery] double? lat, [FromQuery] double? lng, [FromQuery] double radio = 100)
        {
            // 1. Obtener perfil del usuario
            var perfil = await _context.PerfilesAdoptantes
                                       .Include(p => p.Preferencias)
                                       .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

            if (perfil == null || perfil.Preferencias == null)
                return BadRequest("Perfil no encontrado.");

            // Variables del Usuario (Preferencias)
            var userEnergia = GetValor(perfil.Preferencias, 1);
            var userTienePatio = GetValor(perfil.Preferencias, 2) == 1;
            var userTieneHijos = GetValor(perfil.Preferencias, 3) == 1;
            var userTieneMascotas = GetValor(perfil.Preferencias, 4) == 1;
            var userTiempo = GetValor(perfil.Preferencias, 5); 
            var userViviendaSize = GetValor(perfil.Preferencias, 6);
            var userExperiencia = GetValor(perfil.Preferencias, 7);

            // 2. Traer candidatos (Solo estado Adopción)
            var query = _context.Animales
                                .Include(a => a.Atributos)
                                .Include(a => a.Especie) // Incluimos especie para mostrar "Perro/Gato" en el front
                                .Where(a => a.IdEstado == 1);

            var animales = await query.ToListAsync();

            // 3. FILTRO GEOGRÁFICO (SaaS)
            // Si el front manda coordenadas, descartamos los lejanos antes de calcular match
            if (lat.HasValue && lng.HasValue)
            {
                animales = animales.Where(a => 
                    a.UbicacionLat.HasValue && a.UbicacionLon.HasValue &&
                    GeoService.CalcularDistanciaKm(lat.Value, lng.Value, a.UbicacionLat.Value, a.UbicacionLon.Value) <= radio
                ).ToList();
            }

            var resultados = new List<AnimalMatchDto>();

            // 4. Algoritmo de Match (Igual que antes)
            foreach (var animal in animales)
            {
                var dto = new AnimalMatchDto { Animal = animal };
                var animalAttrs = animal.Atributos;

                // --- BLOQUEOS ---
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

                // --- PUNTUACIÓN ---
                double puntaje = 0;

                // A. Energía
                int energiaAnimal = GetVal(animalAttrs, 1);
                int difEnergia = Math.Abs(energiaAnimal - userEnergia);
                if (difEnergia == 0) { puntaje += 30; dto.RazonesMatch.Add("✅ Tienen el mismo nivel de energía."); } 
                else if (difEnergia == 1) { puntaje += 20; dto.RazonesMatch.Add("⚠️ Su energía es un poco diferente a la tuya."); } 
                else { puntaje += 5; dto.RazonesMatch.Add("❌ Sus niveles de actividad son opuestos."); }

                // B. Espacio
                if (userViviendaSize > tamanoAnimal) { puntaje += 20; dto.RazonesMatch.Add("✅ Tu hogar es muy espacioso para él/ella."); } 
                else { puntaje += 20; dto.RazonesMatch.Add("✅ El tamaño de tu hogar es adecuado."); }

                // C. Tiempo
                int tiempoAnimal = GetVal(animalAttrs, 5);
                if (userTiempo >= tiempoAnimal) { puntaje += 20; dto.RazonesMatch.Add("✅ Tienes el tiempo libre que necesita."); } 
                else { puntaje += 5; dto.RazonesMatch.Add("⚠️ Requiere más atención de la que dispones."); }

                // D. Social (Bonus)
                if (userTieneHijos && GetVal(animalAttrs, 3) == 1) { puntaje += 7.5; dto.RazonesMatch.Add("✅ ¡Le encantan los niños!"); }
                if (userTieneMascotas && GetVal(animalAttrs, 4) == 1) { puntaje += 7.5; dto.RazonesMatch.Add("✅ Se lleva genial con otras mascotas."); }

                // E. Experiencia
                int expAnimal = GetVal(animalAttrs, 7);
                if (userExperiencia >= expAnimal) { puntaje += 15; dto.RazonesMatch.Add("✅ Tienes la experiencia perfecta para cuidarlo."); } 
                else { puntaje += 10; dto.RazonesMatch.Add("⚠️ Podrías necesitar ayuda de un adiestrador al inicio."); }

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
    
