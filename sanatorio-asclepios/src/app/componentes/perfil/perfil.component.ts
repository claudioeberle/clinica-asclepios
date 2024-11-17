import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { usuario } from '../../interfaces/usuario';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Disponibilidad } from '../../interfaces/disponibilidad';
import { DisponibilidadService } from '../../services/disponibilidad.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit{

  usuario: usuario;
  mostrarPerfil1: boolean = true;
  prompt: string = '';
  especialidades: any[] = [];
  disponibilidad:any;
  horario: { [key: string]: { dia: string; desde: string; hasta: string } } = {
    lunes: { dia: 'lunes', desde: '', hasta: '' },
    martes: { dia: 'martes', desde: '', hasta: '' },
    miercoles: { dia: 'miercoles', desde: '', hasta: '' },
    jueves: { dia: 'jueves', desde: '', hasta: '' },
    viernes: { dia: 'viernes', desde: '', hasta: '' },
    sabado: { dia: 'sabado', desde: '', hasta: '' }
  };

  constructor(private auth: AuthService, private dispoServ:DisponibilidadService, private cdRef: ChangeDetectorRef) {
    this.usuario = this.auth.getCurrentUser();
  }

  async ngOnInit(){
    this.actualizarHorarios();
  }

  toggleFoto() {
    this.mostrarPerfil1 = !this.mostrarPerfil1;
  }

  obtenerOpcionesHorario(dia: string, tipo: 'desde' | 'hasta'): string[] {
    const opciones: string[] = [];
    let horaInicio: number;
    let horaFin: number;
  
    if (tipo === 'desde') {
      horaInicio = 8;
      horaFin = dia === 'sabado' ? 10 : 15;
    } 
    else {
      horaInicio = dia === 'sabado' ? 12 : 12;
      horaFin = dia === 'sabado' ? 14 : 19;
    }
  
    for (let i = horaInicio; i <= horaFin; i++) {
      opciones.push(`${i < 10 ? '0' + i : i}:00`);
    }
  
    return opciones;
  }

  esHorarioValido(): boolean {
    for (const dia in this.horario) {
      const desde = this.horario[dia].desde;
      const hasta = this.horario[dia].hasta;
  
      if (!desde || !hasta) continue;
  
      const desdeHora = parseInt(desde.split(':')[0], 10);
      const hastaHora = parseInt(hasta.split(':')[0], 10);
  
      if (hastaHora - desdeHora < 4) {
        return false;
      }
    }
    return true;
  }

  async actualizarHorarios(){
    try{
      this.disponibilidad = this.dispoServ.getDisponibilidadByEmail(this.usuario.email);
      if (this.disponibilidad) {
        const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    
        dias.forEach((dia, index) => {
          const disponibilidadDia = this.disponibilidad.disponibilidad[index];
          if (disponibilidadDia) {
            console.log(index);
            console.log(disponibilidadDia.desde);
            console.log(disponibilidadDia.hasta);
            this.horario[dia].desde = disponibilidadDia.desde || '';
            this.horario[dia].hasta = disponibilidadDia.hasta || '';
          }
        });
        this.cdRef.detectChanges();
      }else{
        console.log('No cargo la disponibilidad');
      }
    }catch(e){
      console.log('hubo un error');
      console.log(e);
    }
    
  }

  ActualizarDisponibilidad() {
    if (this.esHorarioValido()) {
      Swal.fire({
        title: '¿Estás seguro de que deseas actualizar la disponibilidad?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          const disponibilidadConDia = this.convertirHorariosADisponibilidad();
  
          this.dispoServ.actualizarDisponibilidad(this.usuario.email, disponibilidadConDia)
            .then(() => {
              Swal.fire(
                '¡Actualizado!',
                'Tus horarios se han actualizado correctamente.',
                'success'
              );
            })
            .catch((error) => {
              Swal.fire(
                'Error',
                'Hubo un problema al actualizar los horarios.',
                'error'
              );
            });
        }
      });
    } else {
      this.MostrarMensaje('Hay rangos horarios de menos de 4 hs.');
    }
  }
  
  convertirHorariosADisponibilidad() {
    const disponibilidad: { dia: string; desde: string; hasta: string }[] = [];
    
    for (const dia in this.horario) {
      const { desde, hasta } = this.horario[dia];
      if (desde && hasta) {
        disponibilidad.push({
          dia: dia,
          desde: desde,
          hasta: hasta
        });
      }
    }
    return disponibilidad;
  }

  MostrarMensaje(mensaje:string){
    this.prompt = mensaje;
    setTimeout(() => {
      this.prompt = '';
    }, 2000);
  }
}


