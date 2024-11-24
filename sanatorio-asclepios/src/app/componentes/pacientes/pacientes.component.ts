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


}
