using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;
using AnimalConnect.Backend.Services; // 👈 GeoService

namespace AnimalConnect.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ForoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ForoController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. GET: Obtener Muro (Con Filtro Geoespacial)
        [HttpGet]
        public async Task<ActionResult> GetPosts(
            [FromQuery] int pagina = 1, 
            [FromQuery] int cantidad = 5, 
            [FromQuery] string? categoria = null,
            [FromQuery] double? lat = null, 
            [FromQuery] double? lng = null, 
            [FromQuery] double radio = 50) // 50km por defecto para comunidad
        {
            // A. Consulta Base (Incluyendo relaciones)
            var query = _context.Posts
                .Include(p => p.Usuario).ThenInclude(u => u.PerfilVeterinario)
                .Include(p => p.Usuario).ThenInclude(u => u.PerfilCiudadano)
                .Include(p => p.Comentarios).ThenInclude(c => c.Usuario).ThenInclude(u => u.PerfilVeterinario)
                .Include(p => p.Comentarios).ThenInclude(c => c.Usuario).ThenInclude(u => u.PerfilCiudadano)
                .AsQueryable();

            // B. Filtro Categoría
            if (!string.IsNullOrEmpty(categoria) && categoria != "Todas")
            {
                query = query.Where(p => p.Categoria == categoria);
            }

            // Ordenar por fecha (más nuevo arriba)
            query = query.OrderByDescending(p => p.FechaPublicacion);

            // C. Ejecución y Filtrado
            var todosLosPosts = await query.ToListAsync(); // Traemos a memoria
            var postsFiltrados = todosLosPosts;

            // SI hay ubicación, filtramos por distancia
            if (lat.HasValue && lng.HasValue)
            {
                postsFiltrados = todosLosPosts.Where(p => 
                {
                    // Prioridad 1: Ubicación del Post
                    if (p.Latitud.HasValue && p.Longitud.HasValue)
                        return GeoService.CalcularDistanciaKm(lat.Value, lng.Value, p.Latitud.Value, p.Longitud.Value) <= radio;
                    
                    // Prioridad 2: Fallback a ubicación del Usuario (si el post no tiene geo, usamos la casa del autor)
                    // (Esto requiere que hayas agregado LatitudHome a PerfilCiudadano, si no, omite esta línea)
                    /* var perfil = p.Usuario.PerfilCiudadano;
                    if (perfil != null) 
                         return GeoService.CalcularDistanciaKm(lat.Value, lng.Value, perfil.LatitudHome, perfil.LongitudHome) <= radio;
                    */

                    // Si no tiene ubicación ni el post ni el autor, lo mostramos por defecto (o lo ocultamos, decisión tuya)
                    return true; 
                }).ToList();
            }

            // D. Paginación en Memoria (Manual)
            var totalRegistros = postsFiltrados.Count;
            var postsPaginados = postsFiltrados
                .Skip((pagina - 1) * cantidad)
                .Take(cantidad)
                .Select(p => new {
                    p.Id,
                    p.Titulo,
                    p.Contenido,
                    p.Categoria,
                    p.ImagenUrl,
                    p.FechaPublicacion,
                    p.Latitud, // Devolvemos la data para depurar si quieres
                    
                    Autor = p.Usuario.Rol == "Veterinario" 
                        ? (p.Usuario.PerfilVeterinario != null ? p.Usuario.PerfilVeterinario.NombreVeterinaria : p.Usuario.NombreUsuario)
                        : (p.Usuario.PerfilCiudadano != null && !string.IsNullOrEmpty(p.Usuario.PerfilCiudadano.NombreCompleto) ? p.Usuario.PerfilCiudadano.NombreCompleto : p.Usuario.NombreUsuario),
                    
                    EsVeterinario = p.Usuario.Rol == "Veterinario",
                    AutorId = p.UsuarioId,
                    AutorPuntos = p.Usuario.Rol == "Ciudadano" && p.Usuario.PerfilCiudadano != null ? p.Usuario.PerfilCiudadano.Puntos : 0,
                    
                    TotalComentarios = p.Comentarios.Count(),
                    Comentarios = p.Comentarios.OrderByDescending(c => c.Fecha).Take(3).Select(c => new {
                        c.Id,
                        c.Contenido,
                        c.Fecha,
                        Autor = c.Usuario.Rol == "Veterinario" 
                            ? (c.Usuario.PerfilVeterinario != null ? c.Usuario.PerfilVeterinario.NombreVeterinaria : c.Usuario.NombreUsuario)
                            : (c.Usuario.PerfilCiudadano != null && !string.IsNullOrEmpty(c.Usuario.PerfilCiudadano.NombreCompleto) ? c.Usuario.PerfilCiudadano.NombreCompleto : c.Usuario.NombreUsuario),
                        EsVeterinario = c.Usuario.Rol == "Veterinario"
                    }).OrderBy(c => c.Fecha).ToList()
                })
                .ToList();

            return Ok(new { 
                data = postsPaginados, 
                total = totalRegistros,
                paginaActual = pagina,
                hayMas = (pagina * cantidad) < totalRegistros 
            });
        }

        // 2. POST: Crear Post (Ahora guarda ubicación)
        [HttpPost]
        public async Task<ActionResult> CrearPost(Post post)
        {
            post.FechaPublicacion = DateTime.Now;
            // Latitud y Longitud vienen en el body gracias al binding automático de JSON
            
            _context.Posts.Add(post);
            
            // Gamificación
            var perfil = await _context.PerfilesCiudadanos.FirstOrDefaultAsync(p => p.UsuarioId == post.UsuarioId);
            int nuevosPuntos = 0;
            if (perfil != null)
            {
                if (post.Categoria == "Historia") perfil.Puntos += 50; 
                else perfil.Puntos += 5;
                nuevosPuntos = perfil.Puntos;
            }

            await _context.SaveChangesAsync();
            return Ok(new { post, nuevosPuntos });
        }

        // ... (Mantén GetComentariosPost y Comentar igual que antes) ...
        [HttpGet("{id}/comentarios")]
        public async Task<ActionResult> GetComentariosPost(int id, [FromQuery] int pagina = 1, [FromQuery] int cantidad = 10)
        {
             var comentarios = await _context.Comentarios
                .Where(c => c.PostId == id)
                .Include(c => c.Usuario).ThenInclude(u => u.PerfilVeterinario)
                .Include(c => c.Usuario).ThenInclude(u => u.PerfilCiudadano)
                .OrderBy(c => c.Fecha)
                .Skip((pagina - 1) * cantidad)
                .Take(cantidad)
                .Select(c => new {
                    c.Id, c.Contenido, c.Fecha,
                    Autor = c.Usuario.Rol == "Veterinario" 
                            ? (c.Usuario.PerfilVeterinario != null ? c.Usuario.PerfilVeterinario.NombreVeterinaria : c.Usuario.NombreUsuario)
                            : (c.Usuario.PerfilCiudadano != null && !string.IsNullOrEmpty(c.Usuario.PerfilCiudadano.NombreCompleto) ? c.Usuario.PerfilCiudadano.NombreCompleto : c.Usuario.NombreUsuario),
                    EsVeterinario = c.Usuario.Rol == "Veterinario"
                }).ToListAsync();
            return Ok(comentarios);
        }

        [HttpPost("{id}/comentar")]
        public async Task<ActionResult> Comentar(int id, Comentario comentario)
        {
            comentario.PostId = id;
            comentario.Fecha = DateTime.Now;
            _context.Comentarios.Add(comentario);
            
            var perfil = await _context.PerfilesCiudadanos.FirstOrDefaultAsync(p => p.UsuarioId == comentario.UsuarioId);
            int nuevosPuntos = 0;
            if (perfil != null) { perfil.Puntos += 2; nuevosPuntos = perfil.Puntos; }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Comentario agregado", nuevosPuntos });
        }
    }
}