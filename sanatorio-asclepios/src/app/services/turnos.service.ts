import { Injectable } from '@angular/core';
import { Turno } from '../interfaces/turno';
import { addDoc, collection, doc, Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  
  constructor(private firestore:Firestore){}

  async getTurnos(): Promise<Turno[]> {
    const turnosRef = collection(this.firestore, 'turnos');
    try {
      const querySnapshot = await getDocs(turnosRef);
      const turnos: Turno[] = [];
      querySnapshot.forEach((doc) => {
        const turno = doc.data() as Turno;
        turno.id = doc.id;
        turnos.push(turno);
      });
      return turnos;
    } catch (error) {
      console.error('Error al obtener los turnos:', error);
      return [];
    }
  }

  async guardarTurno(turno: Turno): Promise<void> {
    const turnosCollection = collection(this.firestore, 'turnos');
    try {
      await addDoc(turnosCollection, turno);
      console.log('Turno guardado con éxito!');
    } catch (error) {
      console.error('Error al guardar el turno:', error);
    }
  }

  async verificarTurnosNoOcupados(fechaSeleccionada: string, turnosGenerados: string[]): Promise<string[]> {
    const turnosLibres: string[] = [];

    const fechaFirestore = fechaSeleccionada;
    
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(turnosRef, where('fecha', '==', fechaFirestore));
    const querySnapshot = await getDocs(q);

    const turnosOcupados: Set<string> = new Set();
    querySnapshot.forEach((doc) => {
      const turno = doc.data()['inicio'];
      if (doc.data()['otorgado'] === true && 
      doc.data()['estado'] !== 'cancelado' &&
      doc.data()['estado'] !== 'rechazado') {
        turnosOcupados.add(turno);
      }
    });

    turnosGenerados.forEach((turno) => {
      if (!turnosOcupados.has(turno)) {
        turnosLibres.push(turno);
      }
    });

    return turnosLibres;
  }

  async getTurnosPorPaciente(pacienteEmail: string): Promise<Turno[]> {
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(turnosRef, where('paciente.email', '==', pacienteEmail));
    const querySnapshot = await getDocs(q);
  
    const turnos: Turno[] = [];
    querySnapshot.forEach((doc) => {
      const turno = doc.data() as Turno;
      turno.id = doc.id;
      turnos.push(turno);
    });
  
    return turnos;
  }

  async getTurnosPorEspecialista(especialistaEmail: string): Promise<Turno[]> {
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(turnosRef, where('especialista.email', '==', especialistaEmail));
    const querySnapshot = await getDocs(q);
  
    const turnos: Turno[] = [];
    querySnapshot.forEach((doc) => {
      const turno = doc.data() as Turno;
      turno.id = doc.id;
      turnos.push(turno);
    });
  
    return turnos;
  }

  async actualizarTurno(turno: Turno): Promise<void> {
    if (!turno.id) {
      console.error('El turno no tiene un identificador válido.');
      return;
    }
  
    const turnoDoc = doc(this.firestore, 'turnos', turno.id);
    try {
      await updateDoc(turnoDoc, { ...turno });
      console.log('Turno actualizado con éxito.');
    } catch (error) {
      console.error('Error al actualizar el turno:', error);
    }
  }



}
