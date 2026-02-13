using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace AnimalConnect.Backend.Services
{
    public class TurnosService : ITurnosService
    {
        private readonly ApplicationDbContext _context;

        public TurnosService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Clinica>> ObtenerClinicasDeTurno(double lat, double lon, double radioKm)
        {
            // 1. Obtener todas las marcadas como de turno
            var clinics = await _context.Clinicas
                                        .Where(c => c.EsDeTurno)
                                        .ToListAsync();

            var resultados = new List<Clinica>();
            bool huboCambios = false;

            // 2. Filtrar expiradas (Lazy Cleanup)
            foreach (var clinica in clinics)
            {
                // Si no tiene fecha o pasó más de 24hs, expira
                if (!clinica.FechaInicioTurno.HasValue || 
                    clinica.FechaInicioTurno.Value.AddHours(24) < DateTime.Now)
                {
                    clinica.EsDeTurno = false;
                    clinica.FechaInicioTurno = null;
                    huboCambios = true;
                }
                else
                {
                    // 3. Filtrar por distancia (si es válida)
                    var dist = GeoService.CalcularDistanciaKm(lat, lon, clinica.Latitud, clinica.Longitud);
                    if (dist <= radioKm)
                    {
                        resultados.Add(clinica);
                    }
                }
            }

            // 4. Guardar cambios si hubo expiraciones
            if (huboCambios)
            {
                await _context.SaveChangesAsync();
            }

            return resultados;
        }

        public async Task MarcarComoDeTurno(int clinicaId)
        {
            var clinica = await _context.Clinicas.FindAsync(clinicaId);
            if (clinica != null)
            {
                clinica.EsDeTurno = true;
                clinica.FechaInicioTurno = DateTime.Now;
                await _context.SaveChangesAsync();
            }
        }
    }
}
