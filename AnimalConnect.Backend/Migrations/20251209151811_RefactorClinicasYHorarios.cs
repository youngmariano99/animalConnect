using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AnimalConnect.Backend.Migrations
{
    /// <inheritdoc />
    public partial class RefactorClinicasYHorarios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Direccion",
                table: "PerfilesVeterinarios");

            migrationBuilder.DropColumn(
                name: "EsDeTurno",
                table: "PerfilesVeterinarios");

            migrationBuilder.DropColumn(
                name: "HorariosAtencion",
                table: "PerfilesVeterinarios");

            migrationBuilder.DropColumn(
                name: "Latitud",
                table: "PerfilesVeterinarios");

            migrationBuilder.DropColumn(
                name: "Longitud",
                table: "PerfilesVeterinarios");

            migrationBuilder.DropColumn(
                name: "NombreVeterinaria",
                table: "PerfilesVeterinarios");

            migrationBuilder.DropColumn(
                name: "TelefonoProfesional",
                table: "PerfilesVeterinarios");

            migrationBuilder.RenameColumn(
                name: "LogoUrl",
                table: "PerfilesVeterinarios",
                newName: "FotoPerfilUrl");

            migrationBuilder.CreateTable(
                name: "Clinicas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Direccion = table.Column<string>(type: "text", nullable: false),
                    Telefono = table.Column<string>(type: "text", nullable: false),
                    LogoUrl = table.Column<string>(type: "text", nullable: true),
                    Latitud = table.Column<double>(type: "double precision", nullable: false),
                    Longitud = table.Column<double>(type: "double precision", nullable: false),
                    EsDeTurno = table.Column<bool>(type: "boolean", nullable: false),
                    HorariosEstructurados = table.Column<string>(type: "text", nullable: false),
                    PerfilVeterinarioId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clinicas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Clinicas_PerfilesVeterinarios_PerfilVeterinarioId",
                        column: x => x.PerfilVeterinarioId,
                        principalTable: "PerfilesVeterinarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HorariosClinicas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClinicaId = table.Column<int>(type: "integer", nullable: false),
                    DiaSemana = table.Column<int>(type: "integer", nullable: false),
                    HoraApertura = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    HoraCierre = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HorariosClinicas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HorariosClinicas_Clinicas_ClinicaId",
                        column: x => x.ClinicaId,
                        principalTable: "Clinicas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Clinicas_PerfilVeterinarioId",
                table: "Clinicas",
                column: "PerfilVeterinarioId");

            migrationBuilder.CreateIndex(
                name: "IX_HorariosClinicas_ClinicaId",
                table: "HorariosClinicas",
                column: "ClinicaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HorariosClinicas");

            migrationBuilder.DropTable(
                name: "Clinicas");

            migrationBuilder.RenameColumn(
                name: "FotoPerfilUrl",
                table: "PerfilesVeterinarios",
                newName: "LogoUrl");

            migrationBuilder.AddColumn<string>(
                name: "Direccion",
                table: "PerfilesVeterinarios",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "EsDeTurno",
                table: "PerfilesVeterinarios",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "HorariosAtencion",
                table: "PerfilesVeterinarios",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "Latitud",
                table: "PerfilesVeterinarios",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitud",
                table: "PerfilesVeterinarios",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "NombreVeterinaria",
                table: "PerfilesVeterinarios",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TelefonoProfesional",
                table: "PerfilesVeterinarios",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
