import { Injectable } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private firestore:Firestore) { }

  getUsuariosId(){
    let col = collection(this.firestore, 'usuarios');
    return collectionData(col, { idField: 'id' });
  }
}
