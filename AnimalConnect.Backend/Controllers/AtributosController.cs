using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AtributosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AtributosController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Atributos
        // El Quiz llama a esto para saber qué preguntas renderizar
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Atributo>>> GetAtributos()
        {
            return await _context.Atributos.ToListAsync();
        }

        // POST: api/Atributos (Solo para Admin en el futuro)
        [HttpPost]
        public async Task<ActionResult<Atributo>> PostAtributo(Atributo atributo)
        {
            _context.Atributos.Add(atributo);
            await _context.SaveChangesAsync();
            return Ok(atributo);
        }
    }
}