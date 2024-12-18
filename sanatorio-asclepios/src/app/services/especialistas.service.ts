import { Injectable } from '@angular/core';
import { collection, collectionData, Firestore, query, where } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { map, Observable } from 'rxjs';
import { usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class EspecialistasService {

  allEspecialistas: any[] = [];

  constructor(private firestore:Firestore, private authService:AuthService) { }

  GetAllEspecialistas(): Observable<usuario[]> {
    return this.authService.getAllUsers().pipe(
      map((usuarios) => usuarios.filter(usuario => usuario.esEspecialista === true))
    );
  }

  GetEspecialistasByEspecialidad(especialidad: string): Observable<usuario[]> {
    return this.GetAllEspecialistas().pipe(
      map((especialistas) =>
        especialistas.filter((especialista) => 
          especialista.especialidad.split(',').map((e) => e.trim().toLowerCase()).includes(especialidad.toLowerCase())
        )
      )
    );
  }

  getEspecialistasPorEspecialidad(especialidad: string): Observable<any[]> {
    const especialistasCollection = collection(this.firestore, 'usuarios');
    const q = query(especialistasCollection, where('especialidad', 'array-contains', especialidad));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

}
