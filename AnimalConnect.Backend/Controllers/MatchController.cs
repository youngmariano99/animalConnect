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

        // DTO para devolver el Animal + Su Puntaje
        public class AnimalMatchDto
        {
            public Animal Animal { get; set; } = null!;
            public int PorcentajeMatch { get; set; } // 0 a 100
            public List<string> RazonesMatch { get; set; } = new(); // "Coinciden en: Patio, Energía"
        }

        [HttpGet("{usuarioId}")]
        public async Task<ActionResult<IEnumerable<AnimalMatchDto>>> GetMatches(int usuarioId)
        {
            // 1. Obtener el Perfil del Usuario y sus Preferencias
            var perfil = await _context.PerfilesAdoptantes
                                       .Include(p => p.Preferencias!)
                                       .ThenInclude(pref => pref.Atributo)
                                       .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

            if (perfil == null || perfil.Preferencias == null || !perfil.Preferencias.Any())
            {
                // Si no tiene perfil, devolvemos lista vacía o error (el front manejará esto)
                return BadRequest("El usuario no tiene perfil de preferencias cargado.");
            }

            // 2. Obtener todos los Animales y sus Atributos
            // IMPORTANTE: Filtramos solo los que están en adopción (IdEstado = 1)
            var animales = await _context.Animales
                                         .Include(a => a.Especie)
                                         .Include(a => a.Estado)
                                         .Include(a => a.Atributos!)
                                         .ThenInclude(aa => aa.Atributo)
                                         .Where(a => a.IdEstado == 1) 
                                         .ToListAsync();

            var resultados = new List<AnimalMatchDto>();

            // 3. EL ALGORITMO: Comparar cada animal con el perfil
            foreach (var animal in animales)
            {
                int puntajeTotal = 0;
                int puntajeMaximoPosible = 0;
                var razones = new List<string>();

                foreach (var preferencia in perfil.Preferencias)
                {
                    // Buscamos si el animal tiene este atributo medido
                    var atributoAnimal = animal.Atributos?.FirstOrDefault(aa => aa.AtributoId == preferencia.AtributoId);

                    // La importancia define cuánto vale esta pregunta (1 a 5 puntos)
                    int puntosEstaPregunta = preferencia.Importancia; 
                    puntajeMaximoPosible += puntosEstaPregunta;

                    if (atributoAnimal != null)
                    {
                        // COMPARACIÓN
                        int diferencia = Math.Abs(preferencia.ValorPreferido - atributoAnimal.Valor);

                        if (diferencia == 0) 
                        {
                            // Match Perfecto (mismo valor)
                            puntajeTotal += puntosEstaPregunta;
                            razones.Add(preferencia.Atributo!.Nombre);
                        }
                        else if (diferencia == 1) 
                        {
                            // Match Cercano (ej: Busco nivel 3, perro es 4) -> Sumamos la mitad
                            puntajeTotal += (puntosEstaPregunta / 2);
                        }
                        // Si la diferencia es mayor a 1, no suma puntos.
                    }
                }

                // Cálculo final de porcentaje
                int porcentaje = 0;
                if (puntajeMaximoPosible > 0)
                {
                    porcentaje = (int)((double)puntajeTotal / puntajeMaximoPosible * 100);
                }

                // Agregamos a la lista
                resultados.Add(new AnimalMatchDto
                {
                    Animal = animal,
                    PorcentajeMatch = porcentaje,
                    RazonesMatch = razones
                });
            }

            // 4. Devolver ordenados por mejor match
            return Ok(resultados.OrderByDescending(x => x.PorcentajeMatch));
        }
    }
}