import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Turno } from '../../../interfaces/turno';
import { usuario } from '../../../interfaces/usuario';
import { AuthService } from '../../../services/auth.service';
import { TurnosService } from '../../../services/turnos.service';
import { HistoriaClinicaService } from '../../../services/historia-clinica.service';
import Swal from 'sweetalert2';
import { historiaClinica } from '../../../interfaces/historiaClinica';
import { MatDialog } from '@angular/material/dialog';
import { HistoriaClinicaComponent } from '../../historia-clinica/historia-clinica.component';


@Component({
  selector: 'app-mis-turnos-especialista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-turnos-especialista.component.html',
  styleUrl: './mis-turnos-especialista.component.scss'
})
export class MisTurnosEspecialistaComponent {

  turnos: Turno[] = [];
  usuarioLogueado: usuario | null = null; 

  constructor(
    private turnosService: TurnosService,
    private auth: AuthService,
    private historiaClinicaService:HistoriaClinicaService,
    private dialog:MatDialog
  ) {
    this.usuarioLogueado = this.auth.getCurrentUser();
    this.cargarTurnos();
  }

  async cargarTurnos(): Promise<void> {
    try {
      this.turnos = await this.turnosService.getTurnosPorEspecialista(this.auth.getCurrentUserEmail());
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

  async rechazarTurno(turno: Turno): Promise<void> {
    const { value: comentario } = await Swal.fire({
      title: 'Rechazar Turno',
      input: 'textarea',
      inputLabel: 'Motivo del rechazo',
      inputPlaceholder: 'Escribe el motivo aquí...',
      inputAttributes: {
        'aria-label': 'Escribe el motivo del rechazo'
      },
      showCancelButton: true,
      confirmButtonText: 'Rechazar Turno',
      cancelButtonText: 'Volver'
    });

    if (comentario) {
      turno.estado = 'rechazado';
      turno.comentarioRechazo = comentario;
      await this.turnosService.actualizarTurno(turno);
      await Swal.fire('¡Éxito!', 'El turno ha sido rechazado con éxito.', 'success');
      this.cargarTurnos();
    }
  }

  async aceptarTurno(turno: Turno): Promise<void> {
    const confirm = await Swal.fire({
      title: 'Aceptar Turno',
      text: '¿Estás seguro de aceptar este turno?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      turno.estado = 'aceptado';
      await this.turnosService.actualizarTurno(turno);
      await Swal.fire('¡Éxito!', 'El turno ha sido aceptado con éxito.', 'success');
      this.cargarTurnos();
    }
  }

  async finalizarTurno(turno: Turno): Promise<void> {
    const { value: formValues } = await Swal.fire({
      title: 'Finalizar Turno',
      html:
        `<label for="comentario" class="swal2-label">Reseña y Diagnóstico</label>` +
        `<textarea id="comentario" class="swal2-textarea" placeholder="Escribe la reseña aquí..."></textarea>` +
        `<textarea id="diagnostico" class="swal2-textarea" placeholder="Escribe el diagnóstico aquí..."></textarea>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Finalizar Turno',
      cancelButtonText: 'Volver',
      preConfirm: () => {
        const comentario = (document.getElementById('comentario') as HTMLTextAreaElement)?.value;
        const diagnostico = (document.getElementById('diagnostico') as HTMLTextAreaElement)?.value;
  
        if (!comentario || !diagnostico) {
          Swal.showValidationMessage('Ambos campos son obligatorios');
          return null;
        }
  
        return { comentario, diagnostico };
      }
    });
  
    if (formValues) {
      const dialogRef = this.dialog.open(HistoriaClinicaComponent, {
        data: { turno },
        disableClose: true
      });
  
      dialogRef.afterClosed().subscribe(async (historiaClinicaData) => {
        if (historiaClinicaData) {
          try {
            turno.estado = 'realizado';
            turno.comentarioResena = formValues.comentario;
            turno.diagnostico = formValues.diagnostico;
  
            await this.turnosService.actualizarTurno(turno);
  
            const nuevaHistoria: historiaClinica = {
              fecha_atencion: new Date(),
              especialista: this.usuarioLogueado!,
              paciente: turno.paciente!,
              turno: turno,
              ...historiaClinicaData
            };
  
            await this.historiaClinicaService.guardarHistoriaClinica(nuevaHistoria);
            await Swal.fire('¡Éxito!', 'El turno ha sido finalizado y la historia clínica guardada.', 'success');
            this.cargarTurnos();
          } catch (error) {
            console.error('Error al finalizar el turno:', error);
            await Swal.fire('Error', 'No se pudo finalizar el turno. Intente nuevamente.', 'error');
          }
        }
      });
    }
  }
  

  verResena(turno: Turno): void {
    Swal.fire({
      title: 'Reseña del Turno',
      text: turno.comentarioResena,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }

  verDiagnostico(turno: Turno): void {
    Swal.fire({
      title: 'Diagnóstico',
      text: turno.diagnostico,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }

  verMotivo(turno: Turno):void {
    switch(turno.estado){
      case 'cancelado':
        Swal.fire({
          title: 'Motivo de Cancelación',
          text: turno.comentarioCancelacion,
          icon: 'info',
          confirmButtonText: 'Cerrar'
        });
        break;
      case 'rechazado':
        Swal.fire({
          title: 'Motivo de Rechazo',
          text: turno.comentarioRechazo,
          icon: 'info',
          confirmButtonText: 'Cerrar'
        });
        break;
    }
  }
}