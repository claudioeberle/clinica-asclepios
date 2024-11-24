import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Turno } from '../../../interfaces/turno';
import { usuario } from '../../../interfaces/usuario';
import { AuthService } from '../../../services/auth.service';
import { TurnosService } from '../../../services/turnos.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightPipe } from '../../../pipes/highlight.pipe';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, HighlightPipe],
  templateUrl: './turnos.component.html',
  styleUrl: './turnos.component.scss'
})
export class TurnosComponent {

  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  filtroBusqueda: string = '';
  usuarioLogueado: usuario | null = null; 

  constructor(
    private turnosService: TurnosService,
    private auth: AuthService
  ) {
    this.usuarioLogueado = this.auth.getCurrentUser();
    this.cargarTurnos();
  }

  async cargarTurnos(): Promise<void> {
    try {
      this.turnos = await this.turnosService.getTurnos();
      this.turnosFiltrados = [...this.turnos];
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    }
  }

  filtrarTurnos(): void {
    const filtro = this.filtroBusqueda.toLowerCase();

    this.turnosFiltrados = this.turnos.filter(turno => {
      // Datos del turno
      const datosTurno = [
        turno.especialidad,
        turno.estado,
        turno.fecha,
        turno.inicio,
        turno.diagnostico,
        turno.comentarioCancelacion,
        turno.comentarioResena,
      ];

      // Datos del paciente
      const datosPaciente = turno.paciente
        ? [
            turno.paciente.nombre,
            turno.paciente.apellido,
            turno.paciente.email,
            turno.paciente.dni?.toString(),
            turno.paciente.obra_social,
          ]
        : [];

      // Datos del especialista
      const datosEspecialista = turno.especialista
        ? [
            turno.especialista.nombre,
            turno.especialista.apellido,
            turno.especialista.email,
            turno.especialista.dni?.toString(),
          ]
        : [];

      // Datos de la historia clínica
      const datosHistoriaClinica = turno.historiaClinica
        ? [
            turno.historiaClinica.diagnostico,
            ...turno.historiaClinica.historiaClinica.datosDinamicos?.map(
              dato => `${dato.clave}: ${dato.valor}`
            ) || [],
          ]
        : [];

      // Unir todos los datos y buscar el filtro
      const todosLosDatos = [
        ...datosTurno,
        ...datosPaciente,
        ...datosEspecialista,
        ...datosHistoriaClinica,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return todosLosDatos.includes(filtro);
    });
  }

  async cancelarTurno(turno: Turno): Promise<void> {
    const { value: comentario } = await Swal.fire({
      title: 'Cancelar Turno',
      input: 'textarea',
      inputLabel: 'Motivo de la cancelación',
      inputPlaceholder: 'Escribe el motivo aquí...',
      inputAttributes: {
        'aria-label': 'Escribe el motivo de la cancelación'
      },
      showCancelButton: true,
      confirmButtonText: 'Cancelar Turno',
      cancelButtonText: 'Volver'
    });

    if (comentario) {
      turno.estado = 'cancelado';
      turno.comentarioCancelacion = comentario;
      await this.turnosService.actualizarTurno(turno);
      await Swal.fire('¡Éxito!', 'El turno ha sido cancelado con éxito.', 'success');
      this.cargarTurnos();
    }
  }

  verMotivo(turno: Turno):void {
    Swal.fire({
      title: 'Motivo de Cancelación',
      text: turno.comentarioCancelacion,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }
}