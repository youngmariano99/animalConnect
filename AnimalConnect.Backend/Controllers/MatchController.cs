using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AnimalConnect.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MatchController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MatchController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("calculate")]
        public async Task<ActionResult<IEnumerable<MatchResult>>> CalculateMatch([FromBody] MatchRequest request)
        {
            // 1. Obtener candidatos (Solo en Adopción: Estado 1)
            var animales = await _context.Animales
                                         .Include(a => a.Especie)
                                         .Include(a => a.Estado) // Para verificar estado
                                         .Where(a => a.IdEstado == 1) // 1 = En Adopción
                                         .ToListAsync();

            var resultados = new List<MatchResult>();

            foreach (var animal in animales)
            {
                // --- A. FILTROS DUROS (BLOCKERS) ---
                if (request.TieneNinos && animal.NivelSociabilidadNinos < 7) continue;
                if (request.TienePerros && animal.NivelSociabilidadPerros < 7) continue;
                if (request.TieneGatos && animal.NivelSociabilidadGatos < 7) continue;

                // --- B. CÁLCULO FEV (SCORING) ---
                // Simulación de FEV simplificada para MVP
                double score = 100;

                // 1. Energía vs Actividad (Peso 30%)
                // Diferencia absoluta: Si Actividad=8 y Energia=5 -> Diff=3.
                // Penalizamos la diferencia. 
                double diffEnergia = Math.Abs(animal.NivelEnergia - request.NivelActividad);
                score -= (diffEnergia * 5.0); // -5 puntos por cada punto de diferencia (Mayor peso para filtrar extremos)

                // 2. Tiempo vs Soledad (Peso 25%)
                // Mapear HorasFuera a escala 1-10 (más horas = necesita más tolerancia)
                int necesidadIndependenciaUsuario = Math.Min(10, request.HorasFuera / 2); // 8 horas -> 4. 
                // Wait, logic check: 8 hours out means animal needs HIGH tolerance?
                // If animal has ToleranceSoledad=1 (Low), and user is out 8 hours...
                // User needs Tolerance=8. Animal has 1. Diff=7. BAD.
                // Let's adjust mapping: 0h->1, 4h->3, 8h->7, 12h->10.
                // Or simply: 1 hour = 0.8 points of tolerance?
                // Let's use simple curve: 
                int requiredTolerance = (int)Math.Ceiling(request.HorasFuera / 1.5); 
                if (requiredTolerance > 10) requiredTolerance = 10;
                
                double diffSoledad = requiredTolerance - animal.ToleranciaSoledad;
                // Only penalize if REQUIRED > ACTUAL
                if (diffSoledad > 0)
                {
                    score -= (diffSoledad * 8.0); // Penalización MUY SEVERA por dejar solo a un animal ansioso
                }

                // 3. Espacio (Peso 15%)
                // 3. Espacio (Peso 15%)
                // [MODIFIED] Hard Filter request: Energy 10 in Apartment = NO MATCH
                if (request.TipoVivienda == "Departamento" && animal.NivelEnergia >= 10) continue;

                if (request.TipoVivienda == "Departamento" && animal.NivelEnergia > 7)
                {
                    continue; // HARD FILTER: Espacio reducido no apto para alta energía
                }

                // Normalizar Score (0-100)
                if (score < 0) score = 0;
                if (score > 100) score = 100;

                // Solo agregamos si supera un umbral mínimo (ej. 50%)
                if (score >= 40)
                {
                    resultados.Add(new MatchResult
                    {
                        Animal = animal,
                        MatchPercentage = Math.Round(score, 1),
                        Etiquetas = GenerarEtiquetas(animal, score)
                    });
                }
            }

            // Ordenar por mejor match
            return Ok(resultados.OrderByDescending(r => r.MatchPercentage).Take(10));
        }

        private List<string> GenerarEtiquetas(Animal animal, double score)
        {
            var tags = new List<string>();
            if (score > 90) tags.Add("❤️ Match Perfecto");
            else if (score > 75) tags.Add("🌟 Alta Compatibilidad");
            
            if (animal.NivelSociabilidadNinos >= 8) tags.Add("👶 Kids Friendly");
            if (animal.NivelSociabilidadPerros >= 8) tags.Add("🐶 Dog Friendly");
            if (animal.NivelEnergia <= 3) tags.Add("🛋️ Sofá Potato");
            if (animal.NivelEnergia >= 8) tags.Add("⚡ Atleta");
            if (animal.ToleranciaSoledad >= 8) tags.Add("🏠 Independiente");

            return tags;
        }
    }

    // DTOs
    public class MatchRequest
    {
        public int NivelActividad { get; set; } // 1-10
        public int HorasFuera { get; set; } // 0-24
        public bool TieneNinos { get; set; }
        public bool TienePerros { get; set; }
        public bool TieneGatos { get; set; }
        public string TipoVivienda { get; set; } = "Casa"; // "Casa", "Departamento"
        public int PresupuestoMensual { get; set; } // 1-10 (Simulado)
    }

    public class MatchResult
    {
        public Animal Animal { get; set; }
        public double MatchPercentage { get; set; }
        public List<string> Etiquetas { get; set; }
    }
}
