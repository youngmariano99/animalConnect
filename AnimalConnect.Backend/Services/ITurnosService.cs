using AnimalConnect.Backend.Models;

namespace AnimalConnect.Backend.Services
{
    public interface ITurnosService
    {
        Task<IEnumerable<Clinica>> ObtenerClinicasDeTurno(double lat, double lon, double radioKm);
        Task MarcarComoDeTurno(int clinicaId);
    }
}
