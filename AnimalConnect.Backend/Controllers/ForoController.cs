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
                .Include(p => p.Usuario).ThenInclude(u => u.PerfilVeterinario)
                .Include(p => p.Usuario).ThenInclude(u => u.PerfilCiudadano)
                .Include(p => p.Comentarios).ThenInclude(c => c.Usuario).ThenInclude(u => u.PerfilVeterinario)
                .Include(p => p.Comentarios).ThenInclude(c => c.Usuario).ThenInclude(u => u.PerfilCiudadano) // <--- FALTABA ESTO PARA COMENTARIOS
                .OrderByDescending(p => p.FechaPublicacion)
                .Select(p => new {
                    p.Id,
                    p.Titulo,
                    p.Contenido,
                    p.Categoria,
                    p.ImagenUrl,
                    p.FechaPublicacion,
                    
                    // LÓGICA ROBUSTA PARA NOMBRE DE AUTOR (POST)
                    Autor = p.Usuario.Rol == "Veterinario" 
                        ? (p.Usuario.PerfilVeterinario != null ? p.Usuario.PerfilVeterinario.NombreVeterinaria : p.Usuario.NombreUsuario)
                        : (p.Usuario.PerfilCiudadano != null && !string.IsNullOrEmpty(p.Usuario.PerfilCiudadano.NombreCompleto) ? p.Usuario.PerfilCiudadano.NombreCompleto : p.Usuario.NombreUsuario),
                    
                    EsVeterinario = p.Usuario.Rol == "Veterinario",
                    AutorId = p.UsuarioId,
                    AutorPuntos = p.Usuario.Rol == "Ciudadano" && p.Usuario.PerfilCiudadano != null ? p.Usuario.PerfilCiudadano.Puntos : 0,
                    
                    Comentarios = p.Comentarios.Select(c => new {
                        c.Id,
                        c.Contenido,
                        c.Fecha,
                        
                        // LÓGICA ROBUSTA PARA NOMBRE DE AUTOR (COMENTARIO)
                        Autor = c.Usuario.Rol == "Veterinario" 
                            ? (c.Usuario.PerfilVeterinario != null ? c.Usuario.PerfilVeterinario.NombreVeterinaria : c.Usuario.NombreUsuario)
                            : (c.Usuario.PerfilCiudadano != null && !string.IsNullOrEmpty(c.Usuario.PerfilCiudadano.NombreCompleto) ? c.Usuario.PerfilCiudadano.NombreCompleto : c.Usuario.NombreUsuario),
                        
                        EsVeterinario = c.Usuario.Rol == "Veterinario",
                        AutorPuntos = c.Usuario.Rol == "Ciudadano" && c.Usuario.PerfilCiudadano != null ? c.Usuario.PerfilCiudadano.Puntos : 0
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
            
            int nuevosPuntos = 0;

            // LÓGICA DE PUNTOS
            // Solo sumamos si es un Ciudadano (los Vets tienen otra reputación)
            var perfil = await _context.PerfilesCiudadanos.FirstOrDefaultAsync(p => p.UsuarioId == post.UsuarioId);
            
            if (perfil != null)
            {
                if (post.Categoria == "Historia") perfil.Puntos += 50; // Gran premio
                else perfil.Puntos += 5; // Premio estándar

                nuevosPuntos = perfil.Puntos;
            }

            await _context.SaveChangesAsync();
            
            // IMPORTANTE: Devolvemos el objeto y los NUEVOS PUNTOS para actualizar el front
            return Ok(new { post, nuevosPuntos });
        }

        // 3. POST: Comentar (Veterinarios suman reputación aquí también)
        [HttpPost("{id}/comentar")]
        public async Task<ActionResult> Comentar(int id, Comentario comentario)
        {
            comentario.PostId = id;
            comentario.Fecha = DateTime.Now;
            _context.Comentarios.Add(comentario);

            int nuevosPuntos = 0;

            // SUMAR PUNTOS POR COMENTAR
            var perfil = await _context.PerfilesCiudadanos.FirstOrDefaultAsync(p => p.UsuarioId == comentario.UsuarioId);
            if (perfil != null)
            {
                perfil.Puntos += 2; // Ejemplo: 2 puntos por ayudar/comentar
                nuevosPuntos = perfil.Puntos;
            }

            await _context.SaveChangesAsync();

            // Devolvemos los puntos actualizados
            return Ok(new { message = "Comentario agregado", nuevosPuntos });
        }
    }
}