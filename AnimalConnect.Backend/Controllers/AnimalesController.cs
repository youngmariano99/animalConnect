using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;
using AnimalConnect.Backend.Services;

namespace AnimalConnect.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnimalesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnimalesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- 1. OBTENER PÚBLICOS (Solo activos y recientes) ---
        // GET: api/Animales?lat=-37.99&lng=-61.35&radio=50
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Animal>>> GetAnimales([FromQuery] double? lat, [FromQuery] double? lng, [FromQuery] double radio = 50)
        {
            var fechaLimite = DateTime.Now.AddDays(-15);

            // 1. Traemos los activos de la BD (Adopción, Perdido, Encontrado)
            var query = _context.Animales
                                .Include(a => a.Especie)
                                .Include(a => a.Estado)
                                .Include(a => a.Usuario)
                                    .ThenInclude(u => u.Organizaciones)
                                    .ThenInclude(mo => mo.Organizacion)
                                .Where(a => a.FechaUltimaRenovacion >= fechaLimite && 
                                            (a.IdEstado == 1 || a.IdEstado == 2 || a.IdEstado == 3));

            var listaInicial = await query.ToListAsync();

            // 2. Si no hay coordenadas, devolvemos todo (Comportamiento legacy)
            if (lat == null || lng == null)
            {
                return Ok(listaInicial);
            }

            // 3. FILTRO SAAS: Filtrar en memoria usando GeoService
            // Solo devolvemos los que están dentro del radio km
            var filtrados = listaInicial.Where(a => 
                a.UbicacionLat.HasValue && a.UbicacionLon.HasValue &&
                GeoService.CalcularDistanciaKm(lat.Value, lng.Value, a.UbicacionLat.Value, a.UbicacionLon.Value) <= radio
            ).ToList();

            return Ok(filtrados);
        }

        // --- 2. OBTENER MIS PUBLICACIONES (Panel Privado) ---
        [HttpGet("usuario/{usuarioId}")]
        public async Task<ActionResult<IEnumerable<Animal>>> GetMisPublicaciones(int usuarioId)
        {
            var misAnimales = await _context.Animales
                                            .Include(a => a.Especie)
                                            .Include(a => a.Estado)
                                            .Where(a => a.UsuarioId == usuarioId)
                                            .OrderByDescending(a => a.FechaUltimaRenovacion)
                                            .ToListAsync();
            return Ok(misAnimales);
        }

        // --- 3. RENOVAR PUBLICACIÓN (Marketplace Logic) ---
        [HttpPut("renovar/{id}")]
        public async Task<IActionResult> RenovarPublicacion(int id)
        {
            var animal = await _context.Animales.FindAsync(id);
            if (animal == null) return NotFound();

            animal.FechaUltimaRenovacion = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Publicación renovada por 15 días más." });
        }

        // --- 4. CAMBIAR ESTADO (Finalizar) ---
        [HttpPut("estado/{id}")]
        public async Task<IActionResult> CambiarEstado(int id, [FromBody] int nuevoEstadoId)
        {
            var animal = await _context.Animales.FindAsync(id);
            if (animal == null) return NotFound();

            animal.IdEstado = nuevoEstadoId;
            // Opcional: Al finalizar, podríamos querer que deje de aparecer o se archive.
            // Por ahora solo cambiamos el estado.
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Estado actualizado correctamente." });
        }

        // --- CREAR (Actualizado con UsuarioId) ---
        [HttpPost]
        public async Task<ActionResult<Animal>> PostAnimal(Animal animal)
        {
            animal.FechaPublicacion = DateTime.Now;
            animal.FechaUltimaRenovacion = DateTime.Now;
            
            _context.Animales.Add(animal);
            await _context.SaveChangesAsync();

            return Ok(animal);
        }

        // ... (Mantener Delete y Get por ID igual que antes) ...
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnimal(int id)
        {
            var animal = await _context.Animales.FindAsync(id);
            if (animal == null) return NotFound();
            _context.Animales.Remove(animal);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}