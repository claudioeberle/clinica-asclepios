import { Injectable } from '@angular/core';
import { historiaClinica } from '../interfaces/historiaClinica';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class HistoriaClinicaService {

  constructor(private firestore:Firestore) { }

  async guardarHistoriaClinica(historia: historiaClinica): Promise<void> {
    try {
      const historiaClinicaCollection = collection(this.firestore, 'historias-clinicas');
      await addDoc(historiaClinicaCollection, historia);
    } catch (error) {
      console.error('Error al guardar la historia clínica:', error);
      throw error;
    }
  }
}
