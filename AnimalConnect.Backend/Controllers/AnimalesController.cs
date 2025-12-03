using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;

namespace AnimalConnect.Backend.Controllers
{
    // 1. Definimos que esto es un controlador de API
    [ApiController]
    // 2. Definimos la ruta. [controller] se reemplaza por el nombre de la clase (Animales)
    // La ruta final será: https://localhost:xxxx/api/animales
    [Route("api/[controller]")]
    public class AnimalesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // 3. Inyección de Dependencias:
        // El constructor "pide" el DbContext que configuramos en Program.cs
        public AnimalesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- ENDPOINT 1: OBTENER TODOS LOS ANIMALES (GET) ---
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Animal>>> GetAnimales()
        {
            // REGLA DE NEGOCIO: Solo mostrar publicaciones de las últimas 2 semanas (15 días)
            // Esto evita que el mapa se llene de datos viejos/abandonados.
            var fechaLimite = DateTime.Now.AddDays(-15);

            var animales = await _context.Animales
                                         .Include(a => a.Especie)
                                         .Include(a => a.Estado)
                                         // Aquí está el filtro mágico:
                                         .Where(a => a.FechaPublicacion >= fechaLimite) 
                                         .ToListAsync();

            return Ok(animales);
        }

        // --- ENDPOINT 2: OBTENER UN SOLO ANIMAL POR ID (GET) ---
        [HttpGet("{id}")]
        public async Task<ActionResult<Animal>> GetAnimal(int id)
        {
            var animal = await _context.Animales
                                       .Include(a => a.Especie)
                                       .Include(a => a.Estado)
                                       .FirstOrDefaultAsync(a => a.Id == id);

            if (animal == null)
            {
                return NotFound(); // Retorna HTTP 404 si no existe
            }

            return Ok(animal);
        }

        // --- ENDPOINT 3: CREAR UN NUEVO ANIMAL (POST) ---
        [HttpPost]
        public async Task<ActionResult<Animal>> PostAnimal(Animal animal)
        {
            // 1. Agregamos el objeto a la memoria del EF
            _context.Animales.Add(animal);
            
            // 2. Guardamos los cambios en la BD real
            await _context.SaveChangesAsync();

            // Retorna HTTP 201 (Created) y la ruta para consultar el nuevo animal
            // Devolvemos simplemente OK (200) con el objeto creado.
            return Ok(animal);
        }

        // --- ENDPOINT 4: ELIMINAR UN ANIMAL (DELETE) ---
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnimal(int id)
        {
            var animal = await _context.Animales.FindAsync(id);
            if (animal == null)
            {
                return NotFound();
            }

            _context.Animales.Remove(animal);
            await _context.SaveChangesAsync();

            return NoContent(); // Retorna 204 (Éxito sin contenido)
        }
    }
}