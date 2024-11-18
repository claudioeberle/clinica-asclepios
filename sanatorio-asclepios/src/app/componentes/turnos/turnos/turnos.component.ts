import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Turno } from '../../../interfaces/turno';
import { usuario } from '../../../interfaces/usuario';
import { AuthService } from '../../../services/auth.service';
import { TurnosService } from '../../../services/turnos.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './turnos.component.html',
  styleUrl: './turnos.component.scss'
})
export class TurnosComponent {

  turnos: Turno[] = [];
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
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    }
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