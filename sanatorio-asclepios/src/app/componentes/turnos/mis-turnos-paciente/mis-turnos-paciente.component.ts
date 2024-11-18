import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Turno } from '../../../interfaces/turno';
import { usuario } from '../../../interfaces/usuario';
import { TurnosService } from '../../../services/turnos.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-turnos-paciente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-turnos-paciente.component.html',
  styleUrl: './mis-turnos-paciente.component.scss'
})
export class MisTurnosPacienteComponent {
  
  turnos: Turno[] = [];
  usuarioLogueado: usuario | null = null; 

  constructor(
    private turnosService: TurnosService,
    private auth: AuthService
  ) {
    this.usuarioLogueado = this.auth.getCurrentUser();
    this.cargarTurnos();
  }

  ngOnInit(): void {}

  async cargarTurnos(): Promise<void> {
    try {
      this.turnos = await this.turnosService.getTurnosPorPaciente(this.auth.getCurrentUserEmail());
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    }
  }

  async cancelarTurno(turno: Turno): Promise<void> {
    const { value: comentario } = await Swal.fire({
      title: 'Cancelar Turno',
      input: 'textarea',
      inputLabel: 'Motivo de la cancelación',
      inputPlaceholder: 'Escribe aquí el motivo...',
      inputAttributes: {
        'aria-label': 'Escribe aquí el motivo'
      },
      showCancelButton: true,
      confirmButtonText: 'Cancelar Turno',
      cancelButtonText: 'Volver'
    });

    if (comentario) {
      turno.estado = 'cancelado';
      turno.comentarioCancelacion = comentario;
      await this.turnosService.actualizarTurno(turno);
      await Swal.fire('¡Éxito!', 'Turno cancelado con éxito.', 'success');
      this.cargarTurnos();
    }
  }

  async verResena(turno: Turno): Promise<void> {
    if (turno.comentarioResena) {
      await Swal.fire({
        title: 'Reseña',
        text: turno.comentarioResena,
        icon: 'info',
        confirmButtonText: 'Cerrar'
      });
    }
  }

  async completarEncuesta(turno: Turno): Promise<void> {
    const { value: respuestas } = await Swal.fire({
      title: 'Encuesta',
      input: 'textarea',
      inputLabel: 'Escribe tu opinión sobre el servicio recibido:',
      inputPlaceholder: 'Escribe aquí tus respuestas...',
      inputAttributes: {
        'aria-label': 'Escribe tus respuestas'
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar Encuesta',
      cancelButtonText: 'Volver'
    });

    if (respuestas) {
      turno.encuestaCompleta = true;
      await this.turnosService.actualizarTurno(turno);
      await Swal.fire('¡Éxito!', 'Encuesta completada con éxito.', 'success');
      this.cargarTurnos();
    }
  }

  async calificarAtencion(turno: Turno): Promise<void> {
    const { value: puntuacion } = await Swal.fire({
      title: 'Calificar Atención',
      input: 'number',
      inputLabel: 'Califique la atención del 1 al 5',
      inputPlaceholder: '1, 2, 3, 4 o 5',
      inputAttributes: {
        min: '1',
        max: '5',
        step: '1',
        'aria-label': 'Calificación de 1 a 5'
      },
      showCancelButton: true,
      confirmButtonText: 'Siguiente',
      cancelButtonText: 'Volver'
    });

    if (puntuacion && +puntuacion >= 1 && +puntuacion <= 5) {
      const { value: comentario } = await Swal.fire({
        title: 'Calificar Atención',
        input: 'textarea',
        inputLabel: 'Deja un comentario sobre la atención:',
        inputPlaceholder: 'Escribe aquí tu comentario...',
        inputAttributes: {
          'aria-label': 'Escribe tu comentario'
        },
        showCancelButton: true,
        confirmButtonText: 'Enviar Calificación',
        cancelButtonText: 'Volver'
      });

      if (comentario) {
        turno.calificacionAtencion = {
          puntuacion: +puntuacion,
          comentario: comentario
        };
        await this.turnosService.actualizarTurno(turno);
        await Swal.fire('¡Éxito!', 'Calificación registrada con éxito.', 'success');
        this.cargarTurnos();
      }
    } else {
      await Swal.fire('Atención', 'La puntuación debe estar entre 1 y 5.', 'warning');
    }
  }
}