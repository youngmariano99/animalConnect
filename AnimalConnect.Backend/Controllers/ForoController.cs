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
        // 1. GET: Obtener Muro
        [HttpGet]
        public async Task<ActionResult> GetPosts(
            [FromQuery] int pagina = 1, 
            [FromQuery] int cantidad = 5, 
            [FromQuery] string? categoria = null,
            [FromQuery] double? lat = null, 
            [FromQuery] double? lng = null, 
            [FromQuery] double radio = 50)
        {
            var query = _context.Posts
                .Include(p => p.Usuario).ThenInclude(u => u.PerfilVeterinario)
                .Include(p => p.Usuario).ThenInclude(u => u.PerfilCiudadano)
                // 👇👇👇 AGREGAR ESTO PARA QUE NO DE ERROR EL BADGE 👇👇👇
                .Include(p => p.Usuario).ThenInclude(u => u.Organizaciones).ThenInclude(mo => mo.Organizacion)
                
                .Include(p => p.Comentarios).ThenInclude(c => c.Usuario).ThenInclude(u => u.PerfilVeterinario)
                .Include(p => p.Comentarios).ThenInclude(c => c.Usuario).ThenInclude(u => u.PerfilCiudadano)
                // 👇👇👇 TAMBIÉN PARA LOS COMENTARIOS 👇👇👇
                .Include(p => p.Comentarios).ThenInclude(c => c.Usuario).ThenInclude(u => u.Organizaciones).ThenInclude(mo => mo.Organizacion)
                
                .AsQueryable();

            if (!string.IsNullOrEmpty(categoria) && categoria != "Todas")
            {
                query = query.Where(p => p.Categoria == categoria);
            }

            query = query.OrderByDescending(p => p.FechaPublicacion);

            var todosLosPosts = await query.ToListAsync();
            var postsFiltrados = todosLosPosts;

            if (lat.HasValue && lng.HasValue)
            {
                postsFiltrados = todosLosPosts.Where(p => 
                {
                    if (p.Latitud.HasValue && p.Longitud.HasValue)
                        return GeoService.CalcularDistanciaKm(lat.Value, lng.Value, p.Latitud.Value, p.Longitud.Value) <= radio;
                    return true; 
                }).ToList();
            }

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
                    p.Latitud,
                    
                    Autor = p.Usuario.Rol == "Veterinario" 
                        ? p.Usuario.NombreUsuario 
                        : (p.Usuario.PerfilCiudadano != null ? p.Usuario.PerfilCiudadano.NombreCompleto : p.Usuario.NombreUsuario),
                    
                    EsVeterinario = p.Usuario.Rol == "Veterinario",
                    
                    // Ahora esto funcionará porque incluimos la relación arriba
                    NombreOng = p.Usuario.Organizaciones != null 
                        ? p.Usuario.Organizaciones
                            .Where(m => m.Organizacion != null && m.Organizacion.EstadoVerificacion == "Aprobado")
                            .Select(m => m.Organizacion!.Nombre)
                            .FirstOrDefault()
                        : null,

                    AutorId = p.UsuarioId,
                    TotalComentarios = p.Comentarios != null ? p.Comentarios.Count : 0,
                    
                    Comentarios = p.Comentarios != null ? p.Comentarios.OrderByDescending(c => c.Fecha).Take(3).Select(c => new {
                        c.Id,
                        c.Contenido,
                        c.Fecha,
                        Autor = c.Usuario.Rol == "Veterinario" ? c.Usuario.NombreUsuario : (c.Usuario.PerfilCiudadano != null ? c.Usuario.PerfilCiudadano.NombreCompleto : c.Usuario.NombreUsuario),
                        EsVeterinario = c.Usuario.Rol == "Veterinario",
                        
                        NombreOng = c.Usuario.Organizaciones != null
                            ? c.Usuario.Organizaciones
                                .Where(m => m.Organizacion != null && m.Organizacion.EstadoVerificacion == "Aprobado")
                                .Select(m => m.Organizacion!.Nombre)
                                .FirstOrDefault()
                            : null
                    }).OrderBy(c => c.Fecha).ToList() : new()
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
                // 👇👇👇 AGREGAR ESTO 👇👇👇
                .Include(c => c.Usuario).ThenInclude(u => u.Organizaciones).ThenInclude(mo => mo.Organizacion)
                
                .OrderBy(c => c.Fecha)
                .Skip((pagina - 1) * cantidad)
                .Take(cantidad)
                .ToListAsync(); // Traemos a memoria primero para proyectar tranquilos

            var resultado = comentarios.Select(c => new {
                    c.Id, c.Contenido, c.Fecha,
                    Autor = c.Usuario.Rol == "Veterinario" 
                        ? c.Usuario.NombreUsuario 
                        : (c.Usuario.PerfilCiudadano != null ? c.Usuario.PerfilCiudadano.NombreCompleto : c.Usuario.NombreUsuario),
                    EsVeterinario = c.Usuario.Rol == "Veterinario",
                    
                    // Lógica segura de badge
                    NombreOng = c.Usuario.Organizaciones != null
                            ? c.Usuario.Organizaciones
                                .Where(m => m.Organizacion != null && m.Organizacion.EstadoVerificacion == "Aprobado")
                                .Select(m => m.Organizacion!.Nombre)
                                .FirstOrDefault()
                            : null
                });

            return Ok(resultado);
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