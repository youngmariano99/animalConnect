using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;

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

        // 1. GET: Obtener Muro Paginado
        // Url ejemplo: api/Foro?pagina=1&cantidad=5
        [HttpGet]
        public async Task<ActionResult> GetPosts([FromQuery] int pagina = 1, [FromQuery] int cantidad = 5)
        {
            var query = _context.Posts
                .Include(p => p.Usuario).ThenInclude(u => u.PerfilVeterinario)
                .Include(p => p.Usuario).ThenInclude(u => u.PerfilCiudadano)
                .OrderByDescending(p => p.FechaPublicacion);

            // Total para saber si hay más páginas
            var totalRegistros = await query.CountAsync();

            var posts = await query
                .Skip((pagina - 1) * cantidad)
                .Take(cantidad)
                .Select(p => new {
                    p.Id,
                    p.Titulo,
                    p.Contenido,
                    p.Categoria,
                    p.ImagenUrl,
                    p.FechaPublicacion,
                    
                    Autor = p.Usuario.Rol == "Veterinario" 
                        ? (p.Usuario.PerfilVeterinario != null ? p.Usuario.PerfilVeterinario.NombreVeterinaria : p.Usuario.NombreUsuario)
                        : (p.Usuario.PerfilCiudadano != null && !string.IsNullOrEmpty(p.Usuario.PerfilCiudadano.NombreCompleto) ? p.Usuario.PerfilCiudadano.NombreCompleto : p.Usuario.NombreUsuario),
                    
                    EsVeterinario = p.Usuario.Rol == "Veterinario",
                    AutorId = p.UsuarioId,
                    AutorPuntos = p.Usuario.Rol == "Ciudadano" && p.Usuario.PerfilCiudadano != null ? p.Usuario.PerfilCiudadano.Puntos : 0,
                    
                    // OPTIMIZACIÓN: Solo traemos los últimos 3 comentarios inicialmente y el total real
                    TotalComentarios = p.Comentarios.Count(),
                    Comentarios = p.Comentarios.OrderByDescending(c => c.Fecha).Take(3).Select(c => new {
                        c.Id,
                        c.Contenido,
                        c.Fecha,
                        Autor = c.Usuario.Rol == "Veterinario" 
                            ? (c.Usuario.PerfilVeterinario != null ? c.Usuario.PerfilVeterinario.NombreVeterinaria : c.Usuario.NombreUsuario)
                            : (c.Usuario.PerfilCiudadano != null && !string.IsNullOrEmpty(c.Usuario.PerfilCiudadano.NombreCompleto) ? c.Usuario.PerfilCiudadano.NombreCompleto : c.Usuario.NombreUsuario),
                        EsVeterinario = c.Usuario.Rol == "Veterinario",
                        AutorPuntos = c.Usuario.Rol == "Ciudadano" && c.Usuario.PerfilCiudadano != null ? c.Usuario.PerfilCiudadano.Puntos : 0
                    }).OrderBy(c => c.Fecha).ToList() // Reordenamos cronológicamente para mostrar
                })
                .ToListAsync();

            return Ok(new { 
                data = posts, 
                total = totalRegistros,
                paginaActual = pagina,
                hayMas = (pagina * cantidad) < totalRegistros 
            });
        }

        // 1.1 GET: Cargar más comentarios de un post específico
        [HttpGet("{id}/comentarios")]
        public async Task<ActionResult> GetComentariosPost(int id, [FromQuery] int pagina = 1, [FromQuery] int cantidad = 10)
        {
            var comentarios = await _context.Comentarios
                .Where(c => c.PostId == id)
                .Include(c => c.Usuario).ThenInclude(u => u.PerfilVeterinario)
                .Include(c => c.Usuario).ThenInclude(u => u.PerfilCiudadano)
                .OrderBy(c => c.Fecha) // Orden cronológico normal
                .Skip((pagina - 1) * cantidad)
                .Take(cantidad)
                .Select(c => new {
                    c.Id,
                    c.Contenido,
                    c.Fecha,
                    Autor = c.Usuario.Rol == "Veterinario" 
                            ? (c.Usuario.PerfilVeterinario != null ? c.Usuario.PerfilVeterinario.NombreVeterinaria : c.Usuario.NombreUsuario)
                            : (c.Usuario.PerfilCiudadano != null && !string.IsNullOrEmpty(c.Usuario.PerfilCiudadano.NombreCompleto) ? c.Usuario.PerfilCiudadano.NombreCompleto : c.Usuario.NombreUsuario),
                    EsVeterinario = c.Usuario.Rol == "Veterinario",
                    AutorPuntos = c.Usuario.Rol == "Ciudadano" && c.Usuario.PerfilCiudadano != null ? c.Usuario.PerfilCiudadano.Puntos : 0
                })
                .ToListAsync();

            return Ok(comentarios);
        }

        // 2. POST: Crear Post (Igual que antes)
        [HttpPost]
        public async Task<ActionResult> CrearPost(Post post)
        {
            post.FechaPublicacion = DateTime.Now;
            _context.Posts.Add(post);
            
            int nuevosPuntos = 0;
            var perfil = await _context.PerfilesCiudadanos.FirstOrDefaultAsync(p => p.UsuarioId == post.UsuarioId);
            
            if (perfil != null)
            {
                if (post.Categoria == "Historia") perfil.Puntos += 50; 
                else perfil.Puntos += 5;
                nuevosPuntos = perfil.Puntos;
            }

            await _context.SaveChangesAsync();
            return Ok(new { post, nuevosPuntos });
        }

        // 3. POST: Comentar (Igual que antes)
        [HttpPost("{id}/comentar")]
        public async Task<ActionResult> Comentar(int id, Comentario comentario)
        {
            comentario.PostId = id;
            comentario.Fecha = DateTime.Now;
            _context.Comentarios.Add(comentario);

            int nuevosPuntos = 0;
            var perfil = await _context.PerfilesCiudadanos.FirstOrDefaultAsync(p => p.UsuarioId == comentario.UsuarioId);
            if (perfil != null)
            {
                perfil.Puntos += 2;
                nuevosPuntos = perfil.Puntos;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Comentario agregado", nuevosPuntos });
        }
    }
}