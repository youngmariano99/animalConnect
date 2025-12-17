using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;
using AnimalConnect.Backend.Services;

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComerciosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ComerciosController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. REGISTRAR UN NUEVO COMERCIO (Wizard)
        [HttpPost]
        public async Task<ActionResult<Comercio>> PostComercio(Comercio comercio)
        {
            // Validamos que el usuario exista
            var usuario = await _context.Usuarios.FindAsync(comercio.UsuarioId);
            if (usuario == null) return BadRequest("Usuario no válido.");

            _context.Comercios.Add(comercio);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetComercio", new { id = comercio.Id }, comercio);
        }

        // 2. BUSCAR COMERCIOS (Mapa y Lista)
        // GET: api/Comercios?lat=-34.6&lng=-58.4&radio=10&rubro=Peluquería
        [HttpGet]
        public async Task<ActionResult> GetComercios(
            [FromQuery] double? lat, 
            [FromQuery] double? lng, 
            [FromQuery] double radio = 20,
            [FromQuery] string? rubro = null) // Filtro opcional
        {
            var query = _context.Comercios.AsQueryable();

            // Filtrado básico por Rubro (Etiqueta) si se solicita
            if (!string.IsNullOrEmpty(rubro))
            {
                // Usamos ToLower para evitar problemas de mayúsculas
                query = query.Where(c => c.Etiquetas.ToLower().Contains(rubro.ToLower()));
            }

            var lista = await query.Select(c => new
            {
                c.Id,
                c.Nombre,
                c.Direccion,
                c.LogoUrl,
                c.Latitud,
                c.Longitud,
                c.Etiquetas,
                c.EsDestacado, // Para mostrarlo diferente en el mapa
                // Calculamos distancia si hay coordenadas
                DistanciaKm = (lat.HasValue && lng.HasValue) 
                    ? GeoService.CalcularDistanciaKm(lat.Value, lng.Value, c.Latitud, c.Longitud) 
                    : 0
            }).ToListAsync();

            // Filtro de radio geográfico (en memoria)
            if (lat.HasValue && lng.HasValue)
            {
                lista = lista.Where(x => x.DistanciaKm <= radio)
                             .OrderByDescending(x => x.EsDestacado) // Primero los destacados
                             .ThenBy(x => x.DistanciaKm)            // Luego los más cercanos
                             .ToList();
            }

            return Ok(lista);
        }

        // 3. OBTENER DETALLE Y CATÁLOGO
        [HttpGet("{id}")]
        public async Task<ActionResult> GetComercio(int id)
        {
            var comercio = await _context.Comercios
                .Include(c => c.Catalogo) // Traemos sus productos
                .FirstOrDefaultAsync(c => c.Id == id);

            if (comercio == null) return NotFound();

            return Ok(comercio);
        }

        // 4. MIS COMERCIOS (Para el perfil del comerciante)
        [HttpGet("mis-comercios/{usuarioId}")]
        public async Task<ActionResult> GetMisComercios(int usuarioId)
        {
            var misTiendas = await _context.Comercios
                .Where(c => c.UsuarioId == usuarioId)
                .Include(c => c.Catalogo)
                .ToListAsync();

            return Ok(misTiendas);
        }
        
        // 5. AGREGAR PRODUCTO AL CATÁLOGO
        [HttpPost("producto")]
        public async Task<IActionResult> PostProducto(ItemCatalogo item)
        {
            var comercio = await _context.Comercios.FindAsync(item.ComercioId);
            if (comercio == null) return NotFound("Comercio no encontrado");

            _context.ItemsCatalogo.Add(item);
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        // 6. ELIMINAR PRODUCTO
        [HttpDelete("producto/{id}")]
        public async Task<IActionResult> DeleteProducto(int id)
        {
            var item = await _context.ItemsCatalogo.FindAsync(id);
            if (item == null) return NotFound();

            _context.ItemsCatalogo.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Producto eliminado" });
        }
    }
}