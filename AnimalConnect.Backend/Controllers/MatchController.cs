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
            public bool Bloqueado { get; set; } = false; // Nuevo: Para saber si fue rechazado
            public string MotivoBloqueo { get; set; } = string.Empty;
        }

        [HttpGet("{usuarioId}")]
        public async Task<ActionResult<IEnumerable<AnimalMatchDto>>> GetMatches(int usuarioId)
        {
            // 1. Obtener Perfil completo
            var perfil = await _context.PerfilesAdoptantes
                                       .Include(p => p.Preferencias)
                                       .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

            if (perfil == null || perfil.Preferencias == null)
                return BadRequest("Perfil no encontrado.");

            // 2. Extraer Valores del Usuario (Variables Locales para facilitar lógica)
            // Buscamos en la lista de preferencias por el ID del atributo
            var userEnergia = GetValor(perfil.Preferencias, 1); // Nivel Energía
            var userTienePatio = GetValor(perfil.Preferencias, 2) == 1;
            var userTieneHijos = GetValor(perfil.Preferencias, 3) == 1; // Usamos ID 3 como "Tiene Hijos"
            var userTieneMascotas = GetValor(perfil.Preferencias, 4) == 1; // Usamos ID 4 como "Tiene Mascotas"
            var userTiempo = GetValor(perfil.Preferencias, 5); // Tiempo disponible
            var userViviendaSize = GetValor(perfil.Preferencias, 6); // 1:Depto, 2:Casa, 3:Patio Grande (Tamaño max soportado)
            var userExperiencia = GetValor(perfil.Preferencias, 7);

            // 3. Obtener Animales
            var animales = await _context.Animales
                                         .Include(a => a.Atributos)
                                         .Where(a => a.IdEstado == 1) // Solo Adopción
                                         .ToListAsync();

            var resultados = new List<AnimalMatchDto>();

            foreach (var animal in animales)
            {
                var dto = new AnimalMatchDto { Animal = animal };
                var animalAttrs = animal.Atributos;

                // --- FASE 1: REGLAS DURAS (BLOQUEOS) ---
                // Si falla una, el puntaje es 0 y no se recomienda.

                // 1. Niños: Animal NO apto + Usuario TIENE niños
                if (GetVal(animalAttrs, 3) == 0 && userTieneHijos) {
                    dto.Bloqueado = true; dto.MotivoBloqueo = "No apto para niños"; resultados.Add(dto); continue;
                }

                // 2. Mascotas: Animal NO apto + Usuario TIENE mascotas
                if (GetVal(animalAttrs, 4) == 0 && userTieneMascotas) {
                    dto.Bloqueado = true; dto.MotivoBloqueo = "No apto con otras mascotas"; resultados.Add(dto); continue;
                }

                // 3. Patio: Animal REQUIERE patio + Usuario NO TIENE
                if (GetVal(animalAttrs, 2) == 1 && !userTienePatio) {
                    dto.Bloqueado = true; dto.MotivoBloqueo = "Requiere patio"; resultados.Add(dto); continue;
                }

                // 4. Experiencia: Animal COMPLEJO (Nivel 3) + Usuario PRINCIPIANTE (Nivel 1)
                if (GetVal(animalAttrs, 7) == 3 && userExperiencia == 1) {
                    dto.Bloqueado = true; dto.MotivoBloqueo = "Requiere experiencia avanzada"; resultados.Add(dto); continue;
                }

                // 5. Tamaño vs Vivienda (Lógica Especial)
                // Si animal es Grande (3) y Usuario vive en Depto/Chico (1) -> Bloqueo
                int tamanoAnimal = GetVal(animalAttrs, 6);
                if (tamanoAnimal > userViviendaSize) {
                    dto.Bloqueado = true; dto.MotivoBloqueo = "Necesita más espacio"; resultados.Add(dto); continue;
                }


                // --- FASE 2: CÁLCULO DE PUNTAJE (100 Pts Total) ---
                double puntaje = 0;

                // A. Compatibilidad Energética (30 pts)
                int energiaAnimal = GetVal(animalAttrs, 1);
                int difEnergia = Math.Abs(energiaAnimal - userEnergia);
                if (difEnergia == 0) puntaje += 30;      // Match exacto
                else if (difEnergia == 1) puntaje += 20; // Diferencia leve
                else if (difEnergia == 2) puntaje += 10; // Diferencia media
                // Diferencia 3 = 0 pts

                // B. Tamaño/Espacio (20 pts)
                // Si ya pasó el bloqueo, damos puntos extra por holgura
                if (userViviendaSize >= tamanoAnimal) puntaje += 20;

                // C. Tiempo Disponible (20 pts)
                // Animal que requiere mucho tiempo (3) y usuario tiene poco (1) -> 0 pts
                int tiempoAnimal = GetVal(animalAttrs, 5);
                if (userTiempo >= tiempoAnimal) puntaje += 20;
                else if (userTiempo == tiempoAnimal - 1) puntaje += 10;

                // D. Compatibilidad Social (15 pts)
                // Si tiene niños/mascotas y el animal es apto -> Suma puntos (Bonus)
                if (userTieneHijos && GetVal(animalAttrs, 3) == 1) puntaje += 7.5;
                else if (!userTieneHijos) puntaje += 7.5; // Neutro

                if (userTieneMascotas && GetVal(animalAttrs, 4) == 1) puntaje += 7.5;
                else if (!userTieneMascotas) puntaje += 7.5;

                // E. Experiencia (15 pts)
                // Si el usuario tiene más experiencia de la necesaria -> Full puntos
                int expAnimal = GetVal(animalAttrs, 7);
                if (userExperiencia >= expAnimal) puntaje += 15;
                else puntaje += 5;

                dto.PorcentajeMatch = (int)Math.Min(puntaje, 100);
                
                // Generar razones
                if (puntaje >= 80) dto.RazonesMatch.Add("¡Gran compatibilidad de energía y espacio!");
                if (userTiempo >= tiempoAnimal) dto.RazonesMatch.Add("Tienes el tiempo que necesita.");

                // Solo agregamos si NO está bloqueado (o si quieres mostrar los bloqueados al final)
                if (!dto.Bloqueado) resultados.Add(dto);
            }

            // Devolver solo los NO bloqueados, ordenados por puntaje
            return Ok(resultados.Where(x => !x.Bloqueado).OrderByDescending(x => x.PorcentajeMatch));
        }

        // Helpers para leer valores
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