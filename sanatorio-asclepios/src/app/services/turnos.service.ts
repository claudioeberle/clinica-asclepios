import { Injectable } from '@angular/core';
import { Turno } from '../interfaces/turno';
import { addDoc, collection, doc, Firestore, getDocs, query, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { historiaClinica } from '../interfaces/historiaClinica';

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

  async getHistoriaClinicaCompleta(email: string): Promise<historiaClinica[]> {

    const turnos: Turno[] = await this.getTurnosPorPaciente(email);
    const historiasClinicas: historiaClinica[] = turnos
      .filter(turno => turno.historiaClinica !== null)
      .map(turno => turno.historiaClinica as historiaClinica);
    
    historiasClinicas.forEach(historia => {
      if (historia.fecha_atencion instanceof Timestamp) {
        historia.fecha_atencion = historia.fecha_atencion.toDate();
      }
    });
    
    historiasClinicas.sort((a, b) => {
      const fechaA = new Date(a.fecha_atencion).getTime();
      const fechaB = new Date(b.fecha_atencion).getTime();
      return fechaB - fechaA;
    });
  
    return historiasClinicas;
  }

  async contarTurnosPorEspecialidad(especialidad?: string): Promise<{ [key: string]: number }> {
    const turnosRef = collection(this.firestore, 'turnos');
    let q;
  
    if (especialidad) {
      q = query(turnosRef, where('especialidad', '==', especialidad));
    } else {
      q = query(turnosRef);
    }
  
    try {
      const querySnapshot = await getDocs(q);
      const turnos: Turno[] = [];
  
      querySnapshot.forEach((doc) => {
        const turno = doc.data() as Turno;
        turno.id = doc.id;
        turnos.push(turno);
      });
  
      const especialidadesCount: { [key: string]: number } = {};
  
      turnos.forEach(turno => {
        const especialidad = turno.especialidad;
        if (especialidad) {
          if (!especialidadesCount[especialidad]) {
            especialidadesCount[especialidad] = 0;
          }
          especialidadesCount[especialidad]++;
        }
      });
  
      return especialidadesCount;
  
    } catch (error) {
      console.error('Error al contar los turnos por especialidad:', error);
      return {};
    }
  }

  async contarTurnosPorFecha(fecha?: string): Promise<{ [key: string]: number }> {
    const turnosRef = collection(this.firestore, 'turnos');
    let q;
  
    if (fecha) {
      const fechaConvertida = fecha;
      q = query(turnosRef, where('fecha', '==', fechaConvertida));
    } else {
      q = query(turnosRef);
    }
  
    try {
      const querySnapshot = await getDocs(q);
      const turnos: Turno[] = [];
  
      querySnapshot.forEach((doc) => {
        const turno = doc.data() as Turno;
        turno.id = doc.id;
        turnos.push(turno);
      });
  
      const fechasCount: { [key: string]: number } = {};
      turnos.forEach(turno => {
        const fechaTurno = turno.fecha || '';
        if (fechaTurno) {
          if (!fechasCount[fechaTurno]) {
            fechasCount[fechaTurno] = 0;
          }
          fechasCount[fechaTurno]++;
        }
      });
      return fechasCount;
  
    } catch (error) {
      console.error('Error al contar los turnos por fecha:', error);
      return {};
    }
  }
  
  async contarTurnosPorEspecialista(
    fechaDesde: string = '',
    fechaHasta: string = '',
    estadoTurno: string = ''
  ): Promise<{ [key: string]: number }> {
    const turnosRef = collection(this.firestore, 'turnos');
    let q = query(turnosRef);
  
    if (estadoTurno && estadoTurno.toLowerCase() !== 'todos') {
      q = query(q, where('estado', '==', estadoTurno));
    }
  
    try {
      const querySnapshot = await getDocs(q);
      const turnos: Turno[] = [];
  
      querySnapshot.forEach((doc) => {
        const turno = doc.data() as Turno;
        turno.id = doc.id;
        turnos.push(turno);
      });
  
      const fechaDesdeDate = fechaDesde ? this.convertirFechaFormatoAFechaPicker(fechaDesde) : null;
      const fechaHastaDate = fechaHasta ? this.convertirFechaFormatoAFechaPicker(fechaHasta) : null;
      console.log(fechaDesdeDate);
      console.log(fechaHastaDate);

      const turnosFiltrados = turnos.filter((turno) => {
        if (turno.fecha) {
          const fechaTurno = this.convertirFechaFormatoAFecha(turno.fecha);
          console.log(fechaTurno);
          if (
            (fechaDesdeDate && fechaTurno < fechaDesdeDate) ||
            (fechaHastaDate && fechaTurno > fechaHastaDate)
          ) {
            return false;
          }
        }
        return true;
      });
  
      const turnosPorEspecialista: { [key: string]: number } = {};
      turnosFiltrados.forEach((turno) => {
        const especialista = turno.especialista;
  
        if (especialista && especialista.email && especialista.nombre && especialista.apellido) {
          const claveEspecialista = `${especialista.nombre} ${especialista.apellido}`;
  
          if (!turnosPorEspecialista[claveEspecialista]) {
            turnosPorEspecialista[claveEspecialista] = 0;
          }
          turnosPorEspecialista[claveEspecialista]++;
        }
      });
  
      return turnosPorEspecialista;
    } catch (error) {
      console.error('Error al contar los turnos por especialista:', error);
      return {};
    }
  }
  
  convertirFechaFormatoAFecha(fecha: string): Date {
    const partes = fecha.split('/');
    if (partes.length === 3) {
      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const año = parseInt(partes[2], 10);
      return new Date(año, mes, dia);
    }
    throw new Error(`Formato de fecha inválido: ${fecha}`);
  }

  convertirFechaFormatoAFechaPicker(fecha: string): Date {
    const partes = fecha.split('-');
    if (partes.length === 3) {
      const dia = parseInt(partes[2], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const año = parseInt(partes[0], 10);
      return new Date(año, mes, dia);
    }
    throw new Error(`Formato de fecha inválido: ${fecha}`);
  }
  


  
  



}
