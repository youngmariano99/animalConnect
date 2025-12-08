using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnimalConnect.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AgregarGeoUsuarioYPost : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitud",
                table: "Posts",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitud",
                table: "Posts",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "LatitudHome",
                table: "PerfilesCiudadanos",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "LongitudHome",
                table: "PerfilesCiudadanos",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitud",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "Longitud",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "LatitudHome",
                table: "PerfilesCiudadanos");

            migrationBuilder.DropColumn(
                name: "LongitudHome",
                table: "PerfilesCiudadanos");
        }
    }
}
