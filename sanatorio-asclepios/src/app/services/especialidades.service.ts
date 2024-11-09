import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { especialidad } from '../interfaces/especialidad';
import Swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EspecialidadesService {

  public especialidadesCollection:any[] = [];
  
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
    //dataObservable.subscribe(data => console.log('Data from Firestore:', data));
    return dataObservable;
  }

  async agregarEspecialidad(nuevaE: string) {
    try {
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

    } catch (e) {
      console.error("Error al agregar la especialidad: ", e);
      Swal.fire({
        title: "Error al guardar nueva especialidad",
        text: "No se pudo guardar la especialidad " + nuevaE,
        icon: "error"
      });
    }
  }

  async obtenerEspecialidadesPorEmail(email: string): Promise<string[]> {
    try {
      const col = collection(this.firestore, 'esp-esp');
      const q = query(col, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      const especialidades: string[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data['especialidad']) {
          especialidades.push(data['especialidad']);
        }
      });

      return especialidades;
      
    } catch (e) {
      console.error("Error al obtener especialidades: ", e);
      return [];
    }
  }

}
