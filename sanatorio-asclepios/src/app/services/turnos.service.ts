import { Injectable } from '@angular/core';
import { usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  
  obtenerDiasDisponibles(especialista: usuario, especialidad: string): Date[] {
    // Devuelve un arreglo con las fechas disponibles (Ejemplo estático)
    return [new Date(), new Date(Date.now() + 86400000)];
  }

  obtenerTurnosDisponibles(especialista: usuario, especialidad: string, dia: Date): string[] {
    // Devuelve un arreglo de horarios disponibles (Ejemplo estático)
    return ['10:00 AM', '11:00 AM', '12:00 PM'];
  }
}
