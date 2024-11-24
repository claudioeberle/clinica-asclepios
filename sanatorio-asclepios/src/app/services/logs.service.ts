import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { Log } from '../interfaces/log';

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  constructor(private firestore:Firestore) {}

  async guardarLog(log:Log){
    const turnosCollection = collection(this.firestore, 'logs');
    try {
      await addDoc(turnosCollection, log);
      console.log('Log guardado.');
    } catch (error) {
      console.error('Error el guardar log:', error);
    }
  }


}
