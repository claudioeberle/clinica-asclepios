import { Component } from '@angular/core';
import { usuario } from '../../../interfaces/usuario';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { EspecialistasService } from '../../../services/especialistas.service';
import { DisponibilidadService } from '../../../services/disponibilidad.service';
import { Disponibilidad } from '../../../interfaces/disponibilidad';
import { AuthService } from '../../../services/auth.service';
import { TurnosService } from '../../../services/turnos.service';
import { SpinnerService } from '../../../services/spinner.service';


@Component({
  selector: 'app-alta-turno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alta-turno.component.html',
  styleUrl: './alta-turno.component.scss'
})
export class AltaTurnoComponent {
  solicitante: usuario | null = null;
  paciente: usuario | null = null;
  pacientes: usuario[] = [];
  especialistas: usuario[] = [];
  especialistaSeleccionado: usuario | null = null;
  especialidades: string[] = [];
  especialidadSeleccionada: string | null = null;
  disponibilidadSeleccionada: Disponibilidad | undefined;
  diasDisponibles: string[] = [];
  fechaSeleccionada: string | null = null;
  turnosDisponibles = ['08:00', '08:30', '09:00'];
  pasoActual = 1;
  turnoSeleccionado: string | null = null;
  turnoCreado = false;

  constructor(
    private especialistasService: EspecialistasService,
    private disponibilidadService: DisponibilidadService,
    private auth:AuthService,
    private turnosServ:TurnosService,
    private spinnerService:SpinnerService
  ) {}

  ngOnInit() {
    this.solicitante = this.auth.getCurrentUser();
    this.definirPaciente();
    this.obtenerEspecialistas();
  }

  definirPaciente(){
    this.paciente = this.auth.getCurrentUser();
    if(this.solicitante && this.solicitante.esAdmin){
      this.paciente = null;
      this.obtenerPacientes();
    }
  }

  obtenerEspecialistas() {
    this.especialistasService.GetAllEspecialistas().subscribe(
      (especialistas) => {
        this.especialistas = especialistas;
      },
      (error) => {
        console.error('Error al obtener especialistas:', error);
      }
    );
  }

  obtenerPacientes() {
    this.auth.GetAllPacientes().subscribe(
      (pacientes) => {
        this.pacientes = pacientes;
      },
      (error) => {
        console.error('Error al obtener pacientes:', error);
      }
    );
  }

  seleccionarPaciente(paciente: usuario) {
    this.paciente = paciente;
    this.pasoActual = 1;
  }

  seleccionarEspecialista(especialista: usuario) {
    this.especialistaSeleccionado = especialista;
    this.pasoActual = 2;
    console.log('EMAIL: ' + especialista.email);

    if (especialista.email) {
      this.disponibilidadService.getDisponibilidadByEmail(especialista.email).subscribe({
        next: (disponibilidad) => {
          this.disponibilidadSeleccionada = disponibilidad;
          this.calcularDiasDisponibles();
          console.log('Disponibilidad del especialista:', this.disponibilidadSeleccionada);
        },
        error: (error) => {
          console.error('Error al obtener la disponibilidad:', error);
        },
        complete: () => {
          console.log('Finalizó la obtención de la disponibilidad.');
        },
      });
    }

    this.especialidades = especialista.especialidad
      .split(',')
      .map((esp) => esp.trim());
  }


  calcularDiasDisponibles() {
    if (!this.disponibilidadSeleccionada) return;

    const hoy = new Date();
    const diasFuturos: string[] = [];
    const diasDeLaSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  
    for (let i = 1; i <= 15; i++) {
      const diaFuturo = new Date(hoy);
      diaFuturo.setDate(hoy.getDate() + i);
  
      const diaDeLaSemana = diasDeLaSemana[diaFuturo.getDay()];
  
      const disponibilidadDelDia = this.disponibilidadSeleccionada.disponibilidad.find(
        (dispo) => dispo.dia === diaDeLaSemana
      );

      if (disponibilidadDelDia && disponibilidadDelDia.desde && disponibilidadDelDia.hasta) {
        const fechaFormateada = `${diaFuturo.getDate()}/${diaFuturo.getMonth() + 1}/${diaFuturo.getFullYear()}`;
        diasFuturos.push(fechaFormateada);
      }
    }
    this.diasDisponibles = diasFuturos;
  }

  seleccionarEspecialidad(especialidad: string) {
    this.especialidadSeleccionada = especialidad;
    console.log('Especialidad seleccionada:', this.especialidadSeleccionada);
  }

  getImagenEspecialidad(especialidad: string): string {
    const sinAcentos = especialidad
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const prefijo = 'esp-';
    const nombreEspecialidad = `${prefijo}${sinAcentos.toLowerCase().replace(' ', '-')}`;
    const imagenPath = `../../../../assets/iconos/${nombreEspecialidad}.svg`;
    return imagenPath;
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '../../../../assets/iconos/esp-clinica.svg';
  }

  seleccionarDia(dia: string) {
    this.fechaSeleccionada = dia;
    console.log(this.fechaSeleccionada);
    this.generarTurnos(this.fechaSeleccionada);
  }

  generarTurnos(fechaSeleccionada: string) {

    if (!this.disponibilidadSeleccionada) return;

    const diasDeLaSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const fecha = new Date(fechaSeleccionada.split('/').reverse().join('-'));
    const diaDeLaSemana = diasDeLaSemana[fecha.getDay()];
    console.log('Fecha convertida:', fecha);
    console.log('Día seleccionado:', diaDeLaSemana);
    console.log('Disponibilidad seleccionada:', this.disponibilidadSeleccionada.disponibilidad);

    const disponibilidadDelDia = this.disponibilidadSeleccionada.disponibilidad.find(
      (dispo) => dispo.dia === diaDeLaSemana
    );
  
    if (!disponibilidadDelDia || !disponibilidadDelDia.desde || !disponibilidadDelDia.hasta) {
      this.turnosDisponibles = [];
      return;
    }
  
    const turnos = [];
    const [horaDesde, minutoDesde] = disponibilidadDelDia.desde.split(':').map(Number);
    const [horaHasta, minutoHasta] = disponibilidadDelDia.hasta.split(':').map(Number);
  
    let horaActual = horaDesde;
    let minutoActual = minutoDesde;
  
    while (horaActual < horaHasta || (horaActual === horaHasta && minutoActual < minutoHasta)) {
      console.log(`Generando turno: ${horaActual}:${minutoActual}`);
      const turno = `${horaActual.toString().padStart(2, '0')}:${minutoActual.toString().padStart(2, '0')}`;
      turnos.push(turno);
  
      minutoActual += 30;
      if (minutoActual >= 60) {
        minutoActual = 0;
        horaActual++;
      }
    }
    this.turnosDisponibles = turnos;
    console.log('Turnos disponibles:', this.turnosDisponibles);
  }

  seleccionarTurno(turno:string){
    this.turnoSeleccionado = turno;
  }

  confirmarTurno(){
    const nuevoTurno = {
      inicio : this.turnoSeleccionado,
      fecha: this.fechaSeleccionada,
      ano:'2024',
      paciente:this.paciente,
      especialista:this.especialistaSeleccionado,
      especialidad:this.especialidadSeleccionada,
      otorgado:true
    }

    this.turnosServ.guardarTurno(nuevoTurno);
    this.showSpinner();
    if(this.turnoCreado){
      Swal.fire({
        title: "¡Su turno fue guardado con Éxito!",
        icon: "success"
      });
    }
  }

  reiniciarProceso(){
    this.definirPaciente();
    this.obtenerEspecialistas();
    this.pasoActual = 1;
    this.especialistaSeleccionado = null;
    this.especialidadSeleccionada = null;
    this.fechaSeleccionada = null;
    this.turnoSeleccionado = null;
  }

  showSpinner(): void {
    this.spinnerService.show();
    this.turnoCreado = true;
    setTimeout(() => {
      this.spinnerService.hide();
      this.turnoCreado = false;
      this.reiniciarProceso();
    }, 2000);
  }

}