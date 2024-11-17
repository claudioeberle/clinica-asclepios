import { Injectable } from '@angular/core';
import { collection, collectionData, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { firstValueFrom, map, Observable } from 'rxjs';
import { Disponibilidad } from '../interfaces/disponibilidad';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService {

  constructor(private firestore:Firestore) {}

  getAllDisponibilidades(): Observable<Disponibilidad[]> {
    const col = collection(this.firestore, 'disponibilidad');
    return collectionData(col, { idField: 'id' }) as Observable<Disponibilidad[]>;
  }

  getDisponibilidadByEmail(email: string): Observable<Disponibilidad | undefined> {
    return this.getAllDisponibilidades().pipe(
      map((dataArray: Disponibilidad[]) => {
        return dataArray.find((disponibilidad) => disponibilidad.email === email);
      })
    );
  }

  async actualizarDisponibilidad(email: string, disponibilidad: any): Promise<void> {
    const disponibilidadConEmail = { 
      email: email, 
      disponibilidad: disponibilidad
    };
    
    const dispoRef = doc(this.firestore, `disponibilidad/${email}`);
    try {
      await setDoc(dispoRef, disponibilidadConEmail, { merge: true });
      console.log("Disponibilidad actualizada correctamente.");
    } catch (error) {
      console.error("Error al actualizar disponibilidad: ", error);
      throw error;
    }
  }
}
