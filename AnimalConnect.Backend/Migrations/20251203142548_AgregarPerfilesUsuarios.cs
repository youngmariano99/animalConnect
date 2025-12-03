using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnimalConnect.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AgregarPerfilesUsuarios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PerfilesCiudadanos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    NombreCompleto = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Barrio = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Telefono = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FotoPerfilUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerfilesCiudadanos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PerfilesCiudadanos_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PerfilesVeterinarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    NombreVeterinaria = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MatriculaProfesional = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Direccion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TelefonoProfesional = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Latitud = table.Column<double>(type: "float", nullable: false),
                    Longitud = table.Column<double>(type: "float", nullable: false),
                    HorariosAtencion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EstadoVerificacion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EsDeTurno = table.Column<bool>(type: "bit", nullable: false),
                    Biografia = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LogoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerfilesVeterinarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PerfilesVeterinarios_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PerfilesCiudadanos_UsuarioId",
                table: "PerfilesCiudadanos",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PerfilesVeterinarios_UsuarioId",
                table: "PerfilesVeterinarios",
                column: "UsuarioId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PerfilesCiudadanos");

            migrationBuilder.DropTable(
                name: "PerfilesVeterinarios");
        }
    }
}
