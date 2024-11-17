import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { especialidad } from '../interfaces/especialidad';
import Swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { firstValueFrom, Observable } from 'rxjs';
import { usuario } from '../interfaces/usuario';


@Injectable({
  providedIn: 'root'
})
export class EspecialidadesService {

  public especialidadesCollection:any[] = [];
  public especialidadesXmail:string[] = [];
  
  constructor(private firestore:Firestore) {

    this.getAllEspecialidades().subscribe(especialidades => {
      this.especialidadesCollection = especialidades;
    });
  }

  getEspecialidades(): Observable<any[]> {
    const especialidadesCollection = collection(this.firestore, 'especialidades');
    return collectionData(especialidadesCollection, { idField: 'id' }) as Observable<any[]>;
  }
  
  getAllEspecialidades(){
    const col = collection(this.firestore, 'especialidades');
    const dataObservable = collectionData(col);
    return dataObservable;
  }

  async agregarEspecialidad(nuevaE: string) {
    try {
      nuevaE = nuevaE.trim().toLowerCase();
      nuevaE = nuevaE.charAt(0).toUpperCase() + nuevaE.slice(1);
  
      const col = collection(this.firestore, 'especialidades');
      const q = query(col, where("nombre", "==", nuevaE));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        Swal.fire({
          title: "Especialidad ya existe",
          text: "La especialidad " + nuevaE + " ya está registrada.",
          icon: "info"
        });
        return;
      }
  
      const docRef = await addDoc(col, { nombre: nuevaE });
      console.log("Especialidad agregada con ID: ", docRef.id);
      Swal.fire({
        title: "Especialidad guardada",
        text: "La especialidad " + nuevaE + " ha sido guardada correctamente.",
        icon: "success"
      });
  
    } catch (error) {
      console.error("Error al agregar la especialidad: ", error);
      Swal.fire({
        title: "Error al guardar nueva especialidad",
        text: "No se pudo guardar la especialidad " + nuevaE,
        icon: "error"
      });
    }
  }
  

  async obtenerEspecialidadesPorEmail(email: string): Promise<string[]> {
    try {
      const col = collection(this.firestore, 'usuarios');
      const dataObservable = collectionData(col, { idField: 'id' }) as Observable<usuario[]>;
  
      const dataArray: usuario[] = await firstValueFrom(dataObservable);
  
      const especialidades = dataArray
        .filter(user => user.email === email && user.especialidad)
        .flatMap(user => user.especialidad.split(',').map(e => e.trim()));
  
      console.log('Especialidades obtenidas:', especialidades);
      return especialidades;
  
    } catch (error) {
      console.error("Error al obtener especialidades:", error);
      return [];
    }
  }
}
