import { Injectable } from '@angular/core';
import { Turno } from '../interfaces/turno';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  
  constructor(private firestore:Firestore){}

  async guardarTurno(turno: Turno): Promise<void> {
    const turnosCollection = collection(this.firestore, 'turnos');
    try {
      await addDoc(turnosCollection, turno);
      console.log('Turno guardado con éxito!');
    } catch (error) {
      console.error('Error al guardar el turno:', error);
    }
  }


}
