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

        // 1. GET: Obtener Muro (Recientes primero)
        [HttpGet]
        public async Task<ActionResult> GetPosts()
        {
            var posts = await _context.Posts
                .Include(p => p.Usuario).ThenInclude(u => u.PerfilVeterinario) // Para ver si es Vet
                .Include(p => p.Usuario).ThenInclude(u => u.PerfilCiudadano)   // Para ver nombre ciudadano
                .Include(p => p.Comentarios).ThenInclude(c => c.Usuario).ThenInclude(u => u.PerfilVeterinario)
                .OrderByDescending(p => p.FechaPublicacion)
                .Select(p => new {
                    p.Id,
                    p.Titulo,
                    p.Contenido,
                    p.Categoria,
                    p.ImagenUrl,
                    p.FechaPublicacion,
                    Autor = p.Usuario.Rol == "Veterinario" ? p.Usuario.PerfilVeterinario.NombreVeterinaria : p.Usuario.PerfilCiudadano.NombreCompleto,
                    EsVeterinario = p.Usuario.Rol == "Veterinario",
                    AutorId = p.UsuarioId,
                    Comentarios = p.Comentarios.Select(c => new {
                        c.Id,
                        c.Contenido,
                        c.Fecha,
                        Autor = c.Usuario.Rol == "Veterinario" ? c.Usuario.PerfilVeterinario.NombreVeterinaria : c.Usuario.NombreUsuario,
                        EsVeterinario = c.Usuario.Rol == "Veterinario"
                    }).OrderBy(c => c.Fecha).ToList()
                })
                .ToListAsync();

            return Ok(posts);
        }

        // 2. POST: Publicar nuevo tema (y sumar puntos si es Historia)
        [HttpPost]
        public async Task<ActionResult> CrearPost(Post post)
        {
            post.FechaPublicacion = DateTime.Now;
            _context.Posts.Add(post);

            // GAMIFICACIÓN: Si comparte una historia de éxito, suma puntos
            if (post.Categoria == "Historia")
            {
                var perfil = await _context.PerfilesCiudadanos.FirstOrDefaultAsync(p => p.UsuarioId == post.UsuarioId);
                if (perfil != null)
                {
                    perfil.Puntos += 50; // ¡50 Puntos por final feliz!
                }
            }
            // Puntos por participar (Duda/Aviso)
            else 
            {
                var perfil = await _context.PerfilesCiudadanos.FirstOrDefaultAsync(p => p.UsuarioId == post.UsuarioId);
                if (perfil != null) perfil.Puntos += 5; 
            }

            await _context.SaveChangesAsync();
            return Ok(post);
        }

        // 3. POST: Comentar (Veterinarios suman reputación aquí también)
        [HttpPost("{id}/comentar")]
        public async Task<ActionResult> Comentar(int id, Comentario comentario)
        {
            comentario.PostId = id;
            comentario.Fecha = DateTime.Now;
            _context.Comentarios.Add(comentario);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Comentario agregado" });
        }
    }
}