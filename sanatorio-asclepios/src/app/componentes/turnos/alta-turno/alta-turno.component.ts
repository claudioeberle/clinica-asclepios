import { Component } from '@angular/core';
import { usuario } from '../../../interfaces/usuario';
import { EspecialistasService } from '../../../services/especialistas.service';
import { TurnosService } from '../../../services/turnos.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { EspecialidadesService } from '../../../services/especialidades.service';

@Component({
  selector: 'app-alta-turno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alta-turno.component.html',
  styleUrl: './alta-turno.component.scss'
})
export class AltaTurnoComponent {
  
  especialistas: usuario[] = [];
  especialidades: any[] = [];
  diasDisponibles: Date[] = [];
  turnosDisponibles: string[] = [];
  pasoActual = 1;

  especialistaSeleccionado?: usuario;
  especialidadSeleccionada?: string;
  diaSeleccionado?: Date;
  turnoSeleccionado?: string;

  constructor(
    private especialistasService: EspecialistasService,
    private especialidadesService: EspecialidadesService,
    private turnosService: TurnosService
  ) {}

  ngOnInit(): void {
    this.cargarEspecialistas();
  }

  cargarEspecialistas() {
    this.especialistasService.GetAllEspecialistas().subscribe(data => {
      this.especialistas = data;
    });
  }

  async seleccionarEspecialista(especialista: usuario) {
    this.especialistaSeleccionado = especialista;
    console.log(this.especialistaSeleccionado);
  
    console.log(this.especialistaSeleccionado.email);
  
    const especialidadesMedico = await this.especialidadesService.obtenerEspecialidadesPorEmail(this.especialistaSeleccionado.email);
    
    especialidadesMedico.forEach((especialidad: string) => {
      this.especialidades.push(especialidad);
    });
  
    console.log(this.especialidades);
    this.pasoActual = 2;
  }

  seleccionarEspecialidad(especialidad: string) {
    if (this.especialistaSeleccionado) {
      this.especialidadSeleccionada = especialidad;
      this.diasDisponibles = this.turnosService.obtenerDiasDisponibles(this.especialistaSeleccionado, especialidad);
      this.pasoActual = 3;
    }
  }

  seleccionarDia(dia: Date) {
    if (this.especialistaSeleccionado && this.especialidadSeleccionada) {
      this.diaSeleccionado = dia;
      this.turnosDisponibles = this.turnosService.obtenerTurnosDisponibles(
        this.especialistaSeleccionado,
        this.especialidadSeleccionada,
        dia
      );
      this.pasoActual = 4;
    } else {
      console.error("Especialista o especialidad no seleccionados.");
    }
  }

  seleccionarTurno(turno: string) {
    this.turnoSeleccionado = turno;
    this.pasoActual = 5;
    console.log('Turno seleccionado:', turno);
    console.log('Paso actual:', this.pasoActual);
  }

  confirmarTurno() {
    Swal.fire({
      title: 'Turno Confirmado',
      text: `Turno confirmado con ${this.especialistaSeleccionado?.nombre} ${this.diaSeleccionado} a las ${this.turnoSeleccionado}`,
      icon: "success"
    });
    this.reiniciarProceso();
  }

  cancelarTurno() {
    this.reiniciarProceso();
  }

  reiniciarProceso() {
    this.especialistaSeleccionado = undefined;
    this.especialidadSeleccionada = undefined;
    this.diaSeleccionado = undefined;
    this.turnoSeleccionado = undefined;
    this.pasoActual = 1;
  }


}
