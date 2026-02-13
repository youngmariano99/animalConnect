using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;
using AnimalConnect.Backend.Services;
using NetTopologySuite.Geometries; // Namespace for Point
using NetTopologySuite; // For NtsGeometryServices

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

        // 1. REGISTRAR UN NUEVO COMERCIO
        [HttpPost]
        public async Task<ActionResult<Comercio>> PostComercio(Comercio comercio)
        {
            // Validamos que el usuario exista
            var usuario = await _context.Usuarios.FindAsync(comercio.UsuarioId);
            if (usuario == null) return BadRequest("Usuario no válido.");

            // GEO: Crear Point desde los datos temporales (Lat/Lon vienen del binding)
             if (comercio.Latitud != 0 && comercio.Longitud != 0)
            {
                var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
                comercio.Ubicacion = geometryFactory.CreatePoint(new Coordinate(comercio.Longitud, comercio.Latitud));
            }

            _context.Comercios.Add(comercio);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetComercio", new { id = comercio.Id }, comercio);
        }

        // 2. BUSCAR COMERCIOS (Mapa y Lista)
        [HttpGet]
        public async Task<ActionResult> GetComercios(
            [FromQuery] double? lat, 
            [FromQuery] double? lng, 
            [FromQuery] double radio = 20,
            [FromQuery] string? rubro = null) 
        {
            var query = _context.Comercios.AsQueryable();

            var comerciosDb = await query.Select(c => new
            {
                c.Id,
                c.Nombre,
                c.Direccion,
                c.LogoUrl,
                c.Ubicacion, // Traemos el objeto Ubicacion completo (si EF lo permite) ó sus coordenadas
                Latitud = c.Ubicacion != null ? c.Ubicacion.Y : 0, 
                Longitud = c.Ubicacion != null ? c.Ubicacion.X : 0,
                c.Etiquetas,
                c.EsDestacado
            }).ToListAsync();

            // Client-side mapping & filtering
            var lista = comerciosDb.Select(c => new 
            {
                c.Id,
                c.Nombre,
                c.Direccion,
                c.LogoUrl,
                c.Latitud,
                c.Longitud,
                c.Etiquetas,
                c.EsDestacado,
                DistanciaKm = (lat.HasValue && lng.HasValue) 
                    ? GeoService.CalcularDistanciaKm(lat.Value, lng.Value, c.Latitud, c.Longitud) 
                    : 0
            }).ToList(); // Convert to List to allow filtering logic below

            if (lat.HasValue && lng.HasValue)
            {
                lista = lista.Where(x => x.DistanciaKm <= radio)
                             .OrderByDescending(x => x.EsDestacado) 
                             .ThenBy(x => x.DistanciaKm)            
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

        // 7. ELIMINAR COMERCIO (Y sus productos en cascada)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComercio(int id)
        {
            var comercio = await _context.Comercios.FindAsync(id);
            if (comercio == null) return NotFound();

            // Verificamos que el usuario que borra sea el dueño (Seguridad básica)
            // En un caso real, deberías obtener el ID del usuario logueado desde el token.
            // Por ahora confiamos en que el frontend manda el ID correcto, pero idealmente:
            // if (comercio.UsuarioId != usuarioIdLogueado) return Forbid();

            _context.Comercios.Remove(comercio);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Comercio eliminado con éxito." });
        }
    }
}