import { Injectable } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { TurnoCreado } from '../interfaces/turno-creado';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TurnosCreadosService {
  
  turnosCreados: TurnoCreado[] = [];

  constructor(private firestore: Firestore) {
    this.GetTurnosCreados().subscribe(turnos => {
      this.turnosCreados = turnos;
    });
  }

  GetTurnosCreados(): Observable<TurnoCreado[]> {
    const col = collection(this.firestore, 'turnos-creados');
    return collectionData(col, { idField: 'id' }) as Observable<TurnoCreado[]>;
  }

  EsTurnoCreado(fecha: Date): boolean {
    const turno = this.turnosCreados.find(t => 
      new Date(t.fecha).toDateString() === fecha.toDateString()
    );
    return turno ? turno.creado : false;
  }
}