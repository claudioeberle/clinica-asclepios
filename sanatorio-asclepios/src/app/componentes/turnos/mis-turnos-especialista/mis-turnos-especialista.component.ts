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
import { FormsModule } from '@angular/forms';
import { HighlightEstadoDirective } from '../../../directives/highlight-estado.directive';
import { HighlightCoincidenciaDirective } from '../../../directives/highlight-coincidencia.directive';


@Component({
  selector: 'app-mis-turnos-especialista',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    HighlightEstadoDirective,
    HighlightCoincidenciaDirective
  ],
  templateUrl: './mis-turnos-especialista.component.html',
  styleUrl: './mis-turnos-especialista.component.scss'
})
export class MisTurnosEspecialistaComponent {

  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  filtroBusqueda: string = '';
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
      this.turnosFiltrados = [...this.turnos];
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
      turno.estado = 'realizado';
      turno.comentarioResena = formValues.comentario;
      turno.diagnostico = formValues.diagnostico;
      await this.turnosService.actualizarTurno(turno);
      await Swal.fire('¡Éxito!', 'Turno finalizado con éxito.', 'success');

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

  cargarHistoriaClinica(turno: Turno): void {
    const dialogRef = this.dialog.open(HistoriaClinicaComponent, {
      data: { turno },
      disableClose: true,
    });
  
    dialogRef.afterClosed().subscribe(async (historiaClinicaData) => {
      if (historiaClinicaData) {
        try {
          console.log(historiaClinicaData);
          turno.historiaClinica = historiaClinicaData;
          await this.turnosService.actualizarTurno(turno);
          await Swal.fire('¡Éxito!', 'La historia clínica ha sido cargada.', 'success');
          this.cargarTurnos();
        } catch (error) {
          console.error('Error al guardar la historia clínica:', error);
          await Swal.fire('Error', 'No se pudo guardar la historia clínica. Intente nuevamente.', 'error');
        }
      }else{
        console.log('Proceso de carga de historia clínica cancelado.')
      }
    });
  }

  verHistoriaClinica(turno: Turno): void {
    if (!turno.historiaClinica) {
      Swal.fire({
        title: 'Historia Clínica',
        text: 'No hay información registrada para este turno.',
        icon: 'warning',
        confirmButtonText: 'Cerrar',
      });
      return;
    }
    
      const historiaClinica = turno.historiaClinica.historiaClinica;
  
      let htmlContent = `
        <ul style="text-align: left; list-style: none; padding: 0;">
          <li><strong>Altura:</strong> ${historiaClinica.altura} cm</li>
          <li><strong>Peso:</strong> ${historiaClinica.peso} kg</li>
          <li><strong>Temperatura:</strong> ${historiaClinica.temperatura} °C</li>
          <li><strong>Presión:</strong> ${historiaClinica.presion}</li>
        </ul>
      `;
    
      if (historiaClinica.datosDinamicos && historiaClinica.datosDinamicos.length > 0) {
        htmlContent += `<h4>Datos adicionales:</h4><ul style="text-align: left; list-style: none; padding: 0;">`;
    
        historiaClinica.datosDinamicos.forEach((dato: { clave: string; valor: string }) => {
          htmlContent += `<li><strong>${dato.clave}:</strong> ${dato.valor}</li>`;
        });
    
        htmlContent += `</ul>`;
      }
      Swal.fire({
        title: 'Historia Clínica',
        html: htmlContent,
        icon: 'info',
        confirmButtonText: 'Cerrar',
      });
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
      const datosHistoriaClinica = turno.historiaClinica?.historiaClinica
        ? [
            turno.historiaClinica.historiaClinica.altura,
            turno.historiaClinica.historiaClinica.peso,
            turno.historiaClinica.historiaClinica.temperatura,
            turno.historiaClinica.historiaClinica.presion,
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

  async mostrarHistoriaClinica(email:string): Promise<void> {
    const historiasClinicas = await this.turnosService.getHistoriaClinicaCompleta(email);
  
    if (!historiasClinicas.length) {
      Swal.fire('Sin Historia Clínica', 'No hay atenciones registradas para este paciente.', 'info');
      return;
    }
  
    const historiaHtml = historiasClinicas
      .map(historia => `
        <div style="border: 1px solid #5f83b1; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
          <h4 style="color: #5f83b1;">Atención</h4>
          <p><strong>Fecha de Atención:</strong> ${new Date(historia.fecha_atencion).toLocaleDateString()}</p>
          <p><strong>Especialidad:</strong> ${historia.especialidad}</p>
          <p><strong>Especialista:</strong> ${historia.especialista}</p>
          <p><strong>Diagnóstico:</strong> ${historia.diagnostico}</p>
          <hr />
          <p><strong>Altura:</strong> ${historia.historiaClinica.altura} cm</p>
          <p><strong>Peso:</strong> ${historia.historiaClinica.peso} kg</p>
          <p><strong>Temperatura:</strong> ${historia.historiaClinica.temperatura} °C</p>
          <p><strong>Presión:</strong> ${historia.historiaClinica.presion}</p>
          ${
            historia.historiaClinica.datosDinamicos?.length
              ? `<h5>Datos Dinámicos:</h5>
                 <ul>
                   ${historia.historiaClinica.datosDinamicos.map(dato => `<li>${dato.clave}: ${dato.valor}</li>`).join('')}
                 </ul>`
              : ''
          }
        </div>
      `)
      .join('');
  
    Swal.fire({
      title: 'Historia Clínica',
      html: `<div style="max-height: 400px; overflow-y: auto;">${historiaHtml}</div>`,
      width: '600px',
      showCloseButton: true,
      confirmButtonText: 'Cerrar',
    });
  }








}