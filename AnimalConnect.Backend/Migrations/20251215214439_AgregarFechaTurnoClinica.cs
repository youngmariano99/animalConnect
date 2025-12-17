using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnimalConnect.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AgregarFechaTurnoClinica : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "FechaInicioTurno",
                table: "Clinicas",
                type: "timestamp without time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FechaInicioTurno",
                table: "Clinicas");
        }
    }
}
