import { Component, OnInit } from '@angular/core';
import { Turno } from '../../interfaces/turno';
import { usuario } from '../../interfaces/usuario';
import { TurnosService } from '../../services/turnos.service';
import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { SpinnerService } from '../../services/spinner.service';
import { FotoUsuarioPipe } from '../../pipes/foto-usuario.pipe';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule ,FotoUsuarioPipe],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.scss'
})
export class PacientesComponent implements OnInit{
  turnos: Turno[] = [];
  pacientes: usuario[] = [];
  usuario:usuario | null;
  fotoActual: { [id: string]: boolean } = {};


  constructor(
    private turnoService:TurnosService,
    private auth:AuthService,
    private spinnerService:SpinnerService
  ){
    this.usuario = auth.getCurrentUser();
  } 

  async ngOnInit(){
    this.showSpinner();
    if(this.usuario?.email){
      this.turnos = await this.turnoService.getTurnosPorEspecialista(this.usuario?.email);
      this.pacientes = await firstValueFrom(this.auth.GetAllPacientes());
      this.filtrarPacientes();
    }
  }

  showSpinner(): void {
    this.spinnerService.show();
    setTimeout(() => {
      this.spinnerService.hide();
    }, 1000);
  }
  

  filtrarPacientes() {
    this.pacientes = this.pacientes.filter(paciente =>
      this.turnos.some(turno =>
        turno.paciente?.email === paciente.email && turno.estado === 'realizado'
      )
    );
  }

  toggleFoto(id: string): void {
    this.fotoActual[id] = !this.fotoActual[id];
  }

  getUltimosTresTurnos(email: string): Turno[] {
    const turnosPaciente = this.turnos
      .filter(turno => turno.paciente?.email === email && turno.estado === 'realizado');
    return turnosPaciente.slice(0, 3);
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

  async mostrarHistoriaClinica(email:string): Promise<void> {
    const historiasClinicas = await this.turnoService.getHistoriaClinicaCompleta(email);
  
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
