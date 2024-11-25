import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
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

  async getLogs(accion: string): Promise<Log[]> {
    const logsRef = collection(this.firestore, 'logs');
    const q = query(logsRef, where('accion', '==', accion));
    const querySnapshot = await getDocs(q);
    
    const logs: Log[] = [];
    querySnapshot.forEach((doc) => {
      logs.push(doc.data() as Log);
    });
    return logs;
  }


}
