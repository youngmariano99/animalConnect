using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CampaniasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CampaniasController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Campanias (Para el Ciudadano)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Campania>>> GetCampanias()
        {
            // Ordenamos por fecha (la más próxima primero) y filtramos las que ya pasaron
            return await _context.Campanias
                                 .Where(c => c.FechaHora >= DateTime.Today)
                                 .OrderBy(c => c.FechaHora)
                                 .ToListAsync();
        }

        // POST: api/Campanias (Para el Admin)
        [HttpPost]
        public async Task<ActionResult<Campania>> PostCampania(Campania campania)
        {
            _context.Campanias.Add(campania);
            await _context.SaveChangesAsync();
            return Ok(campania);
        }

        // DELETE: api/Campanias/5 (Para el Admin)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCampania(int id)
        {
            var campania = await _context.Campanias.FindAsync(id);
            if (campania == null) return NotFound();

            _context.Campanias.Remove(campania);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}