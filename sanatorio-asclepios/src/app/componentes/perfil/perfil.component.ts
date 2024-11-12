import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { usuario } from '../../interfaces/usuario';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit{

  usuario: usuario;
  mostrarPerfil1: boolean = true;
  especialidades: any[] = [];

  constructor(private auth: AuthService) {
    this.usuario = this.auth.getCurrentUser();
  }

  ngOnInit(): void {
    this.initializeEspecialidades();
  }

  toggleFoto() {
    this.mostrarPerfil1 = !this.mostrarPerfil1;
  }

 
  initializeEspecialidades() {
    // Crear las especialidades y los días con estado por defecto "Activo"
    this.especialidades = this.usuario.especialidad.split(',').map((especialidad) => ({
      nombre: especialidad.trim(),
      dias: {
        Lunes: 'Activo',
        Martes: 'Activo',
        Miércoles: 'Activo',
        Jueves: 'Activo',
        Viernes: 'Activo',
        Sábado: 'Activo'
      }
    }));
  }

  toggleEstado(especialidad: string, dia: string) {
    // Cambiar el estado entre 'Activo' e 'Inactivo'
    const especialidadEncontrada = this.especialidades.find(e => e.nombre === especialidad);
    if (especialidadEncontrada) {
      especialidadEncontrada.dias[dia] = especialidadEncontrada.dias[dia] === 'Activo' ? 'Inactivo' : 'Activo';
    }
  }

  actualizarTurnos(){
    
  }
}


